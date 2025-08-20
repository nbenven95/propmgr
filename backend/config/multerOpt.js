import multer from 'multer'
import sysPath from 'node:path'

// TODO: make this a class instead of a single exported method (change file name to MulterOpt)

const multerOptFromEnvVar = ({
  uploadDir,
  maxFileSize,
  maxFilesPerUpload,
  allowedFileExt
}) => {
  // Define Multer disk storage options
  const localDiskStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir), // File upload destination
    filename: (req, file, cb) => {												// Uploaded file naming schema
      // Parse file name, extract the name and extension
      const parsed = sysPath.parse(sysPath.basename(file.originalname))
      // Replace any number of successive whitespace or '-' characters with '_'
      const name = parsed.name.replace(/[\s-]+/g, '_');
      // Unique suffix based on random number and timestamp
      const uniqueSuffix = `${Math.round(Math.random()*1E9)}-${Date.now()}`;
      // Rename file
      const fileName = `${name}-${uniqueSuffix}${parsed.ext}`;
      cb(null, fileName);
    }
  });

  // TODO: more opt (MAX_FILE_SIZE, MAX_FILES_PER_UPLOAD, ALLOWED_FILE_EXT, etc.); add as fields to return obj

  // Export multer options
  return  {
    storage: localDiskStorage
  }
};

export default multerOptFromEnvVar;