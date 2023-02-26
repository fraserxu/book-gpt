import React, { useCallback, useState } from "react"
import Head from "next/head"
import { Loader2, MessageCircle, Send, UploadCloud } from "lucide-react"
import { useDropzone } from "react-dropzone"

import { siteConfig } from "@/config/site"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

const DEFAULT_QUESTION = "what is this about?"

export default function IndexPage() {
  const [files, setFiles] = useState(null)
  const [question, setQuestion] = useState(DEFAULT_QUESTION)
  const [answer, setAnswer] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isAsking, setIsAsking] = useState(false)

  const handleQueryChange = (e) => {
    setQuestion(e.target.value)
  }

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles)
  }, [])

  const handleUpload = useCallback(async () => {
    const formData = new FormData()
    Array.from(files).forEach((file) => {
      formData.append("file", file)
    })

    setIsUploading(true)
    await fetch("/api/ingest", {
      method: "post",
      body: formData,
    })
    setIsUploading(false)
  }, [files])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt", ".md"],
    },
    multiple: false,
    maxFiles: 1,
  })

  const handleSubmit = useCallback(async () => {
    setIsAsking(true)
    const response = await fetch("/api/chat", {
      body: JSON.stringify({ question }),
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
    })
    const answer = await response.json()

    setAnswer(answer.text)
    setIsAsking(false)
  }, [question])

  return (
    <Layout>
      <Head>
        <title>{siteConfig.name}</title>
        <meta name="description" content={siteConfig.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className="container flex justify-items-stretch gap-6 pt-6 pb-8 md:py-10">
        <div className="flex min-w-[500px] flex-col items-start gap-2 ">
          <h2 className="mt-10 scroll-m-20 pb-2 text-2xl font-semibold tracking-tight transition-colors first:mt-0">
            Upload a book
          </h2>
          <div
            className="min-w-full rounded-md border border-slate-200 p-0 dark:border-slate-700"
            {...getRootProps()}
          >
            <div className="flex min-h-[150px] cursor-pointer items-center justify-center p-10">
              <input {...getInputProps()} />

              {files ? (
                <p>{files[0].name}</p>
              ) : (
                <>
                  {isDragActive ? (
                    <p>Drop the files here ...</p>
                  ) : (
                    <p>
                      Drag 'n' drop a file(.pdf, .txt) here, or click to select
                      file
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="self-start">
            <Button disabled={!files || isUploading} onClick={handleUpload}>
              {!isUploading ? (
                <UploadCloud className="mr-2 h-4 w-4" />
              ) : (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Upload
            </Button>
          </div>
        </div>

        <div className="flex grow flex-col items-start gap-2">
          <h2 className="mt-10 scroll-m-20 pb-2 text-2xl font-semibold tracking-tight transition-colors first:mt-0">
            Ask me anything about the book
          </h2>
          {/* <Textarea
            id="query"
            value={question}
            placeholder={DEFAULT_QUESTION}
            onChange={handleQueryChange}
            className="w-full rounded border border-gray-400 py-2 px-3 text-gray-700 focus:border-gray-500 focus:bg-white focus:outline-none"
            rows={10}
          />
          <div className="self-end">
            <Button onClick={handleSubmit}>
              {!isAsking ? (
                <MessageCircle className="mr-2 h-4 w-4" />
              ) : (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Submit
            </Button>
          </div>

          {answer && <div>{answer}</div>} */}

          <div className="w-full ">
            <div className="scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch flex flex-col space-y-4 overflow-y-auto p-3">
              <div className="chat-message">
                <div className="flex items-end">
                  <div className="order-2 mx-2 flex max-w-xs flex-col items-start space-y-2 text-xs">
                    <div>
                      <span className="inline-block rounded-lg rounded-bl-none bg-gray-300 px-4 py-2 text-gray-600">
                        Can be verified on any platform using docker
                      </span>
                    </div>
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1549078642-b2ba4bda0cdb?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=3&amp;w=144&amp;h=144"
                    alt="My profile"
                    className="order-1 h-6 w-6 rounded-full"
                  />
                </div>
              </div>
              <div className="chat-message">
                <div className="flex items-end justify-end">
                  <div className="order-1 mx-2 flex max-w-xs flex-col items-end space-y-2 text-xs">
                    <div>
                      <span className="inline-block rounded-lg rounded-br-none bg-blue-600 px-4 py-2 text-white ">
                        Your error message says permission denied, npm global
                        installs must be given root privileges.
                      </span>
                    </div>
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1590031905470-a1a1feacbb0b?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=3&amp;w=144&amp;h=144"
                    alt="My profile"
                    className="order-2 h-6 w-6 rounded-full"
                  />
                </div>
              </div>
              <div className="chat-message">
                <div className="flex items-end">
                  <div className="order-2 mx-2 flex max-w-xs flex-col items-start space-y-2 text-xs">
                    <div>
                      <span className="inline-block rounded-lg rounded-bl-none bg-gray-300 px-4 py-2 text-gray-600">
                        Can be verified on any platform using docker
                      </span>
                    </div>
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1549078642-b2ba4bda0cdb?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=3&amp;w=144&amp;h=144"
                    alt="My profile"
                    className="order-1 h-6 w-6 rounded-full"
                  />
                </div>
              </div>
              <div className="chat-message">
                <div className="flex items-end justify-end">
                  <div className="order-1 mx-2 flex max-w-xs flex-col items-end space-y-2 text-xs">
                    <div>
                      <span className="inline-block rounded-lg rounded-br-none bg-blue-600 px-4 py-2 text-white ">
                        Your error message says permission denied, npm global
                        installs must be given root privileges.
                      </span>
                    </div>
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1590031905470-a1a1feacbb0b?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=3&amp;w=144&amp;h=144"
                    alt="My profile"
                    className="order-2 h-6 w-6 rounded-full"
                  />
                </div>
              </div>
            </div>

            <div className="mb-2 border-t-2 border-gray-200 pt-4 sm:mb-0">
              <div className="relative flex">
                <input
                  type="text"
                  placeholder="Ask me anything!"
                  className="mr-2 w-full rounded-md bg-gray-200 pl-2 text-gray-600 placeholder:text-gray-600 focus:outline-none focus:placeholder:text-gray-400"
                />
                <div className="items-center sm:flex">
                  <Button className="inline-flex items-center justify-center transition duration-500 ease-in-out focus:outline-none">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
