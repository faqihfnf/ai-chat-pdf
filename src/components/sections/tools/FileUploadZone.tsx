"use client";

import { Loader } from "lucide-react";
import { useDropzone } from "react-dropzone";
import React, { useMemo } from "react";
import Image from "next/image";
import { FILE_UPLOAD_LIMITS } from "@/constant/file-upload-limit";
import { toast } from "sonner";

// Enhanced interface with missing props
interface FileUploadZoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  isUploading: boolean;
  disabled?: boolean;
  multiple?: boolean;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxFileSize?: number;
  currentFileCount?: number; // TAMBAHAN: untuk mengetahui jumlah file yang sudah ada
}

const limits = FILE_UPLOAD_LIMITS.MERGE_PDF;

export default function FileUploadZone({
  onDrop,
  isUploading,
  disabled = false,
  multiple = true,
  acceptedTypes = [".pdf"], // Default to PDF
  maxFiles = limits.maxFiles, // Default max files
  maxFileSize = limits.maxFileSize, // Default 50MB
  currentFileCount = 0, // TAMBAHAN: default 0
}: FileUploadZoneProps) {
  const finalMaxFiles = maxFiles;
  const finalMaxFileSize = maxFileSize;

  // TAMBAHAN: Hitung sisa slot file yang bisa diupload
  const remainingSlots = Math.max(0, finalMaxFiles - currentFileCount);
  const isMaxReached = currentFileCount >= finalMaxFiles;

  // Convert acceptedTypes array to dropzone format
  const acceptConfig = useMemo(() => {
    const config: Record<string, string[]> = {};

    acceptedTypes.forEach((type) => {
      if (type === ".pdf") {
        config["application/pdf"] = [".pdf"];
      } else if (type === ".jpg" || type === ".jpeg") {
        config["image/jpeg"] = [".jpg", ".jpeg"];
      } else if (type === ".png") {
        config["image/png"] = [".png"];
      }
    });
    return config;
  }, [acceptedTypes]);

  // Enhanced onDrop handler with validation and toast notifications
  const handleDrop = (acceptedFiles: File[], rejectedFiles: any[]) => {
    // TAMBAHAN: Cek jika sudah mencapai maksimum file
    if (isMaxReached) {
      toast.error(`Maximum ${finalMaxFiles} files allowed. Please remove some files first.`);
      return;
    }

    // TAMBAHAN: Cek jika file yang akan diupload melebihi sisa slot
    if (acceptedFiles.length > remainingSlots) {
      toast.error(`Can only add ${remainingSlots} more file(s). You currently have ${currentFileCount}/${finalMaxFiles} files.`);
      return;
    }

    // Handle rejected files first
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach((rejectedFile) => {
        const { file, errors } = rejectedFile;

        errors.forEach((error: any) => {
          switch (error.code) {
            case "file-too-large":
              toast.error(`File "${file.name}" is too large. Maximum ${Math.round(finalMaxFileSize / (1024 * 1024))}MB allowed.`);
              break;
            case "file-invalid-type":
              toast.error(`File "${file.name}" has invalid format. Only ${acceptedTypes.join(", ")} files are allowed.`);
              break;
            case "too-many-files":
              toast.error(`Too many files selected. Maximum ${remainingSlots} more files allowed.`);
              break;
            default:
              toast.error(`File "${file.name}" was rejected: ${error.message}`);
              break;
          }
        });
      });
    }

    // Handle accepted files
    if (acceptedFiles.length > 0) {
      // Additional validation for edge cases
      const validFiles = acceptedFiles.filter((file) => {
        // Check if file is empty
        if (file.size === 0) {
          toast.error(`File "${file.name}" is empty and cannot be processed.`);
          return false;
        }

        // Check file extension manually (backup validation)
        const fileExtension = file.name.toLowerCase().split(".").pop();
        const allowedExtensions = acceptedTypes.map((type) => type.replace(".", ""));

        if (!allowedExtensions.includes(fileExtension || "")) {
          toast.error(`File "${file.name}" has unsupported format.`);
          return false;
        }

        return true;
      });

      if (validFiles.length > 0) {
        // Show success message for valid files
        if (validFiles.length === 1) {
          toast.success(`"${validFiles[0].name}" uploaded successfully!`);
        } else {
          toast.success(`${validFiles.length} files uploaded successfully!`);
        }

        // Call the parent onDrop handler with valid files only
        onDrop(validFiles);
      }
    } else if (rejectedFiles.length === 0) {
      // No files selected at all
      toast.info("No files selected.");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    disabled: disabled || isUploading || isMaxReached, // TAMBAHAN: disable jika sudah max
    accept: acceptConfig,
    multiple: multiple && !isMaxReached, // TAMBAHAN: disable multiple jika sudah max
    maxFiles: multiple ? Math.min(remainingSlots, maxFiles) : 1, // TAMBAHAN: batasi berdasarkan sisa slot
    maxSize: maxFileSize,
    noClick: isUploading || isMaxReached, // TAMBAHAN: disable click jika sudah max
    noKeyboard: isUploading || isMaxReached, // TAMBAHAN: disable keyboard jika sudah max
  });

  // Generate accept types text for display
  const acceptedTypesText = acceptedTypes.map((type) => type.toUpperCase()).join(", ");

  return (
    <div
      {...getRootProps()}
      className={`
        relative w-full p-14 flex flex-col items-center justify-center text-center
        border-2 border-dashed hover:border-dotted rounded-2xl transition-all duration-300 
        shadow-[0_0_15px_0_var(--tw-shadow-color)] hover:shadow-[0_0_25px_0_var(--tw-shadow-color)] 
        shadow-orange-100 hover:shadow-orange-200
        ${
          disabled || isMaxReached
            ? "border-slate-300 bg-slate-50 cursor-not-allowed opacity-70"
            : isDragActive
            ? "bg-gradient-to-tr from-amber-100 via-orange-100 to-rose-200 border-orange-400 cursor-pointer"
            : "hover:bg-gradient-to-tr hover:from-amber-100 hover:via-orange-100 hover:to-rose-200 border-orange-400 cursor-pointer"
        }
      `}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-100/50 via-orange-100/50 to-rose-200/50  dark:from-amber-200 dark:via-orange-200 dark:to-rose-300 -z-10 rounded-2xl"></div>

      <input {...getInputProps()} />

      {isUploading ? (
        <>
          <Loader className="h-16 w-16 text-orange-600 animate-spin mb-4" />
          <p className="text-lg font-medium text-orange-700">Uploading...</p>
          <p className="text-sm text-slate-500 mt-1">Please wait while we process your documents.</p>
        </>
      ) : isMaxReached ? ( // TAMBAHAN: tampilan ketika sudah maksimum
        <>
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4 opacity-50">
            <Image src="/upload.svg" width={100} height={100} alt="upload" />
          </div>
          <p className="text-2xl font-semibold text-slate-500">Maximum files reached</p>
          <p className="text-md text-slate-400 mt-2">
            You have uploaded {currentFileCount}/{finalMaxFiles} files
          </p>
          <p className="text-sm text-slate-400 mt-1 mb-8">Remove some files to upload more</p>
        </>
      ) : (
        <>
          {/* Upload Icon */}
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
            <Image src="/upload.svg" width={100} height={100} alt="upload" />
          </div>

          <p className="text-2xl font-semibold text-slate-700">
            Drag and drop your {acceptedTypesText} {multiple ? "files" : "file"} here
          </p>
          <p className="text-md text-slate-500 mt-2">or click to browse your files</p>

          {/* File constraints info */}
          <div className="mt-5 flex flex-row gap-5 mb-4 text-xs text-slate-400 space-y-1">
            <p>• Accepted formats: {acceptedTypesText}</p>
            {multiple && (
              <p>
                • Maximum {maxFiles} files {currentFileCount > 0 && `(${remainingSlots} remaining)`}
              </p>
            )}{" "}
            {/* TAMBAHAN: tampilkan sisa slot */}
            <p>• Maximum {Math.round(maxFileSize / (1024 * 1024))}MB per file</p>
          </div>
        </>
      )}
    </div>
  );
}
