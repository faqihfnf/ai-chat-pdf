"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { usePdfProcessor } from "@/hooks/usePdfProcessor";
import { FILE_UPLOAD_LIMITS } from "@/constant/file-upload-limit";
import FileUploadZone from "@/components/sections/tools/FileUploadZone";
import ToolHeader from "@/components/sections/tools/ToolHeader";
import ProgressBar from "@/components/ui/progress-bar";
import PdfFileManager from "@/components/sections/tools/PdfFileManager";

const limits = FILE_UPLOAD_LIMITS.REMOVE_PDF;

export default function RemovePdfPagesPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [pagesToRemove, setPagesToRemove] = useState<string>("");

  const { processFiles, isLoading, progress } = usePdfProcessor({
    apiEndpoint: "/api/tools/remove",
    minFiles: limits.minFiles,
    maxFiles: limits.maxFiles,
    maxFileSize: limits.maxFileSize,
    successMessage: "Pages removed from PDF successfully!",
    downloadFileName: "removed_pages_pdf",
    skipFileTypeValidation: false, // Only accept PDF files
  });

  const handleFileDrop = (newFiles: File[]) => {
    setFiles(newFiles.slice(0, 1)); // Only allow one file
  };

  const handleFilesChange = (updatedFiles: File[]) => {
    setFiles(updatedFiles);
  };

  const handleRemovePages = async (filesToProcess: File[]) => {
    if (!pagesToRemove.trim()) {
      toast.error("Please enter page numbers to remove");
      return;
    }

    // Validate page format
    const pagePattern = /^[\d\s,]+$/;
    if (!pagePattern.test(pagesToRemove)) {
      toast.error("Please enter valid page numbers separated by commas (e.g., 1, 3, 5-7)");
      return;
    }

    // Create FormData with pages to remove
    const originalProcessFiles = processFiles;

    // Override the processFiles to include pagesToRemove
    const customProcessFiles = async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("pagesToRemove", pagesToRemove);

      // Call the API directly since we need custom FormData
      try {
        const response = await fetch("/api/tools/remove", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          toast.error(errorData.error || "Failed to remove pages");
          return;
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `removed_pages_${new Date().toISOString().slice(0, 19).replace(/[:-]/g, "")}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success("Pages removed successfully!");
      } catch (error) {
        console.error("Error:", error);
        toast.error(error instanceof Error ? error.message : "Failed to remove pages");
      }
    };

    await customProcessFiles(filesToProcess);
  };

  const actions = [
    {
      label: "Remove Pages",
      onClick: handleRemovePages,
      icon: Trash2,
      requiresMinFiles: 1,
      disabled: isLoading || files.length === 0 || !pagesToRemove.trim(),
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
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold dark:text-slate-700 mb-4">Select Pages to Remove</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="pagesToRemove" className="block text-sm font-medium dark:text-slate-700 mb-2">
                  Page Numbers
                </label>
                <input
                  id="pagesToRemove"
                  type="text"
                  value={pagesToRemove}
                  onChange={(e) => setPagesToRemove(e.target.value)}
                  placeholder="e.g. 1, 3, 5, 7-9"
                  className="w-full px-3 py-2 border border-slate-300 dark:text-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
                <p className="mt-1 text-sm text-slate-500">Enter page numbers separated by commas (e.g. 1, 3, 5 or 2-4, 7, 10)</p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {isLoading && (
          <div className="w-full">
            <ProgressBar progress={progress} />
            <p className="text-center text-sm mt-2 animate-pulse">Removing pages from PDF... Please wait.</p>
          </div>
        )}

        {/* PDF File Manager */}
        <PdfFileManager files={files} onFilesChange={handleFilesChange} actions={actions} title="PDF File" allowReorder={false} maxFiles={1} isProcessing={isLoading} />
      </div>
    </div>
  );
}
