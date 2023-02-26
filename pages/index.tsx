import React, { useCallback, useState } from "react"
import Head from "next/head"
import { Loader2, MessageCircle, UploadCloud } from "lucide-react"
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
          <Textarea
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

          {answer && <div>{answer}</div>}
        </div>
      </section>
    </Layout>
  )
}
