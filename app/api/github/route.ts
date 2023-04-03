import { NextResponse } from "next/server"
import { Document } from "langchain/document"
import { OpenAIEmbeddings } from "langchain/embeddings"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { PineconeStore } from "langchain/vectorstores"

import { fetchContentFromGithubUrl } from "@/lib/github"
import { createPineconeIndex } from "@/lib/pinecone"
import { chunk } from "@/lib/utils"

export async function POST(req: Request) {
  const body = await req.json()
  const { credentials, githubUrl } = body

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

    return NextResponse.json({})
  } catch (e) {
    return NextResponse.json({ error: e.message || "Unknown error." })
  }
}
