import type { NextApiRequest, NextApiResponse } from "next"
import { PineconeClient } from "@pinecone-database/pinecone"

// import { OpenAIEmbeddings } from "langchain/embeddings"
// import { PineconeStore } from "langchain/vectorstores"

// import { makeChain } from "./utils"

const PINECONE_INDEX_NAME = "book-gpt"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const encoder = new TextEncoder()
  console.log({ body: req.body })
  const { question, chatHistory, credentials } = req.body

  // res.writeHead(200, {
  //   "Content-Type": "text/event-stream",
  //   "Cache-Control": "no-cache, no-transform",
  //   Connection: "keep-alive",
  // })

  // const sendData = (data: string) => {
  //   res.write(`data: ${data}\n\n`)
  // }

  // sendData("[START]")

  const pinecone = new PineconeClient()
  await pinecone.init({
    environment: "us-west1-gcp",
    apiKey: credentials.pineconeApiKey,
  })

  const index = pinecone.Index(PINECONE_INDEX_NAME)
  // const vectorStore = await PineconeStore.fromExistingIndex(
  //   new OpenAIEmbeddings({
  //     openAIApiKey: credentials.openaiApiKey,
  //   }),
  //   {
  //     pineconeIndex: index,
  //   }
  // )

  // try {
  // await chain.call({
  //   question,
  //   chat_history: chatHistory || [],
  // })
  // } catch (e) {
  //   res.status(500).json({ error: e.message || "Unknown error." })
  // } finally {
  //   sendData("[DONE]")
  //   res.end()
  // }

  // let counter = 0

  const stream = new ReadableStream({
    async start(controller) {
      // const chain = makeChain(
      //   vectorStore,
      //   credentials.openaiApiKey,
      //   (token: string) => {
      //     console.log("counter", counter)
      //     if (counter < 2 && token === "") {
      //       console.log("start...")
      //       // this is a prefix character (i.e., "\n\n"), do nothing
      //       return;
      //     }

      //     if (counter > 2 && token === "") {
      //       console.log("end...")
      //       controller.close();
      //       return;
      //     }

      //     controller.enqueue(encoder.encode(JSON.stringify({ data: token })))
      //     counter++;
      //   }
      // )

      // try {
      //   return chain.call({
      //     question,
      //     chat_history: chatHistory || [],
      //   })
      // } catch (err) {
      //   console.error(err);
      //   // Ignore error
      // } finally {
      //   controller.close()
      // }
      controller.enqueue(encoder.encode(JSON.stringify({ data: "hi" })))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  })
}

export const config = {
  runtime: "edge",
}
