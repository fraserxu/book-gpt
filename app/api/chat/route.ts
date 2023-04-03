import { NextResponse } from "next/server"
import { OpenAIEmbeddings } from "langchain/embeddings"
import { PineconeStore } from "langchain/vectorstores"

import { makeChain } from "@/lib/chain"
import { createPineconeIndex } from "@/lib/pinecone"

export async function POST(req: Request) {
  const body = await req.json()
  const { question, chatHistory, credentials } = body

  try {
    const index = await createPineconeIndex({
      pineconeApiKey: credentials.pineconeApiKey,
      pineconeEnvironment: credentials.pineconeEnvironment,
      pineconeIndexName: credentials.pineconeIndex,
    })

    const vectorStore = await PineconeStore.fromExistingIndex(
      index,
      new OpenAIEmbeddings({
        openAIApiKey: credentials.openaiApiKey,
      })
    )

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const chain = makeChain(
          vectorStore,
          credentials.openaiApiKey,
          (token: string) => {
            controller.enqueue(encoder.encode(token))
          }
        )

        await chain.call({
          question,
          chat_history: chatHistory || [],
        })
        controller.close()
      },
    })
    await stream
    return new Response(stream)
  } catch (e) {
    console.log(e)
    return NextResponse.json({ error: e.message || "Unknown error." })
  }
}
