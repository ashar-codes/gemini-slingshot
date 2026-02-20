import { GoogleGenAI } from "@google/genai"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { imageBase64 } = req.body

  const ai = new GoogleGenAI({
    apiKey: process.env.API_KEY,
  })

  const cleanBase64 = imageBase64.replace(
    /^data:image\/(png|jpeg|jpg);base64,/,
    ""
  )

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { text: "Analyze and return JSON strategy." },
        {
          inlineData: {
            mimeType: "image/png",
            data: cleanBase64,
          },
        },
      ],
    },
  })

  return res.status(200).json(JSON.parse(response.text || "{}"))
}
