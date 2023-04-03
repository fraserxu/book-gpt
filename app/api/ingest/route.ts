import { NextResponse } from "next/server"
import { Document } from "langchain/document"
import { OpenAIEmbeddings } from "langchain/embeddings"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { PineconeStore } from "langchain/vectorstores"

import { getTextContentFromPDF } from "@/lib/pdf"
import { createPineconeIndex } from "@/lib/pinecone"
import { chunk as chunkBy } from "@/lib/utils"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const openaiApiKey = formData.get("openai-api-key") || ""
    const pineconeEnvironment = formData.get("pinecone-environment") || ""
    const pineconeIndex = formData.get("pinecone-index") || ""
    const pineconeApiKey = formData.get("pinecone-api-key") || ""
    const blobs = formData.getAll("files")

    const docs = await Promise.all(
      Object.values(blobs).map(async (blob) => {
        let fileText = ""

        if (blob instanceof Blob) {
          const arrayBuffer = await blob.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)

          switch (blob.type) {
            case "text/plain":
              fileText = buffer.toString()
              break
            case "application/pdf":
              fileText = await getTextContentFromPDF(buffer)
              break
            case "application/octet-stream":
              fileText = buffer.toString()
              break
            default:
              throw new Error("Unsupported file type.")
          }

          const rawDocs = new Document({ pageContent: fileText })
          const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
          })
          return await textSplitter.splitDocuments([rawDocs])
        } else {
          const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
          })
          return await textSplitter.splitDocuments([])
        }
      })
    )
    const flatDocs = docs.flat()

    const index = await createPineconeIndex({
      pineconeApiKey: pineconeApiKey as string,
      pineconeIndexName: pineconeIndex as string,
      pineconeEnvironment: pineconeEnvironment as string,
    })

    // await index.delete1({
    //   deleteAll: true,
    // })

    const chunkSize = 100
    const chunks = chunkBy(flatDocs, chunkSize)

    await Promise.all(
      chunks.map((chunk) => {
        return PineconeStore.fromDocuments(
          index,
          chunk,
          new OpenAIEmbeddings({
            modelName: "text-embedding-ada-002",
            openAIApiKey: openaiApiKey as string,
          })
        )
      })
    )

    return NextResponse.json({})
  } catch (e) {
    return NextResponse.json(e)
  }
}
