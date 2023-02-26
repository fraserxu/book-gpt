import type { NextApiRequest, NextApiResponse } from "next"
import { PineconeClient } from "@pinecone-database/pinecone"
import { ChatVectorDBQAChain, VectorDBQAChain } from "langchain/chains"
import { OpenAIEmbeddings } from "langchain/embeddings"
import { OpenAI } from "langchain/llms"
import { PineconeStore } from "langchain/vectorstores"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { question, chatHistory } = req.body
  // create vector store
  const pinecone = new PineconeClient()

  await pinecone.init({
    environment: "us-west1-gcp",
    apiKey: process.env.PINECONE_API_KEY,
  })

  const index = pinecone.Index(process.env.PINECONE_INDEX_NAME)
  const vectorStore = await PineconeStore.fromExistingIndex(
    index,
    new OpenAIEmbeddings({
      openAIApiKey: process.env.OPEN_API_KEY,
    })
  )

  // create chain
  const model = new OpenAI({
    openAIApiKey: process.env.OPEN_API_KEY,
  })
  // const chain = VectorDBQAChain.fromLLM(model, vectorStore)
  // const response = await chain.call({
  //   query: question,
  //   max_tokens: 500,
  // })

  const chain = ChatVectorDBQAChain.fromLLM(model, vectorStore)
  const response = await chain.call({
    query: question,
    max_tokens: 500,
    chat_history: chatHistory,
  })

  res.status(200).json(response)
}
