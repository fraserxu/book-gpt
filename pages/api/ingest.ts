import { Writable } from "stream"
import type { NextApiRequest, NextApiResponse, PageConfig } from "next"
import formidable from "formidable"
import { Document } from "langchain/document"
import { OpenAIEmbeddings } from "langchain/embeddings"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { HNSWLib } from "langchain/vectorstores"
import { getDocument } from "pdfjs-dist"

const getTextContent = async (pdfBuffer) => {
  let text = ""

  const pdfDoc = await getDocument({ data: pdfBuffer }).promise
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map((item) => item.str).join(" ")
  }

  return text
}

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
  const pdfText = await getTextContent(pdfData)

  const rawDocs = new Document({ pageContent: pdfText })
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  })
  const docs = textSplitter.splitDocuments([rawDocs])
  const vectorStore = await HNSWLib.fromDocuments(
    docs,
    new OpenAIEmbeddings({
      openAIApiKey: process.env.OPEN_API_KEY,
    })
  )
  await vectorStore.save("data")

  res.status(200).json({
    content: pdfText,
  })
}

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
}

export default handler
