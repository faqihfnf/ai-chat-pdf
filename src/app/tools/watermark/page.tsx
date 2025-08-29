"use client";

import { useState } from "react";
import { Type } from "lucide-react";
import { usePdfProcessor } from "@/hooks/usePdfProcessor";
import { FILE_UPLOAD_LIMITS } from "@/constant/file-upload-limit";
import FileUploadZone from "@/components/sections/tools/FileUploadZone";
import ToolHeader from "@/components/sections/tools/ToolHeader";
import ProgressBar from "@/components/ui/progress-bar";
import PdfFileManager from "@/components/sections/tools/PdfFileManager";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

const limits = FILE_UPLOAD_LIMITS.WATERMARK_PDF;

export default function WatermarkPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [watermarkSettings, setWatermarkSettings] = useState({
    text: "WATERMARK",
    opacity: 0.5,
    fontSize: 48,
    position: "default",
    color: "red",
  });

  const { processFiles, isLoading, progress } = usePdfProcessor({
    apiEndpoint: "/api/tools/watermark",
    minFiles: limits.minFiles,
    maxFiles: limits.maxFiles,
    maxFileSize: limits.maxFileSize,
    successMessage: "PDF watermark added successfully!",
    downloadFileName: "watermarked_pdf",
    customFormData: (files: File[]) => {
      const formData = new FormData();
      if (files[0]) {
        formData.append("file", files[0]);
      }
      formData.append("watermarkText", watermarkSettings.text);
      formData.append("opacity", watermarkSettings.opacity.toString());
      formData.append("fontSize", watermarkSettings.fontSize.toString());
      formData.append("position", watermarkSettings.position);
      formData.append("color", watermarkSettings.color);
      return formData;
    },
  });

  const handleFileDrop = (newFiles: File[]) => {
    setFiles(newFiles.slice(0, 1));
  };

  const handleFilesChange = (updatedFiles: File[]) => {
    setFiles(updatedFiles);
  };

  const handleAddWatermark = (filesToProcess: File[]) => {
    processFiles(filesToProcess);
  };

  const actions = [
    {
      label: "Add Watermark",
      onClick: handleAddWatermark,
      icon: Type,
      requiresMinFiles: 1,
      disabled: isLoading || files.length === 0,
    },
  ];

  return (
    <div className="mx-auto p-6">
      <ToolHeader title="Add Watermark to PDF" description="Add text watermarks to your PDF documents to protect your content or add branding." />

      <div className="mt-8 max-w-4xl mx-auto space-y-6">
        {/* Upload Zone */}
        <FileUploadZone onDrop={handleFileDrop} isUploading={isLoading} multiple={false} acceptedTypes={[".pdf"]} maxFiles={limits.maxFiles} maxFileSize={limits.maxFileSize} currentFileCount={files.length} />

        {/* Watermark Settings */}
        {files.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Watermark Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Watermark Text */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Watermark Text</label>
                <Input type="text" value={watermarkSettings.text} onChange={(e) => setWatermarkSettings({ ...watermarkSettings, text: e.target.value })} className="text-slate-700" placeholder="Enter watermark text" disabled={isLoading} />
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Position</label>
                <Select value={watermarkSettings.position} onValueChange={(value) => setWatermarkSettings({ ...watermarkSettings, position: value })} disabled={isLoading}>
                  <SelectTrigger className="w-full text-slate-700">
                    <SelectValue className="text-slate-700" placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="top-left">Top Left</SelectItem>
                    <SelectItem value="top-right">Top Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Font Size ({watermarkSettings.fontSize}px)</label>
                <Slider value={[watermarkSettings.fontSize]} onValueChange={([value]) => setWatermarkSettings({ ...watermarkSettings, fontSize: value })} min={12} max={100} step={1} className="w-full" disabled={isLoading} />
              </div>

              {/* Opacity */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Opacity ({Math.round(watermarkSettings.opacity * 100)}%)</label>
                <Slider value={[watermarkSettings.opacity]} onValueChange={([value]) => setWatermarkSettings({ ...watermarkSettings, opacity: value })} min={0.1} max={1} step={0.1} className="w-full" disabled={isLoading} />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Color</label>
                <Select value={watermarkSettings.color} onValueChange={(value) => setWatermarkSettings({ ...watermarkSettings, color: value })} disabled={isLoading}>
                  <SelectTrigger className="w-full text-slate-700">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="black">Black</SelectItem>
                    <SelectItem value="slate">slate</SelectItem>
                    <SelectItem value="white">White</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-4 p-4 bg-slate-50 rounded-md">
              <p className="text-sm text-slate-600 mb-2">Preview:</p>
              <div className="relative h-16 flex items-center justify-center">
                <div
                  className="absolute px-3 py-1 rounded border bg-white"
                  style={{
                    opacity: watermarkSettings.opacity,
                    fontSize: `${Math.max(watermarkSettings.fontSize / 3, 12)}px`,
                    color: watermarkSettings.color,
                    transform: watermarkSettings.position === "default" ? "rotate(45deg)" : "none",
                    transformOrigin: "center",
                  }}
                >
                  {watermarkSettings.text}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {isLoading && (
          <div className="w-full">
            <ProgressBar progress={progress} />
            <p className="text-center text-sm mt-2 animate-pulse">Adding watermark to your PDF... Please wait.</p>
          </div>
        )}

        {/* PDF File Manager */}
        <PdfFileManager files={files} onFilesChange={handleFilesChange} actions={actions} title="PDF File to Watermark" allowReorder={false} maxFiles={limits.maxFiles} isProcessing={isLoading} />
      </div>
    </div>
  );
}
