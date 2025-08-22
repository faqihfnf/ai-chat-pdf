"use client";

import { CloudUpload, Loader } from "lucide-react";
import { useDropzone } from "react-dropzone";
import React from "react";
import Image from "next/image";

// Tipe untuk props agar lebih jelas
interface FileUploadZoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  isUploading: boolean;
  disabled?: boolean;
  multiple?: boolean;
}

export default function FileUploadZone({ onDrop, isUploading, disabled = false, multiple = true }: FileUploadZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: disabled || isUploading,
    accept: { "application/pdf": [".pdf"] },
    multiple: multiple,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative w-full p-16 lg:p-20 flex flex-col items-center justify-center text-center
        border-2 border-dashed hover:border-dotted rounded-2xl transition-all duration-300 shadow-[0_0_15px_0_var(--tw-shadow-color)] hover:shadow-[0_0_25px_0_var(--tw-shadow-color)] shadow-orange-100 hover:shadow-orange-200
        ${
          disabled
            ? "border-gray-300 bg-gray-50 cursor-not-allowed opacity-70"
            : isDragActive
            ? "bg-gradient-to-tr from-amber-100 via-orange-100 to-rose-200 border-orange-400 cursor-pointer"
            : "hover:bg-gradient-to-tr hover:from-amber-100 hover:via-orange-100 hover:to-rose-200 border-orange-400 cursor-pointer"
        }
      `}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-100/50 via-orange-100/50 to-rose-200/50 -z-10 rounded-2xl opacity-80"></div>

      <input {...getInputProps()} />

      {isUploading ? (
        <>
          <Loader className="h-16 w-16 text-orange-600 animate-spin mb-4" />
          <p className="text-lg font-medium text-orange-700">Uploading...</p>
          <p className="text-sm text-gray-500 mt-1">Please wait while we process your documents.</p>
        </>
      ) : (
        <>
          {/* Ikon Cloud */}
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
            <Image src="/upload.svg" width={100} height={100} alt="upload" />
          </div>

          <p className="text-2xl font-semibold text-gray-700">Drag and drop your PDF here</p>
          <p className="text-md text-gray-500 mt-2">or click to browse your files</p>
        </>
      )}
    </div>
  );
}
