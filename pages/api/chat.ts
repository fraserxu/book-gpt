import type { NextApiRequest, NextApiResponse } from "next"
import { ChatVectorDBQAChain } from "langchain/chains"
import { OpenAIEmbeddings } from "langchain/embeddings"
import { OpenAI } from "langchain/llms"
import { PineconeStore } from "langchain/vectorstores"

import { createPineconeIndex } from "@/lib/pinecone"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { question, chatHistory, credentials } = req.body
  const encoder = new TextEncoder()

  try {
    // const index = await createPineconeIndex({
    //   pineconeApiKey: credentials.pineconeApiKey,
    //   pineconeEnvironment: credentials.pineconeEnvironment,
    //   pineconeIndexName: credentials.pineconeIndex,
    // })

    // const vectorStore = await PineconeStore.fromExistingIndex(
    //   index,
    //   new OpenAIEmbeddings({
    //     openAIApiKey: credentials.openaiApiKey,
    //   })
    // )

    // const model = new OpenAI({
    //   modelName: "gpt-3.5-turbo",
    //   openAIApiKey: credentials.openaiApiKey,
    // })

    // const chain = ChatVectorDBQAChain.fromLLM(model, vectorStore)

    // const response = await chain.call({
    //   question,
    //   max_tokens: 500, // todo: pick up a sensible value
    //   chat_history: chatHistory || [],
    // })

    // res.status(200).json(response)

    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder.encode(JSON.stringify({ data: "hi" })))
        controller.close()
      },
    })

    return new Response(stream, {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    })
  } catch (e) {
    res.status(500).json({ error: e.message || "Unknown error." })
  }
}
