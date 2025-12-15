import fs from 'fs'
import { join } from 'path'

const UploadsPath = './w3s-dynamic-storage/uploads'

if (!fs.existsSync(UploadsPath)) {
  fs.mkdirSync(UploadsPath);
}

export async function uploadFile (key, file) {
  fs.writeFileSync(join(UploadsPath, key), file.buffer);
  return key;
}

export async function deleteFile (key) {
  try {
    fs.unlinkSync(join(UploadsPath, key));
  } catch (e) {
    console.error(e)
  }
  return true;
}

export default {
  uploadFile,
  deleteFile,
}
