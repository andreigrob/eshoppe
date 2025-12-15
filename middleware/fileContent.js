import multer from 'multer'

const allowedMimeTypes = new Set(['image/png', 'image/jpg','image/jpeg',])

const upload = multer({ fileFilter: (_req, file, cb) => { cb(null, allowedMimeTypes.has(file.mimetype)) }, })

export default upload