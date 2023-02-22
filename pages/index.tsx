import React, { useCallback, useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { useDropzone } from "react-dropzone"

import { siteConfig } from "@/config/site"
import { Layout } from "@/components/layout"
import { Button, buttonVariants } from "@/components/ui/button"

export default function IndexPage() {
  const [files, setFiles] = useState(null)

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles)
  }, [])

  const handleUpload = useCallback(async () => {
    const formData = new FormData()
    Array.from(files).forEach((file) => {
      formData.append("pdf", file)
    })

    // fetch
    const response = await fetch("/api/ingest", {
      method: "post",
      body: formData,
    })
  }, [files])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
    maxFiles: 1,
  })

  return (
    <Layout>
      <Head>
        <title>{siteConfig.name}</title>
        <meta name="description" content={siteConfig.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className="container grid items-center gap-6 pt-6 pb-8 md:py-10">
        <div className="flex max-w-[900px] flex-col items-start gap-2">
          <h2 className="mt-10 scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
            Upload a book
          </h2>
          <div
            className="mt-2 rounded-md border border-slate-200 p-0 dark:border-slate-700"
            {...getRootProps()}
          >
            <div className="flex min-h-[350px] items-center justify-center p-10">
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drop the files here ...</p>
              ) : (
                <p>Drag 'n' drop some files here, or click to select files</p>
              )}
            </div>
          </div>
          <div>
            <Button onClick={handleUpload}>Upload</Button>
          </div>
        </div>
      </section>
    </Layout>
  )
}
