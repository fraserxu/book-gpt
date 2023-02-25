import { getDocument } from "pdfjs-dist"

export const getTextContentFromPDF = async (pdfBuffer) => {
  let text = ""

  const pdfDoc = await getDocument({ data: pdfBuffer }).promise
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map((item) => item.str).join(" ")
  }

  return text
}
