"use client";

import { useState, useCallback } from "react";
import { Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { usePdfProcessor } from "@/hooks/usePdfProcessor";
import { FILE_UPLOAD_LIMITS } from "@/constant/file-upload-limit";
import FileUploadZone from "@/components/sections/tools/FileUploadZone";
import ToolHeader from "@/components/sections/tools/ToolHeader";
import ProgressBar from "@/components/ui/progress-bar";
import PdfFileManager from "@/components/sections/tools/PdfFileManager";
import { Input } from "@/components/ui/input";

const limits = FILE_UPLOAD_LIMITS.REMOVE_PDF;

export default function RemovePdfPagesPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [pagesToRemove, setPagesToRemove] = useState<string>("");

  // Custom FormData function for remove PDF pages
  const createCustomFormData = useCallback(
    (filesToProcess: File[]) => {
      const formData = new FormData();
      formData.append("files", filesToProcess[0]); // Only one file for remove pages
      formData.append("pagesToRemove", pagesToRemove);
      return formData;
    },
    [pagesToRemove]
  );

  const { processFiles, isLoading, progress } = usePdfProcessor({
    apiEndpoint: "/api/tools/remove",
    minFiles: limits.minFiles,
    maxFiles: limits.maxFiles,
    maxFileSize: limits.maxFileSize,
    successMessage: "Pages removed from PDF successfully!",
    downloadFileName: "removed_pages_pdf",
    skipFileTypeValidation: false, // Only accept PDF files
    customFormData: createCustomFormData, // Use custom FormData
  });

  const handleFileDrop = useCallback((newFiles: File[]) => {
    setFiles(newFiles.slice(0, 1)); // Only allow one file
  }, []);

  const handleFilesChange = useCallback((updatedFiles: File[]) => {
    setFiles(updatedFiles);
  }, []);

  const validatePageNumbers = useCallback(() => {
    if (!pagesToRemove.trim()) return false;

    // Pattern to match page numbers and ranges (e.g., 1, 3, 5-7, 10)
    const pagePattern = /^[\d\s,\-]+$/;
    if (!pagePattern.test(pagesToRemove)) return false;

    // Additional validation - check if ranges are valid
    const parts = pagesToRemove.split(",");
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes("-")) {
        const [start, end] = trimmed.split("-");
        const startNum = parseInt(start?.trim() || "0");
        const endNum = parseInt(end?.trim() || "0");
        if (startNum <= 0 || endNum <= 0 || startNum > endNum) {
          return false;
        }
      } else {
        const num = parseInt(trimmed);
        if (num <= 0 || isNaN(num)) {
          return false;
        }
      }
    }

    return true;
  }, [pagesToRemove]);

  const handleRemovePages = useCallback(
    async (filesToProcess: File[]) => {
      if (!pagesToRemove.trim()) {
        toast.error("Please enter page numbers to remove");
        return;
      }

      if (!validatePageNumbers()) {
        toast.error("Please enter valid page numbers separated by commas (e.g., 1, 3, 5-7)");
        return;
      }

      // Use the hook's processFiles with custom FormData
      await processFiles(filesToProcess);
    },
    [pagesToRemove, validatePageNumbers, processFiles]
  );

  const handlePagesToRemoveChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPagesToRemove(e.target.value);
  }, []);

  const isFormValid = files.length > 0 && validatePageNumbers();

  const actions = [
    {
      label: "Remove Pages",
      onClick: handleRemovePages,
      icon: Trash2,
      requiresMinFiles: 1,
      disabled: isLoading || !isFormValid,
    },
  ];

  return (
    <div className="mx-auto p-6">
      <ToolHeader title="Remove PDF Pages" description="Remove specific pages from your PDF document. Enter page numbers separated by commas." />

      <div className="mt-8 max-w-4xl mx-auto space-y-6">
        {/* Upload Zone */}
        <FileUploadZone onDrop={handleFileDrop} isUploading={isLoading} multiple={false} acceptedTypes={[".pdf"]} maxFiles={1} maxFileSize={limits.maxFileSize} currentFileCount={files.length} />

        {/* Page Selection Input */}
        {files.length > 0 && (
          <div className="bg-white rounded-lg border p-6 shadow-sm text-slate-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Select Pages to Remove
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="pagesToRemove" className="block text-sm font-medium text-slate-700 mb-2">
                  Page Numbers
                </label>
                <Input
                  id="pagesToRemove"
                  type="text"
                  value={pagesToRemove}
                  onChange={handlePagesToRemoveChange}
                  placeholder="e.g. 1, 3, 5, 7-9"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm text-slate-700 disabled:bg-slate-100"
                  disabled={isLoading}
                />
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-slate-700">Enter page numbers separated by commas (e.g. 1, 3, 5 or 2-4, 7, 10)</p>
                </div>

                {pagesToRemove && !validatePageNumbers() && <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">Please enter valid page numbers. Use commas to separate individual pages and hyphens for ranges.</div>}

                {pagesToRemove && validatePageNumbers() && <div className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded">✓ Valid page selection: {pagesToRemove}</div>}
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {isLoading && (
          <div className="w-full">
            <ProgressBar progress={progress} />
            <p className="text-center text-sm mt-2 animate-pulse">Processing your PDF... Please wait.</p>
          </div>
        )}

        {/* PDF File Manager */}
        <PdfFileManager files={files} onFilesChange={handleFilesChange} actions={actions} title="PDF File" allowReorder={false} maxFiles={1} isProcessing={isLoading} />
      </div>
    </div>
  );
}
