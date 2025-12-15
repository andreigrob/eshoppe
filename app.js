import dotenv from 'dotenv'
dotenv.config({ path: './w3s-dynamic-storage/.env' })
import express from 'express'
import flash from 'connect-flash'
import helmet from 'helmet'
import compression from 'compression'
import favicon from 'serve-favicon'
import morgan from 'morgan'
import { get404, get500 } from './controllers/error.js'
import adminRoutes from './routes/admin.js'
import shopRoutes from './routes/shop.js'
import authRoutes from './routes/auth.js'
import attachUserInfo from './middleware/attachUserInfo.js'
import sessionProvider from './middleware/sessionHandler.js'
import { initialize } from './database/sqlite.js'

const port = 3000
const app = express()
const uploadsPath = 'w3s-dynamic-storage/uploads'

app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(morgan('tiny'))
app.use(helmet.hidePoweredBy({ setTo: 'X-Frame-Options' }))
app.use(compression())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(express.static(uploadsPath))
app.use(sessionProvider)
app.use(flash())
app.use(favicon('public/images/favicon.ico'))
app.use(attachUserInfo)

// App routes
app.use('/admin', adminRoutes)
app.use(shopRoutes)
app.use(authRoutes)

// Error handler
app.get('/500', get500)
app.use(get404)
app.use(get500)

initialize().then(() => {
    app.listen(port)
    console.log(`server listening at ${port}`)
  }).catch((e) => {
    console.log(e)
  })
