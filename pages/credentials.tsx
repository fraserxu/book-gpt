import React from "react"
import Head from "next/head"
import Image from "next/image"
import Link from "next/link"
import {
  useCredentials,
  useCredentialsDispatch,
} from "@/context/credentials-context"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { FileKey } from "lucide-react"

import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CredentailsPage() {
  const credentials = useCredentials()
  const dispatch = useCredentialsDispatch()

  const handleOpenaiApiKeyChange = (e) => {
    dispatch({
      type: "added-openai-api-key",
      openaiApiKey: e.target.value,
    })
  }
  const handlePineconeApiKeyChange = (e) => {
    dispatch({
      type: "added-pinecone-api-key",
      pineconeApiKey: e.target.value,
    })
  }

  return (
    <Layout>
      <Head>
        <title>Credentials</title>
        <meta name="description" content="Add credentials" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className="container flex justify-items-stretch gap-6 pt-6 pb-8 md:py-10">
        <div className="flex min-w-[500px] flex-col items-start gap-2 ">
          <h2 className="mt-10 scroll-m-20 pb-2 text-2xl font-semibold tracking-tight transition-colors first:mt-0">
            Add credentials
          </h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileKey className="mr-2 h-4 w-4" />
                Add Credentials
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>Add credentials</DialogTitle>
                <DialogDescription>
                  We will need these credentials in order to making API calls to
                  OpenAI and Pinecone. Your credentials will be not be stored
                  anywhere in the server.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="openai-api-key" className="text-right">
                    OpenAI API Key
                  </Label>
                  <Input
                    id="openai-api-key"
                    value={credentials.openaiApiKey}
                    placeholder="sk-***************************"
                    className="col-span-3"
                    onChange={handleOpenaiApiKeyChange}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="pinecone-api-key" className="text-right">
                    Pinecone API Key
                  </Label>
                  <Input
                    id="pinecone-api-key"
                    value={credentials.pineconeApiKey}
                    placeholder="*****-****-****"
                    className="col-span-3"
                    onChange={handlePineconeApiKeyChange}
                  />
                </div>
              </div>
              <DialogPrimitive.Close asChild>
                <Button>Save changes</Button>
              </DialogPrimitive.Close>
            </DialogContent>
          </Dialog>

          <div>
            <h3 className="mt-10 scroll-m-20 pb-2 text-xl font-semibold tracking-tight transition-colors first:mt-0">
              Why need credentials?
            </h3>
            <p>
              This app use OpenAI API to do completion, embedding, and use
              Pinecone as a vector store to index and search doc. Both of them
              are not free. The code is open source, your credentials will not
              be saved on the server.
            </p>
            <p>
              If you are a developer, ideally you want to host this app yourself
              and pass credentials as environment variable.
            </p>
          </div>

          <div>
            <h3 className="mt-10 scroll-m-20 pb-2 text-xl font-semibold tracking-tight transition-colors first:mt-0">
              How to add credentials?
            </h3>
            <ol className="p-4">
              <li>
                1. Create an API keys from{" "}
                <Link
                  className="cursor-pointer text-blue-500 hover:text-blue-700 hover:underline"
                  href="https://platform.openai.com/account/api-keys"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open AI
                </Link>
                <Image
                  className="p-4"
                  src="/screenshot/openai-api-key.png"
                  alt="OpenAI API Key"
                  width={500}
                  height={500}
                />
              </li>
              <li>
                2. Create an API key from{" "}
                <Link
                  className="cursor-pointer text-blue-500 hover:text-blue-700 hover:underline"
                  href="https://app.pinecone.io/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Pinecone
                </Link>
                <Image
                  className="p-4"
                  src="/screenshot/pinecone-api-key.png"
                  alt="OpenAI API Key"
                  width={500}
                  height={500}
                />
              </li>
              <li>
                3. Create a index with the following settings{" "}
                <Image
                  className="p-4"
                  src="/screenshot/pinecone-index.png"
                  alt="Create a new index in Pinecone"
                  width={500}
                  height={500}
                />
              </li>
            </ol>
          </div>
        </div>
      </section>
    </Layout>
  )
}
