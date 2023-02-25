import { Writable } from "stream"
import type { NextApiRequest, NextApiResponse, PageConfig } from "next"
import { PineconeClient } from "@pinecone-database/pinecone"
import formidable from "formidable"
import { Document } from "langchain/document"
import { OpenAIEmbeddings } from "langchain/embeddings"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { PineconeStore } from "langchain/vectorstores"

import { getTextContentFromPDF } from "@/lib/pdf"

const formidableConfig = {
  keepExtensions: true,
  maxFileSize: 10_000_000,
  maxFieldsSize: 10_000_000,
  maxFields: 7,
  allowEmptyFiles: false,
  multiples: false,
}

function formidablePromise(
  req: NextApiRequest,
  opts?: Parameters<typeof formidable>[0]
): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  return new Promise((accept, reject) => {
    const form = formidable(opts)

    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      return accept({ fields, files })
    })
  })
}

const fileConsumer = <T = unknown>(acc: T[]) => {
  const writable = new Writable({
    write: (chunk, _enc, next) => {
      acc.push(chunk)
      next()
    },
  })

  return writable
}

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const chunks: never[] = []

  await formidablePromise(req, {
    ...formidableConfig,
    // consume this, otherwise formidable tries to save the file to disk
    fileWriteStreamHandler: () => fileConsumer(chunks),
  })

  const pdfData = Buffer.concat(chunks)
  const pdfText = await getTextContentFromPDF(pdfData)

  const rawDocs = new Document({ pageContent: pdfText })
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  })
  const docs = textSplitter.splitDocuments([rawDocs])

  const pinecone = new PineconeClient()
  await pinecone.init({
    environment: "us-west1-gcp",
    apiKey: process.env.PINECONE_API_KEY,
  })

  const index = pinecone.Index(process.env.PINECONE_INDEX_NAME)
  await PineconeStore.fromDocuments(
    index,
    docs,
    new OpenAIEmbeddings({
      openAIApiKey: process.env.OPEN_API_KEY,
    })
  )

  res.status(200).json({})
}

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
}

export default handler
