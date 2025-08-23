"use client";

import { useState } from "react";
import { FileImage } from "lucide-react";
import { usePdfProcessor } from "@/hooks/usePdfProcessor";
import { FILE_UPLOAD_LIMITS } from "@/constant/file-upload-limit";
import FileUploadZone from "@/components/sections/tools/FileUploadZone";
import ImageFileManager from "@/components/sections/tools/img-to-pdf/ImageFileManager";
import ToolHeader from "@/components/sections/tools/ToolHeader";
import PDFFileManager from "@/components/sections/tools/PDFFileManager";
import ProgressBar from "@/components/ui/progress-bar";

const limits = FILE_UPLOAD_LIMITS.IMAGE_TO_PDF;

export default function ImageToPdfPage() {
  const [files, setFiles] = useState<File[]>([]);

  const { processFiles, isLoading, progress } = usePdfProcessor({
    apiEndpoint: "/api/tools/img-to-pdf",
    minFiles: limits.minFiles,
    maxFiles: limits.maxFiles,
    maxFileSize: limits.maxFileSize,
    successMessage: "Images converted to PDF successfully!",
    downloadFileName: "images-to-pdf",
    skipFileTypeValidation: true,
  });

  const handleFileDrop = (newFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const handleFilesChange = (updatedFiles: File[]) => {
    setFiles(updatedFiles);
  };

  const handleConvert = (filesToProcess: File[]) => {
    processFiles(filesToProcess);
  };

  const actions = [
    {
      label: "Convert to PDF",
      onClick: handleConvert,
      icon: FileImage,
      requiresMinFiles: 1,
      disabled: isLoading || files.length === 0,
    },
  ];

  return (
    <div className="mx-auto p-6">
      <ToolHeader title="Convert Images to PDF" description="Merge multiple PDF files into a single file with just a few clicks. All are 100% FREE and easy to use." />

      <div className="mt-8 max-w-4xl mx-auto space-y-6">
        {/* Upload Zone */}
        <FileUploadZone onDrop={handleFileDrop} isUploading={isLoading} multiple={true} acceptedTypes={[".jpg", ".jpeg", ".png"]} maxFiles={limits.maxFiles} maxFileSize={limits.maxFileSize} currentFileCount={files.length} />

        {/* Progress Bar */}
        {isLoading && (
          <div className="w-full">
            <ProgressBar progress={progress} />
            <p className="text-center text-sm text-slate-600 mt-2">Processing your PDF... Please wait.</p>
          </div>
        )}

        {/* PDF File Manager */}
        <PDFFileManager files={files} onFilesChange={handleFilesChange} actions={actions} title="PDF Files to Merge" allowReorder={true} maxFiles={limits.maxFiles} isProcessing={isLoading} />
      </div>
    </div>
  );
}
