import dirs from './dirs.js'

import express from 'express'
import helmet from 'helmet'
import compression from 'compression'
import favicon from 'serve-favicon'
import morgan from 'morgan'
import flash from 'connect-flash'

import ct from './controllers/error.js'
import adminRoutes from './routes/admin.js'
import shopRoutes from './routes/shop.js'
import authRoutes from './routes/auth.js'
import attachUserInfo from './middleware/attachUserInfo.js'
import sessionProvider from './middleware/sessionHandler.js'
import { initialize } from './database/sqlite.js'

const port = 3000
const app = express()

app.set('view engine', 'ejs')
app.set('views', dirs.views)

const components = [ morgan('tiny'), helmet.hidePoweredBy({ setTo: 'X-Frame-Options' }), compression(), express.urlencoded({ extended: true }), express.static(dirs.Public), express.static(dirs.uploads), sessionProvider, flash(), favicon(dirs.favicon), attachUserInfo ]

for (const component of components) {
  app.use(component)
}

// App routes
app.use('/admin', adminRoutes)
app.use(shopRoutes)
app.use(authRoutes)

// Error handler
app.get('/500', ct.get500)
app.use(ct.get404)
app.use(ct.get500)

initialize().then(() => {
    app.listen(port)
    console.log(`server listening at ${port}`)
  }).catch((e) => {
    console.log(e)
  })
