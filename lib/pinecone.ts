import { PineconeClient } from "@pinecone-database/pinecone"

type CreatePineconeIndexArgs = {
  pineconeApiKey: string
  pineconeEnvironment?: string
  pineconeIndexName: string
}

export const createPineconeIndex = async ({
  pineconeApiKey,
  pineconeEnvironment = "us-west1-gcp",
  pineconeIndexName,
}: CreatePineconeIndexArgs) => {
  const pinecone = new PineconeClient()
  await pinecone.init({
    environment: pineconeEnvironment,
    apiKey: pineconeApiKey,
  })

  return pinecone.Index(pineconeIndexName)
}
