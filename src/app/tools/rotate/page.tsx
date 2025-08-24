"use client";

import { useState } from "react";
import { RotateCw, RefreshCcw, RotateCwSquare, RotateCcwSquare, ArrowDown, CornerDownRight, CornerDownLeft } from "lucide-react";
import { toast } from "sonner";
import { usePdfProcessor } from "@/hooks/usePdfProcessor";
import { FILE_UPLOAD_LIMITS } from "@/constant/file-upload-limit";
import FileUploadZone from "@/components/sections/tools/FileUploadZone";
import ToolHeader from "@/components/sections/tools/ToolHeader";
import PDFFileManager from "@/components/sections/tools/PDFFileManager";
import ProgressBar from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";

const limits = FILE_UPLOAD_LIMITS.ROTATE_PDF;

export default function RotatePdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [rotationAngle, setRotationAngle] = useState<number>(90);
  const [rotateAll, setRotateAll] = useState<boolean>(true);
  const [specificPages, setSpecificPages] = useState<string>("");

  const { processFiles, isLoading, progress } = usePdfProcessor({
    apiEndpoint: "/api/tools/rotate",
    minFiles: limits.minFiles,
    maxFiles: limits.maxFiles,
    maxFileSize: limits.maxFileSize,
    successMessage: `PDF rotated ${rotationAngle}° successfully!`,
    downloadFileName: `rotated-${rotationAngle}deg-pdf`,
    skipFileTypeValidation: false, // Only PDF files
  });

  const handleFileDrop = (newFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const handleFilesChange = (updatedFiles: File[]) => {
    setFiles(updatedFiles);
  };

  const handleRotate = async (filesToProcess: File[]) => {
    // Validate specific pages input if rotateAll is false
    if (!rotateAll && specificPages.trim()) {
      // Basic client-side validation
      const pageStr = specificPages.trim();
      if (!/^[\d,\s-]+$/.test(pageStr)) {
        toast.error("Invalid format. Use numbers, commas, and dashes only (e.g., 1,3,5 or 1-3,5)");
        return;
      }
    }

    // Create custom processFiles function with FormData
    const customProcessFiles = async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("rotation", rotationAngle.toString());
      formData.append("rotateAll", rotateAll.toString());
      formData.append("specificPages", specificPages.trim());

      const response = await fetch("/api/tools/rotate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Show more specific error message if available
        const errorMessage = errorData.details ? `${errorData.error}. ${errorData.details}` : errorData.error || "Failed to rotate PDF";

        // Don't throw error, just return error object
        return { error: errorMessage };
      }

      // Get the rotated PDF as blob
      const blob = await response.blob();

      // Generate filename with rotation info
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, "");
      const filename = `rotated_${rotationAngle}deg_${timestamp}.pdf`;

      // Download the file
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 100);

      return { success: true }; // Return success object
    };

    // Handle the result without throwing errors
    try {
      const result = await customProcessFiles(filesToProcess);

      if (result && "error" in result) {
        // Handle error case
        toast.error(result.error);
        return; // Don't throw, just return
      }

      // Handle success case
      toast.success(`PDF rotated ${rotationAngle}° successfully!`);
    } catch (error) {
      console.error("Unexpected error rotating PDF:", error);
      // Even catch blocks shouldn't throw, just show toast
      toast.error("An unexpected error occurred while rotating PDF");
    }
  };

  const rotationOptions = [
    { value: 90, label: "90° (Right)", icon: CornerDownRight },
    { value: 180, label: "180° (Down)", icon: ArrowDown },
    { value: 270, label: "270° (Left)", icon: CornerDownLeft },
  ];

  const actions = [
    {
      label: `Rotate ${rotationAngle}°`,
      onClick: handleRotate,
      icon: RotateCw,
      requiresMinFiles: 1,
      disabled: isLoading || files.length === 0,
    },
  ];

  return (
    <div className="mx-auto p-6">
      <ToolHeader title="Rotate PDF" description="Quickly rotate PDF files by 90, 180, or 270 degrees. All in one place for easy access and integration." />

      <div className="mt-8 max-w-4xl mx-auto space-y-6">
        {/* Upload Zone */}
        <FileUploadZone onDrop={handleFileDrop} isUploading={isLoading} multiple={false} acceptedTypes={[".pdf"]} maxFiles={limits.maxFiles} maxFileSize={limits.maxFileSize} currentFileCount={files.length} />

        {/* Rotation Settings */}
        {files.length > 0 && !isLoading && (
          <div className="bg-white rounded-lg border-2 border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Rotation Settings</h3>

            {/* Rotation Angle Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">Select Rotation Angle:</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-900">
                {rotationOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <Button key={option.value} variant={rotationAngle === option.value ? "primary" : "outline"} onClick={() => setRotationAngle(option.value)} className="flex items-center gap-2 p-4 h-auto">
                      <IconComponent className="h-5 w-5" />
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Page Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-3">Pages to Rotate:</label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input type="radio" id="rotate-all" name="rotatePages" checked={rotateAll} onChange={() => setRotateAll(true)} className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-slate-300" />
                  <label htmlFor="rotate-all" className="ml-2 block text-sm text-slate-700">
                    Rotate all pages
                  </label>
                </div>

                <div className="flex items-center">
                  <input type="radio" id="rotate-specific" name="rotatePages" checked={!rotateAll} onChange={() => setRotateAll(false)} className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-slate-300" />
                  <label htmlFor="rotate-specific" className="ml-2 block text-sm text-slate-700">
                    Rotate specific pages
                  </label>
                </div>

                {!rotateAll && (
                  <div className="ml-6">
                    <input
                      type="text"
                      value={specificPages}
                      onChange={(e) => setSpecificPages(e.target.value)}
                      placeholder="e.g., 1,2 or 1-2 (for a 2-page PDF)"
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    />
                    <p className="mt-1 text-xs text-slate-500">Enter page numbers separated by commas (e.g., 1,2) or ranges (e.g., 1-2). Make sure page numbers don't exceed the total pages in your PDF.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {isLoading && (
          <div className="w-full">
            <ProgressBar progress={progress} />
            <p className="text-center text-sm text-slate-600 mt-2">Rotating your PDF {rotationAngle}°... Please wait.</p>
          </div>
        )}

        {/* PDF File Manager */}
        <PDFFileManager
          files={files}
          onFilesChange={handleFilesChange}
          actions={actions}
          title="PDF File to Rotate"
          allowReorder={false} // No need for reorder with single file
          maxFiles={limits.maxFiles}
          isProcessing={isLoading}
        />
      </div>
    </div>
  );
}
