import { FILE_UPLOAD_LIMITS } from "@/constant/file-upload-limit";
import { usePdfProcessor } from "./usePdfProcessor";

export const useMergePdf = () => {
  const limits = FILE_UPLOAD_LIMITS.MERGE_PDF;
  return usePdfProcessor({
    apiEndpoint: "/api/tools/merge",
    minFiles: limits.minFiles,
    maxFiles: limits.maxFiles,
    maxFileSize: limits.maxFileSize,
    successMessage: "PDF merged successfully!",
    downloadFileName: "merged",
  });
};
