const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai")

/**
 * Inicializa el modelo de Gemini con los parámetros dados (retorna la sesión del chat, no la respuesta)
 * @param {string} systemPrompt - La instrucción con rango de Sistema para el modelo
 * @param {number} temperature - La temperatura de la respuesta (-1 para más seguridad, +1 para más aleatoriedad)
 * @param {string} history - El historial de la conversación (Opcional)
 * @returns {ChatSession} - La sesión de chat inicializada
 * @example
 * const chat = initGemini("Todas tus respuestas van en mayúscula", 1)
 * const respuesta = await chat.sendMessage("Hola, ¿cómo estás?")
 * console.log(respuesta) // Salida: "BIEN, GRACIAS. ¿Y TÚ?"
 */
module.exports = chatGemini = (systemPrompt, temperature, history) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI)
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: systemPrompt,
  })
  const generationConfig = {
    temperature: temperature || 1,
    //topP: 0.95,
    //topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain"
  }
  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ]
  if (history) {
    return model.startChat({
      history,
      generationConfig,
      safetySettings
    })
  } else {
    return model.startChat({
      generationConfig,
      safetySettings
    })
  }
}