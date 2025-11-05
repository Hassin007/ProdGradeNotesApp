import express, { urlencoded } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { requestLogger } from './middlewares/requestLogger.js'

const app = express()

app.use(express.json({limit:'16kb'}))
app.use(express.static('public'))
app.use(urlencoded({extended:true, limit:'16kb'}))
app.use(cors({
    origin:'http://localhost:5173',
    credentials:true
}))
app.use(cookieParser())
app.use(requestLogger)

//Routes import and usage
import userRouter from './routes/user.routes.js'
import notesRouter from './routes/note.routes.js'

app.use("/api/v1/users", userRouter)
app.use("/api/v1/notes", notesRouter)

export { app }