"use client";

import { useState, useCallback } from "react";
import { RotateCw, ArrowDown, CornerDownRight, CornerDownLeft, FileText } from "lucide-react";
import { toast } from "sonner";
import { usePdfProcessor } from "@/hooks/usePdfProcessor";
import { FILE_UPLOAD_LIMITS } from "@/constant/file-upload-limit";
import FileUploadZone from "@/components/sections/tools/FileUploadZone";
import ToolHeader from "@/components/sections/tools/ToolHeader";
import ProgressBar from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import PdfFileManager from "@/components/sections/tools/PdfFileManager";

const limits = FILE_UPLOAD_LIMITS.ROTATE_PDF;

export default function RotatePdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [rotationAngle, setRotationAngle] = useState<number>(90);
  const [rotateAll, setRotateAll] = useState<boolean>(true);
  const [specificPages, setSpecificPages] = useState<string>("");

  // Custom FormData function for rotate PDF
  const createCustomFormData = useCallback(
    (filesToProcess: File[]) => {
      const formData = new FormData();
      filesToProcess.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("rotation", rotationAngle.toString());
      formData.append("rotateAll", rotateAll.toString());
      formData.append("specificPages", specificPages.trim());
      return formData;
    },
    [rotationAngle, rotateAll, specificPages]
  );

  const { processFiles, isLoading, progress } = usePdfProcessor({
    apiEndpoint: "/api/tools/rotate",
    minFiles: limits.minFiles,
    maxFiles: limits.maxFiles,
    maxFileSize: limits.maxFileSize,
    successMessage: `PDF rotated ${rotationAngle}° successfully!`,
    downloadFileName: `rotated-${rotationAngle}deg-pdf`,
    skipFileTypeValidation: false, // Only PDF files
    customFormData: createCustomFormData, // Use custom FormData
  });

  const handleFileDrop = useCallback((newFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  }, []);

  const handleFilesChange = useCallback((updatedFiles: File[]) => {
    setFiles(updatedFiles);
  }, []);

  const validateSpecificPages = useCallback(() => {
    if (rotateAll) return true;
    if (!specificPages.trim()) return false;

    // Basic client-side validation
    const pageStr = specificPages.trim();
    if (!/^[\d,\s-]+$/.test(pageStr)) return false;

    // Additional validation for ranges
    const parts = pageStr.split(",");
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
  }, [rotateAll, specificPages]);

  const handleRotate = useCallback(
    async (filesToProcess: File[]) => {
      // Validate specific pages input if rotateAll is false
      if (!validateSpecificPages()) {
        toast.error("Invalid format. Use numbers, commas, and dashes only (e.g., 1,3,5 or 1-3,5)");
        return;
      }

      // Use the hook's processFiles with custom FormData
      await processFiles(filesToProcess);
    },
    [validateSpecificPages, processFiles]
  );

  const handleRotationAngleChange = useCallback((angle: number) => {
    setRotationAngle(angle);
  }, []);

  const handleRotateAllChange = useCallback((value: boolean) => {
    setRotateAll(value);
    if (value) {
      setSpecificPages(""); // Clear specific pages when switching to rotate all
    }
  }, []);

  const handleSpecificPagesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSpecificPages(e.target.value);
  }, []);

  const rotationOptions = [
    { value: 90, label: "90° (Right)", icon: CornerDownRight },
    { value: 180, label: "180° (Down)", icon: ArrowDown },
    { value: 270, label: "270° (Left)", icon: CornerDownLeft },
  ];

  const isFormValid = files.length > 0 && validateSpecificPages();

  const actions = [
    {
      label: `Rotate ${rotationAngle}°`,
      onClick: handleRotate,
      icon: RotateCw,
      requiresMinFiles: 1,
      disabled: isLoading || !isFormValid,
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
                    <p className="mt-1 text-xs text-slate-500">Enter page numbers separated by commas (e.g., 1,2) or ranges (e.g., 1-2). Make sure page numbers don&apos;t exceed the total pages in your PDF.</p>
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
            <p className="text-center text-sm mt-2 animate-pulse">Processing your PDF... Please wait.</p>
          </div>
        )}

        {/* PDF File Manager */}
        <PdfFileManager
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
