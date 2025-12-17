import dotenv from 'dotenv'
import { resolve, join } from 'path'

const dirname = resolve()
const storage = join(dirname, 'w3s-dynamic-storage')
dotenv.config({ path: join(storage, '.env') })

const Public = join(dirname, 'public')
const images = join(Public, 'images')
const favicon = join(images, 'favicon.ico')
const views = join(dirname, 'views')
const uploads = join(storage, 'uploads')

export default {
    Public,
    images,
    favicon,
    views,
    uploads,
}
