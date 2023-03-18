import type { NextApiRequest, NextApiResponse } from "next"
import { PineconeClient } from "@pinecone-database/pinecone"
import { ChatVectorDBQAChain } from "langchain/chains"
import { OpenAIEmbeddings } from "langchain/embeddings"
import { OpenAI } from "langchain/llms"
import { PineconeStore } from "langchain/vectorstores"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { question, chatHistory, credentials } = req.body
  const pinecone = new PineconeClient()

  try {
    await pinecone.init({
      environment: credentials.pineconeEnvironment,
      apiKey: credentials.pineconeApiKey,
    })

    const index = pinecone.Index(credentials.pineconeIndex)
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

    res.status(200).json(response)
  } catch (e) {
    res.status(500).json({ error: e.message || "Unknown error." })
  }
}
