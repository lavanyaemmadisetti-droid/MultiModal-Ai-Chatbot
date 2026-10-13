import multer from 'multer';

// Use memory storage to process files directly into base64 / buffers
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file type: ${file.mimetype}. Multimodal AI StudyMate currently supports PDFs and images (PNG, JPEG, WEBP, GIF).`
      ),
      false
    );
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25 MB limit
  },
  fileFilter
});

export default upload;
