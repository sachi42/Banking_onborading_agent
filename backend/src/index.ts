import express from 'express'
import cors from 'cors'
import cases from './routes/cases'
import llm from './routes/llm'
import dotenv from 'dotenv'

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())
app.use('/cases', cases)
app.use('/llm', llm)

const port = process.env.PORT || 4000
app.listen(port, () => console.log(`Backend listening on ${port}`))
