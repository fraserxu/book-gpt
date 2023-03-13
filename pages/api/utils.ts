import { ChatVectorDBQAChain, LLMChain, loadQAChain } from "langchain/chains"
import { OpenAI } from "langchain/llms"
import { PromptTemplate } from "langchain/prompts"
import { PineconeStore } from "langchain/vectorstores"

const CONDENSE_PROMPT =
  PromptTemplate.fromTemplate(`Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.
Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`)
const QA_PROMPT = PromptTemplate.fromTemplate(
  `You are an AI assistant to answer question about the docs user upload. Provide a conversational answer.
If you don't know the answer, just say "Hmm, I'm not sure." Don't try to make up an answer.
Question: {question}
=========
{context}
=========
Answer in text:`
)

export const makeChain = (
  vectorstore: PineconeStore,
  openaiApiKey: string,
  onTokenStream?: (token: string) => void
) => {
  const questionGenerator = new LLMChain({
    llm: new OpenAI({
      temperature: 0,
      openAIApiKey: openaiApiKey,
      modelName: "gpt-3.5-turbo",
    }),
    prompt: CONDENSE_PROMPT,
  })
  const docChain = loadQAChain(
    new OpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0,
      openAIApiKey: openaiApiKey,
      streaming: Boolean(onTokenStream),
      callbackManager: {
        handleNewToken: onTokenStream,
      },
    }),
    { prompt: QA_PROMPT }
  )

  return new ChatVectorDBQAChain({
    vectorstore,
    combineDocumentsChain: docChain,
    questionGeneratorChain: questionGenerator,
  })
}
