import pdfExtraction from "pdf-extraction"

export const getTextContentFromPDF = async (pdfBuffer) => {
  const { text } = await pdfExtraction(pdfBuffer)
  return text
}
