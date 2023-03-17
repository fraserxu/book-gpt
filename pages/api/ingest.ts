import type { NextApiRequest, NextApiResponse, PageConfig } from "next"
import { PineconeClient } from "@pinecone-database/pinecone"
import formidable from "formidable"
import { Document } from "langchain/document"
import { OpenAIEmbeddings } from "langchain/embeddings"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { PineconeStore } from "langchain/vectorstores"

import { fileConsumer, formidablePromise } from "@/lib/formidable"
import { getTextContentFromPDF } from "@/lib/pdf"
import { chunk } from "@/lib/utils"

const formidableConfig = {
  keepExtensions: true,
  maxFileSize: 10_000_000,
  maxFieldsSize: 10_000_000,
  maxFields: 7,
  allowEmptyFiles: false,
  multiples: true,
}

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const endBuffers: {
    [filename: string]: Buffer
  } = {}

  const { fields, files } = await formidablePromise(req, {
    ...formidableConfig,
    // consume this, otherwise formidable tries to save the file to disk
    fileWriteStreamHandler: (file) => fileConsumer(file, endBuffers),
  })

  const openaiApiKey = fields["openai-api-key"]
  const pineconeEnvironment = fields["pinecone-environment"]
  const pineconeIndex = fields["pinecone-index"]
  const pineconeApiKey = fields["pinecone-api-key"]

  const docs = await Promise.all(
    Object.values(files).map(async (fileObj: formidable.file) => {
      let fileText = ""
      const fileData = endBuffers[fileObj.newFilename]
      switch (fileObj.mimetype) {
        case "text/plain":
          fileText = fileData.toString()
          break
        case "application/pdf":
          fileText = await getTextContentFromPDF(fileData)
          break
        case "application/octet-stream":
          fileText = fileData.toString()
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
    })
  )
  const flatDocs = docs.flat()

  try {
    const pinecone = new PineconeClient()
    await pinecone.init({
      environment: pineconeEnvironment,
      apiKey: pineconeApiKey,
    })

    const index = pinecone.Index(pineconeIndex)
    const chunkSize = 100
    const chunks = chunk(flatDocs, chunkSize)

    await Promise.all(
      chunks.map((chunk) => {
        return PineconeStore.fromDocuments(
          index,
          chunk,
          new OpenAIEmbeddings({
            modelName: "text-embedding-ada-002",
            openAIApiKey: openaiApiKey,
          })
        )
      })
    )

    res.status(200).json({})
  } catch (e) {
    res.status(500).json({ error: e.message || "Unknown error." })
  }
}

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
}

export default handler
