"use client";

import React, { useState, useCallback } from "react";
import { Combine, Download } from "lucide-react";
import FileUploadZone from "@/components/sections/tools/FileUploadZone";
import ToolHeader from "@/components/sections/tools/ToolHeader";
import PDFFileManager from "@/components/sections/tools/PDFFileManager";
import ProgressBar from "@/components/ui/progress-bar";
import { useMergePdf } from "@/hooks/useMergePdf";
import { FileAction } from "@/types/pdf";
import { FILE_UPLOAD_LIMITS } from "@/constant/file-upload-limit";
import { formatFileSize } from "@/lib/format-file-size";

export default function MergePage() {
  const [files, setFiles] = useState<File[]>([]);
  const { processFiles, isLoading, progress } = useMergePdf();
  const limits = FILE_UPLOAD_LIMITS.MERGE_PDF;

  // Handle file upload with validation
  const handleFileUpload = useCallback((acceptedFiles: File[]) => {
    console.log("📁 Files uploaded:", acceptedFiles.length);

    if (acceptedFiles.length === 0) return;

    // Filter valid PDF files
    const validFiles = acceptedFiles.filter((file) => {
      if (file.type !== "application/pdf") {
        console.warn(`❌ Skipping non-PDF file: ${file.name}`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      console.warn("❌ No valid PDF files found");
      return;
    }

    // Add to existing files
    setFiles((prevFiles) => [...prevFiles, ...validFiles]);

    console.log(`✅ Added ${validFiles.length} valid PDF files`);
  }, []);

  // Handle files change from PDFFileManager (reordering, removal)
  const handleFilesChange = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
  }, []);

  // Define actions for the file manager
  const actions: FileAction[] = [
    {
      label: "Merge PDF",
      icon: Combine,
      onClick: processFiles,
      variant: "primary",
      disabled: isLoading,
      requiresMinFiles: limits.minFiles,
    },
  ];

  return (
    <div className="mx-auto p-6">
      <ToolHeader title="Merge PDF Files" description="Merge multiple PDF files into a single file with just a few clicks. All are 100% FREE and easy to use." />

      <div className="mt-8 max-w-4xl mx-auto space-y-6">
        {/* Upload Zone */}
        <FileUploadZone onDrop={handleFileUpload} isUploading={isLoading} disabled={isLoading} multiple={true} acceptedTypes={[".pdf"]} maxFiles={limits.maxFiles} maxFileSize={limits.maxFileSize} currentFileCount={files.length} />

        {/* Progress Bar */}
        {isLoading && (
          <div className="w-full">
            <ProgressBar progress={progress} />
            <p className="text-center text-sm text-slate-600 mt-2">Processing your PDF... Please wait.</p>
          </div>
        )}

        {/* PDF File Manager */}
        <PDFFileManager files={files} onFilesChange={handleFilesChange} actions={actions} title="PDF Files to Merge" allowReorder={true} maxFiles={limits.maxFiles} isProcessing={isLoading} />

        {/* Instructions */}

        {files.length === 1 && !isLoading && (
          <div className="text-center py-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-amber-800 text-sm">
                <strong>Need one more file!</strong>
                <br />
                Add at least one more PDF file to enable merging.
              </p>
            </div>
          </div>
        )}

        {files.length >= 2 && !isLoading && (
          <div className="text-center py-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-green-800 text-sm">
                <strong>Ready to merge!</strong>
                <br />
                {files.length} PDF files will be combined in the order shown above.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
