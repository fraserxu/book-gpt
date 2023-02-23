import type { NextApiRequest, NextApiResponse } from "next"
import { PineconeClient } from "@pinecone-database/pinecone"
import { VectorDBQAChain } from "langchain/chains"
import { OpenAIEmbeddings } from "langchain/embeddings"
import { OpenAI } from "langchain/llms"
import { PineconeStore } from "langchain/vectorstores"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // create vector store
  const pinecone = new PineconeClient()

  await pinecone.init({
    environment: "us-west1-gcp",
    apiKey: process.env.PINECONE_API_KEY,
  })

  const index = pinecone.Index("book-gpt")
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
  const chain = VectorDBQAChain.fromLLM(model, vectorStore)

  const response = await chain.call({
    query: "What change are made to the pds",
  })

  res.status(200).json(response)
}
