import path from "path"
import type { NextApiRequest, NextApiResponse } from "next"
import { VectorDBQAChain } from "langchain/chains"
import { OpenAIEmbeddings } from "langchain/embeddings"
import { OpenAI } from "langchain/llms"
import { HNSWLib } from "langchain/vectorstores"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const dir = path.resolve(process.cwd(), "data")
  const model = new OpenAI({
    openAIApiKey: process.env.OPEN_API_KEY,
  })
  const vectorStore = await HNSWLib.load(
    dir,
    new OpenAIEmbeddings({
      openAIApiKey: process.env.OPEN_API_KEY,
    })
  )
  const chain = VectorDBQAChain.fromLLM(model, vectorStore)

  const response = await chain.call({
    query: "What change are made to the pds",
  })

  res.status(200).json(response)
}
