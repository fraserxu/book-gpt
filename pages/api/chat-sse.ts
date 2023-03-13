import type { NextApiRequest, NextApiResponse } from "next"
import { PineconeClient } from "@pinecone-database/pinecone"
import { OpenAIEmbeddings } from "langchain/embeddings"
import { PineconeStore } from "langchain/vectorstores"

import { makeChain } from "./utils"

const PINECONE_INDEX_NAME = "book-gpt"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { question, chatHistory, credentials } = req.body

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    // Important to set no-transform to avoid compression, which will delay
    // writing response chunks to the client.
    // See https://github.com/vercel/next.js/issues/9965
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  })

  const sendData = (data: string) => {
    res.write(`data: ${data}\n\n`)
  }

  sendData("[START]")

  const pinecone = new PineconeClient()
  await pinecone.init({
    environment: "us-west1-gcp",
    apiKey: credentials.pineconeApiKey,
  })

  const index = pinecone.Index(PINECONE_INDEX_NAME)
  const vectorStore = await PineconeStore.fromExistingIndex(
    index,
    new OpenAIEmbeddings({
      openAIApiKey: credentials.openaiApiKey,
    })
  )

  const chain = makeChain(
    vectorStore,
    credentials.openaiApiKey,
    (token: string) => {
      sendData(JSON.stringify({ data: token }))
    }
  )

  try {
    await chain.call({
      question,
      chat_history: chatHistory || [],
    })
  } catch (e) {
    res.status(500).json({ error: e.message || "Unknown error." })
  } finally {
    sendData("[DONE]")
    res.end()
  }
}
