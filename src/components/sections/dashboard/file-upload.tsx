"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader, TriangleAlert } from "lucide-react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

export default function FileUpload() {
  const MAX_CHATS = 3; // Batas maksimal chat per user
  const queryClient = useQueryClient();

  // Query untuk mendapatkan data chats dan menghitung credit
  const { data: chatsData } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const res = await fetch("/api/chat");
      return await res.json();
    },
  });

  // Hitung sisa credit
  const usedChats = chatsData?.length || 0;
  const remainingCredits = MAX_CHATS - usedChats;
  const isMaxReached = usedChats >= MAX_CHATS;

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    onDrop: (file) => {
      if (isMaxReached) {
        toast.error("Maximum document limit reached! You can only have 3 documents.");
        return;
      }
      mutation.mutate(file[0]);
    },
    disabled: isMaxReached, // Disable dropzone jika sudah maksimal
  });

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      // Double check limit sebelum upload
      if (isMaxReached) {
        throw new Error("Maximum document limit reached (3/3)");
      }

      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error("File upload failed");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast.success("File uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
    onError: (err) => {
      console.error(err);
      toast.error(err.message || "File upload failed");
    },
  });

  return (
    <div className="w-full h-full relative">
      <div
        {...getRootProps()}
        className={`
          w-full h-full border-dashed border-1 flex flex-col items-center justify-center rounded-lg p-20 transition-all duration-300 ease-in-out
          ${
            isMaxReached
              ? "bg-gradient-to-tr from-red-50/30 via-red-100/30 to-red-200/30 border-red-400 cursor-not-allowed opacity-60"
              : "bg-gradient-to-tr from-amber-100/50 via-orange-100/50 to-rose-200/50 hover:bg-gradient-to-tr hover:from-amber-100 hover:via-orange-100 hover:to-rose-200 border-orange-400 cursor-pointer"
          }
        `}
      >
        <input {...getInputProps()} accept="application/pdf" />

        {mutation.isPending ? (
          <>
            <Loader className="h-20 w-20 text-orange-700 animate-spin" />
            <p className="text-md text-medium mt-2 text-orange-700 animate-pulse">Uploading Document...</p>
          </>
        ) : isMaxReached ? (
          <>
            <div className="relative">
              <Image src="/upload.svg" width={100} height={100} alt="upload" className="opacity-30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
            </div>
            <p className="text-md font-medium mt-4 text-red-600 text-center">Document Limit Reached</p>
            <p className="text-sm text-red-500 text-center mt-1">You have reached the maximum of {MAX_CHATS} documents</p>
            <div className="mt-4 px-4 py-2 bg-red-100/50 border border-red-300 rounded-lg">
              <p className="text-xs text-red-700 text-center">Delete an existing document to upload a new one</p>
            </div>
          </>
        ) : (
          <>
            <Image src="/upload.svg" width={100} height={100} alt="upload" />
            <p className="text-md font-medium mt-4 animate-pulse">Drag and drop your PDF here</p>
            <p className="text-sm text-gray-600 mt-1">{remainingCredits === 1 ? "⚠️ Last document remaining" : `${remainingCredits} documents remaining`}</p>
          </>
        )}
      </div>

      {/* Credit Status Overlay (ketika hampir limit) */}
      {!isMaxReached && remainingCredits <= 1 && (
        <div className="absolute flex gap-1 top-4 right-4 bg-amber-100 border border-amber-300 rounded-lg px-3 py-2">
          <TriangleAlert className="w-4 h-4 text-amber-800" />
          <p className="text-xs text-amber-800 font-medium mt-0.5">{remainingCredits === 0 ? "Last document!" : `${remainingCredits} document remaining`}</p>
        </div>
      )}
    </div>
  );
}
