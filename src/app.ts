import express from 'express'
import body_parser from 'body-parser'
import config from 'config'
import cors from 'cors'
import path from 'path'
import students_router from './student_router';

const app = express()

app.use(body_parser.json())

app.use(cors())

app.use(express.static(path.join('.', '/static/')))

app.use('/api/students', students_router)

const server: any = config.get('server')
 const server_api = app.listen(server.port, () => {
     console.log(`====== express server is running on port ${server.port} =======`);
 })

