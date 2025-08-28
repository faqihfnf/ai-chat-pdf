"use client";

import { useState, useCallback } from "react";
import { Scissors, FileText } from "lucide-react";
import { usePdfProcessor } from "@/hooks/usePdfProcessor";
import { FILE_UPLOAD_LIMITS } from "@/constant/file-upload-limit";
import FileUploadZone from "@/components/sections/tools/FileUploadZone";
import ToolHeader from "@/components/sections/tools/ToolHeader";
import ProgressBar from "@/components/ui/progress-bar";
import PdfFileManager from "@/components/sections/tools/PdfFileManager";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const limits = FILE_UPLOAD_LIMITS.SPLIT_PDF;

export default function SplitPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [splitMethod, setSplitMethod] = useState<string>("pages");
  const [splitValue, setSplitValue] = useState<string>("1");

  // Custom FormData function for split PDF
  const createCustomFormData = useCallback(
    (filesToProcess: File[]) => {
      const formData = new FormData();
      formData.append("files", filesToProcess[0]); // Only one file for split
      formData.append("splitMethod", splitMethod);
      formData.append("splitValue", splitValue);
      return formData;
    },
    [splitMethod, splitValue]
  );

  const { processFiles, isLoading, progress } = usePdfProcessor({
    apiEndpoint: "/api/tools/split",
    minFiles: limits.minFiles,
    maxFiles: limits.maxFiles,
    maxFileSize: limits.maxFileSize,
    successMessage: "PDF split successfully!",
    downloadFileName: "split_pdf",
    skipFileTypeValidation: false,
    customFormData: createCustomFormData, // Use custom FormData
  });

  const handleFileDrop = useCallback((newFiles: File[]) => {
    setFiles([newFiles[0]]); // Only allow one file for split
  }, []);

  const handleFilesChange = useCallback((updatedFiles: File[]) => {
    setFiles(updatedFiles);
  }, []);

  const handleSplit = useCallback(
    (filesToProcess: File[]) => {
      if (filesToProcess.length === 0) return;
      processFiles(filesToProcess);
    },
    [processFiles]
  );

  const actions = [
    {
      label: "Split PDF",
      onClick: handleSplit,
      icon: Scissors,
      requiresMinFiles: 1,
      disabled: isLoading || files.length === 0,
    },
  ];

  const getSplitDescription = useCallback(() => {
    switch (splitMethod) {
      case "pages":
        return `Split every ${splitValue} page(s) into separate files`;
      case "range":
        return "Split by custom page ranges (e.g., 1-3,4-6,7-9)";
      case "single":
        return "Split into individual pages";
      case "specific":
        return "Extract specific pages (e.g., 1,3,5,7)";
      default:
        return "";
    }
  }, [splitMethod, splitValue]);

  const handleSplitMethodChange = useCallback((value: string) => {
    setSplitMethod(value);
    // Reset split value when method changes
    if (value === "single") {
      setSplitValue(""); // No input needed for single pages
    } else {
      setSplitValue(value === "pages" ? "1" : "");
    }
  }, []);

  const validateSplitValue = useCallback(() => {
    if (splitMethod === "single") return true;
    if (!splitValue.trim()) return false;

    switch (splitMethod) {
      case "pages":
        return parseInt(splitValue) > 0;
      case "range":
        // Basic validation for range format (1-3,4-6)
        return /^[\d\s\-,]+$/.test(splitValue);
      case "specific":
        // Basic validation for specific pages (1,3,5)
        return /^[\d\s,]+$/.test(splitValue);
      default:
        return false;
    }
  }, [splitMethod, splitValue]);

  const isFormValid = files.length > 0 && validateSplitValue();

  return (
    <div className="mx-auto p-6">
      <ToolHeader title="Split PDF" description="Split PDF files into multiple documents by pages, ranges, or extract specific pages." />

      <div className="mt-8 max-w-4xl mx-auto space-y-6">
        {/* Upload Zone */}
        <FileUploadZone onDrop={handleFileDrop} isUploading={isLoading} multiple={false} acceptedTypes={[".pdf"]} maxFiles={limits.maxFiles} maxFileSize={limits.maxFileSize} currentFileCount={files.length} />

        {/* Split Options - Show only after file upload */}
        {files.length > 0 && (
          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 dark:text-slate-700">
              <FileText className="w-5 h-5" />
              Split Options
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium dark:text-slate-700 mb-2">Split Method</label>
                  <Select value={splitMethod} onValueChange={handleSplitMethodChange} disabled={isLoading}>
                    <SelectTrigger className="w-full dark:text-slate-700">
                      <SelectValue placeholder="Select split method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pages">Every N Pages</SelectItem>
                      <SelectItem value="range">Custom Ranges</SelectItem>
                      <SelectItem value="single">Single Pages</SelectItem>
                      <SelectItem value="specific">Specific Pages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {splitMethod !== "single" && (
                  <div>
                    <label className="block text-sm font-medium dark:text-slate-700 mb-2">{splitMethod === "pages" ? "Pages per file" : splitMethod === "range" ? "Page ranges" : "Page numbers"}</label>
                    <Input
                      type="text"
                      value={splitValue}
                      onChange={(e) => setSplitValue(e.target.value)}
                      placeholder={splitMethod === "pages" ? "1" : splitMethod === "range" ? "1-3,4-6,7-9" : "1,3,5,7"}
                      className="w-full dark:text-slate-700"
                      disabled={isLoading}
                    />
                  </div>
                )}
              </div>

              <div className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg">
                <strong>Preview:</strong> {getSplitDescription()}
              </div>

              {!validateSplitValue() && splitMethod !== "single" && splitValue && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">Please enter a valid {splitMethod === "pages" ? "number" : "format"} for the split value.</div>
              )}
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
          actions={actions.map((action) => ({
            ...action,
            disabled: action.disabled || !isFormValid,
          }))}
          title="PDF File to Split"
          allowReorder={false}
          maxFiles={limits.maxFiles}
          isProcessing={isLoading}
        />
      </div>
    </div>
  );
}
