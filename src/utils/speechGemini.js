const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai")
const { GoogleAIFileManager } = require("@google/generative-ai/server")

module.exports = speechGemini = async (systemPrompt, audioFilePath) => {
  const fileManager = new GoogleAIFileManager(process.env.GEMINI)

  const audioFile = await fileManager.uploadFile(audioFilePath, {
    mimeType: "audio/mp3",
  })

  const genAI = new GoogleGenerativeAI(process.env.GEMINI)
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  })

  const result = await model.generateContent([
    {
      fileData: {
        mimeType: audioFile.file.mimeType,
        fileUri: audioFile.file.uri
      }
    },
    { text: systemPrompt },
  ])

  setTimeout(async () => {
    await fileManager.deleteFile(audioFile.file.uri)
  }, 1000 * 60 * 5)

  return result.response.text()
}