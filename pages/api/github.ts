import type { NextApiRequest, NextApiResponse } from "next"
import { Document } from "langchain/document"
import { OpenAIEmbeddings } from "langchain/embeddings"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { PineconeStore } from "langchain/vectorstores"

import { fetchContentFromGithubUrl } from "@/lib/github"
import { createPineconeIndex } from "@/lib/pinecone"
import { chunk } from "@/lib/utils"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { credentials, githubUrl } = req.body

  const contents = await fetchContentFromGithubUrl(
    githubUrl,
    credentials.githubPersonalToken
  )
  const contentChunks = await Promise.all(
    contents.map(async (content) => {
      const rawDocs = new Document({ pageContent: content })
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      })
      return await textSplitter.splitDocuments([rawDocs])
    })
  )

  const flatDocs = contentChunks.flat()

  try {
    const index = await createPineconeIndex({
      pineconeApiKey: credentials.pineconeApiKey,
      pineconeEnvironment: credentials.pineconeEnvironment,
      pineconeIndexName: credentials.pineconeIndex,
    })
    const chunkSize = 100
    const chunks = chunk(flatDocs, chunkSize)

    await Promise.all(
      chunks.map((chunk) => {
        return PineconeStore.fromDocuments(
          index,
          chunk,
          new OpenAIEmbeddings({
            modelName: "text-embedding-ada-002",
            openAIApiKey: credentials.openaiApiKey,
          })
        )
      })
    )

    res.status(200).json({})
  } catch (e) {
    res.status(500).json({ error: e.message || "Unknown error." })
  }
}
