"use client"

import { createContext, useContext, useEffect, useState } from "react"
import cookies from "js-cookie"

interface ICredentailsCookieContext {
  cookieValue: {
    openaiApiKey: string
    pineconeEnvironment: string
    pineconeIndex: string
    pineconeApiKey: string
    githubPersonalToken: string
  }
  setAndSaveCookieValue: (value: any) => void
}

const credentials_cookie_key = "credentials"
const initialCredentials = {
  openaiApiKey: "",
  pineconeEnvironment: "",
  pineconeIndex: "",
  pineconeApiKey: "",
  githubPersonalToken: "",
}

const CredentailsCookieContext = createContext<ICredentailsCookieContext>({
  cookieValue: initialCredentials,
  setAndSaveCookieValue: () => {},
})

export function CredentialsCookieProvider({ children }) {
  const [cookieValue, setCookieValue] = useState(initialCredentials)

  useEffect(() => {
    const valuesFromCookie = cookies.get(credentials_cookie_key)

    if (valuesFromCookie) {
      setCookieValue(JSON.parse(valuesFromCookie))
    }
  }, [])

  const setAndSaveCookieValue = (value) => {
    cookies.set(credentials_cookie_key, JSON.stringify(value), { expires: 7 })
    setCookieValue(value)
  }

  return (
    <CredentailsCookieContext.Provider
      value={{ cookieValue, setAndSaveCookieValue }}
    >
      {children}
    </CredentailsCookieContext.Provider>
  )
}

export function useCredentialsCookie() {
  return useContext(CredentailsCookieContext)
}
