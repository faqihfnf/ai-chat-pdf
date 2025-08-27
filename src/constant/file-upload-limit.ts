export const FILE_UPLOAD_LIMITS = {
  MERGE_PDF: {
    maxFiles: 10,
    maxFileSize: 10 * 1024 * 1024,
    minFiles: 2,
  },
  IMAGE_TO_PDF: {
    maxFiles: 1,
    maxFileSize: 10 * 1024 * 1024,
    minFiles: 1,
  },
  COMPRESS_PDF: {
    maxFiles: 1,
    maxFileSize: 50 * 1024 * 1024,
    minFiles: 1,
  },
  REMOVE_PDF: {
    maxFiles: 1,
    maxFileSize: 30 * 1024 * 1024,
    minFiles: 1,
  },
};
