"use client";
import FileUploadZone from "@/components/sections/tools/FileUploadZone";
import ToolHeader from "@/components/sections/tools/ToolHeader";
import { useMergePdf } from "@/hooks/useMergePdf";
import { Download } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import ProgressBar from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import SimplePDFList from "@/components/sections/tools/PDFList";

// Interface untuk data file
interface PDFFileData {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  file: File; // Keep original file for processing
}

export default function MergePage() {
  const [files, setFiles] = useState<PDFFileData[]>([]);
  const { mergePdfs, isLoading, progress } = useMergePdf();

  // Handle file upload
  const handleFileUpload = (acceptedFiles: File[]) => {
    console.log("📁 Raw accepted files:", acceptedFiles);

    if (acceptedFiles.length === 0) {
      return;
    }

    // Debug each file
    acceptedFiles.forEach((file, index) => {
      console.log(`📄 File ${index + 1}:`, {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        isFile: file instanceof File,
        keys: Object.keys(file),
      });
    });

    // Convert File to PDFFileData
    const newFiles: PDFFileData[] = acceptedFiles
      .filter((file) => {
        // Filter file yang valid
        const isValid = file && file.name && file.size !== undefined && file.type;
        if (!isValid) {
          console.error("❌ Invalid file detected:", file);
        }
        return isValid;
      })
      .map((file, index) => {
        const fileData: PDFFileData = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name || `Unknown file ${index + 1}`,
          size: file.size || 0,
          type: file.type || "application/pdf",
          lastModified: file.lastModified || Date.now(),
          file: file, // Keep original file
        };

        console.log("✅ Created PDFFileData:", {
          id: fileData.id,
          name: fileData.name,
          size: fileData.size,
          type: fileData.type,
        });

        return fileData;
      });

    if (newFiles.length === 0) {
      toast.error("No valid PDF files were uploaded");
      return;
    }

    // Add to existing files
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    toast.success(`${newFiles.length} file(s) added successfully!`);
  };

  // Handle merge PDFs
  const handleMergePdfs = async () => {
    if (files.length < 2) {
      toast.error("Please add at least 2 PDF files to merge");
      return;
    }

    // Extract original File objects for API call
    const originalFiles = files.map((fileData) => fileData.file);
    console.log(
      "🚀 Sending original files to merge:",
      originalFiles.map((f) => ({ name: f.name, size: f.size, type: f.type }))
    );
    await mergePdfs(originalFiles);
  };

  // Handle file removal
  const handleFileRemove = (fileId: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
    toast.info("File removed");
  };

  // Handle files reordering
  const handleFilesReorder = (reorderedFiles: PDFFileData[]) => {
    setFiles(reorderedFiles);
  };

  // Reset all files
  const handleReset = () => {
    setFiles([]);
    toast.info("All files removed");
  };

  return (
    <div className="container mx-auto py-4">
      <ToolHeader title="Merge PDF File" description="Merge PDFs with just a few clicks. All are 100% FREE and easy to use." />

      <div className="mt-8 max-w-4xl mx-auto">
        {/* Upload Zone */}
        <FileUploadZone onDrop={handleFileUpload} isUploading={isLoading} disabled={isLoading} multiple={true} />

        {/* Progress Bar */}
        {isLoading && (
          <div className="mt-6">
            <ProgressBar progress={progress} />
          </div>
        )}

        {/* PDF Preview List */}
        <SimplePDFList files={files} onFilesReorder={handleFilesReorder} onFileRemove={handleFileRemove} />

        {/* Action Buttons */}
        {files.length > 0 && !isLoading && (
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size={"xl"} onClick={handleMergePdfs} disabled={files.length < 2} variant={"primary"}>
              <Download className="h-5 w-5" />
              Merge PDF ({files.length} files)
            </Button>

            <Button size={"xl"} onClick={handleReset} variant={"outline"}>
              Reset All
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
