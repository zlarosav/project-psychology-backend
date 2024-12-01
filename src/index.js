require('dotenv').config()
const chatGemini = require('./utils/chatGemini')
const speechGemini = require('./utils/speechGemini')
const express = require('express')
const multer = require('multer')
const cors = require('cors')
const morgan = require('morgan')
const path = require('path')

const app = express()
app.use(cors()) // Añade CORS para permitir solicitudes desde el frontend
app.use(morgan('dev')) // Loguea las solicitudes en consola
app.use(express.json())

// Configuración de multer para manejar archivos
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './src/files/audio/') // Directorio donde se guardarán los archivos
    },
    filename: (req, file, cb) => {
      cb(null, `audio-${Date.now()}${path.extname(file.originalname)}`)
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mp3', 'audio/mpeg']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Tipo de archivo no permitido'), false)
    }
  }
})

// Ruta para manejar la subida de audio
app.post('/api/sendAudio', upload.single('audioFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo' })
    }

    // Usa la ruta del archivo guardado en el disco
    const audioFilePath = req.file.path

    // Llama a speechGemini con la ruta del archivo
    const ans = await speechGemini("Responde las dudas", audioFilePath)

    res.json({ ans })
  } catch (error) {
    console.error('Error procesando audio:', error)
    res.status(500).json({ error: 'Error procesando el audio' })
  }
})

app.get('/api/getMsg/:prompt', async (req, res) => {
  const chat = await chatGemini("Todas tus respuestas van en mayúscula", 1)
  const text = req.params.prompt
  const ans = await chat.sendMessage(text)

  res.json({ ans })
})

app.listen(3000, () => {
  console.log('Servidor iniciado en http://localhost:3000')
})