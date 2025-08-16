"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

export default function FileUpload() {
  const queryClient = useQueryClient();
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    onDrop: (file) => {
      mutation.mutate(file[0]);
    },
  });

  const mutation = useMutation({
    mutationFn: async (file: File) => {
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
    onError: () => {
      toast.error("File upload failed");
    },
  });
  return (
    <div
      {...getRootProps()}
      className="bg-gradient-to-tr from-amber-100/50 via-orange-100/50 to-rose-200/50 hover:bg-gradient-to-tr hover:from-amber-100 hover:via-orange-100 hover:to-rose-200 w-full h-full border-dashed border-1 border-orange-400 flex flex-col items-center justify-center rounded-lg cursor-pointer p-20 transition-all duration-300 ease-in-out">
      <input {...getInputProps()} accept="application/pdf" />
      <>
        {mutation.isPending ? (
          <>
            <Loader className="h-20 w-20 text-orange-700 animate-spin" />
            <p className="text-md text-medium mt-2 text-orange-700 animate-pulse">
              Uploading Document...
            </p>
          </>
        ) : (
          <>
            <Image src="/upload.svg" width={100} height={100} alt="upload" />
            <p className="text-md text-medium mt-2 animate-pulse">
              Drag and drop your PDF here
            </p>
          </>
        )}
      </>
    </div>
  );
}
