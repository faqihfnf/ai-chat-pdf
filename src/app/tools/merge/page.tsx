"use client";
import FileUpload from "@/components/sections/dashboard/file-upload";
import FileUploadZone from "@/components/sections/tools/FileUploadZone";
import ToolHeader from "@/components/sections/tools/ToolHeader";
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";

export default function MergePage() {
  const [isUploading, setIsUploading] = useState(false);

  // Fungsi ini akan dipanggil ketika file di-drop
  const handleFileUpload = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      return;
    }

    // Mulai proses upload
    setIsUploading(true);
    toast.info(`Uploading ${acceptedFiles.length} file(s)...`);

    // --- Di sini Anda bisa meletakkan logika `mutation.mutate(...)` ---
    // Contoh simulasi upload:
    setTimeout(() => {
      setIsUploading(false);
      toast.success("Files uploaded successfully!");
      console.log(acceptedFiles);
    }, 2000); // Simulasi waktu upload 2 detik
  };
  return (
    <div className="container mx-auto py-4">
      <ToolHeader title="Merge PDFs" description="Merge PDFs with just a few clicks. All are 100% FREE and easy to use." />

      <div className="mt-8 max-w-4xl mx-auto">
        <FileUploadZone onDrop={handleFileUpload} isUploading={isUploading} />
      </div>
    </div>
  );
}
