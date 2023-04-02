import { NextResponse } from "next/server"
import { ChatVectorDBQAChain } from "langchain/chains"
import { OpenAIEmbeddings } from "langchain/embeddings"
import { OpenAI } from "langchain/llms"
import { PineconeStore } from "langchain/vectorstores"

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

    const model = new OpenAI({
      modelName: "gpt-3.5-turbo",
      openAIApiKey: credentials.openaiApiKey,
    })

    const chain = ChatVectorDBQAChain.fromLLM(model, vectorStore)
    const response = await chain.call({
      question,
      max_tokens: 500, // todo: pick up a sensible value
      chat_history: chatHistory || [],
    })

    return NextResponse.json(response)
  } catch (e) {
    console.log(e)
    return NextResponse.json({ error: e.message || "Unknown error." })
  }
}
