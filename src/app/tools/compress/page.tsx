"use client";

import { useState } from "react";
import { FileArchive } from "lucide-react";
import { FILE_UPLOAD_LIMITS } from "@/constant/file-upload-limit";
import FileUploadZone from "@/components/sections/tools/FileUploadZone";
import ToolHeader from "@/components/sections/tools/ToolHeader";
import PDFFileManager from "@/components/sections/tools/PDFFileManager";
import ProgressBar from "@/components/ui/progress-bar";
import { usePdfProcessorApi } from "@/hooks/usePdfProcessorApi";

const limits = FILE_UPLOAD_LIMITS.COMPRESS_PDF;

export default function CompressPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [compressionLevel, setCompressionLevel] = useState<"low" | "recommended" | "extreme">("recommended");

  const { processFiles, isLoading, progress, error } = usePdfProcessorApi({
    tool: "compress",
    minFiles: limits.minFiles,
    maxFiles: limits.maxFiles,
    maxFileSize: limits.maxFileSize,
    successMessage: "PDF compressed successfully!",
    downloadFileName: "compressed",
    compressionLevel,
  });

  const handleFileDrop = (newFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const handleFilesChange = (updatedFiles: File[]) => {
    setFiles(updatedFiles);
  };

  const handleCompress = () => {
    if (files.length === 0) return;
    processFiles(files);
  };

  const actions = [
    {
      label: "Compress PDF",
      onClick: handleCompress,
      icon: FileArchive,
      requiresMinFiles: limits.minFiles,
      disabled: isLoading || files.length === 0,
    },
  ];

  return (
    <div className="mx-auto p-6">
      <ToolHeader title="Compress PDF" description="Compress PDF files to reduce their size and improve performance and quality of your documents." />

      <div className="mt-8 max-w-4xl mx-auto space-y-6">
        {/* Upload Zone */}
        <FileUploadZone onDrop={handleFileDrop} isUploading={isLoading} multiple={false} acceptedTypes={[".pdf"]} maxFiles={limits.maxFiles} maxFileSize={limits.maxFileSize} currentFileCount={files.length} />

        {/* Compression Level Selection - Only show if file uploaded */}
        {files.length > 0 && !isLoading && (
          <div className="bg-white rounded-lg border-2 border-slate-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Compression Level</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  value: "low" as const,
                  label: "Low Compression",
                  desc: "Minimal compression, best quality",
                  icon: "🔵",
                },
                {
                  value: "recommended" as const,
                  label: "Recommended",
                  desc: "Balanced compression and quality",
                  icon: "🟢",
                },
                {
                  value: "extreme" as const,
                  label: "High Compression",
                  desc: "Maximum compression, lower quality",
                  icon: "🔴",
                },
              ].map((level) => (
                <label key={level.value} className={`relative border rounded-lg p-4 cursor-pointer hover:bg-slate-50 transition-all ${compressionLevel === level.value ? "border-orange-500 bg-orange-50 shadow-md" : "border-slate-300"}`}>
                  <input
                    type="radio"
                    name="compressionLevel"
                    value={level.value}
                    checked={compressionLevel === level.value}
                    onChange={(e) => setCompressionLevel(e.target.value as "low" | "recommended" | "extreme")}
                    className="sr-only"
                    disabled={isLoading}
                  />
                  <div className="text-center">
                    <div className="text-2xl mb-2">{level.icon}</div>
                    <div className="font-medium text-slate-900 mb-1">{level.label}</div>
                    <div className="text-sm text-slate-500">{level.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {isLoading && (
          <div className="w-full">
            <ProgressBar progress={progress} />
            <p className="text-center text-sm mt-2 animate-pulse">Compressing your PDF... Please wait.</p>
          </div>
        )}

        {/* PDF File Manager */}
        <PDFFileManager files={files} onFilesChange={handleFilesChange} actions={actions} title="PDF File to Compress" allowReorder={false} maxFiles={limits.maxFiles} isProcessing={isLoading} />

        {/* Error display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-center font-medium">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
