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

      {/* <div className="w-full h-full relative">
        <div className="w-full h-full border-dashed border-1 flex flex-col items-center justify-center rounded-lg p-20 transition-all duration-300 ease-in-out">
          <div className="p-4 border-1 w-full h-[350px] border-slate-200 rounded-lg shadow-[0_0_15px_0_var(--tw-shadow-color)] hover:shadow-[0_0_25px_0_var(--tw-shadow-color)] shadow-orange-100 hover:shadow-orange-200 transition-all duration-300 ease-in-out">
            <Image src="/upload.svg" width={100} height={100} alt="upload" />
            <p className="text-md font-medium mt-4 animate-pulse">Drag and drop your PDF here</p>
          </div>
        </div>
      </div> */}
    </div>
  );
}
