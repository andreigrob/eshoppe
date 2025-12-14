import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';

const UploadsPath = 'w3s-dynamic-storage/uploads'

if (!existsSync(UploadsPath)) {
  mkdirSync(UploadsPath);
}

export const uploadFile = async (key, file) => {
  writeFileSync(join(UploadsPath, key), file.buffer);
  return key;
}
export const deleteFile = async (key) => {
  try {
    unlinkSync(join(UploadsPath, key));
  } catch (err) {
    console.error(err)
  }

  return true;
};