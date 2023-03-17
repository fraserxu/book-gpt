import { createContext, useContext, useEffect, useState } from "react"
import cookies from "js-cookie"

const credentials_cookie_key = "credentials"
const initialCredentials = {
  openaiApiKey: "",
  pineconeEnvironment: "",
  pineconeIndex: "book-gpt",
  pineconeApiKey: "",
  githubPersonalToken: "",
}

const CredentailsCookieContext = createContext({
  cookieValue: null,
  setAndSaveCookieValue: null,
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
