"use client";
import { useMutation } from "@tanstack/react-query";
import { Inbox, Loader } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

export default function FileUpload() {
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
    },
    onError: () => {
      toast.error("File upload failed");
    },
  });
  return (
    <div
      {...getRootProps()}
      className="bg-slate-200 w-full h-full border-dashed border-2 border-slate-400 flex flex-col items-center justify-center rounded-lg cursor-pointer hover:bg-slate-200/70 p-20">
      <input {...getInputProps()} accept="application/pdf" />
      <>
        {mutation.isPending ? (
          <Loader className="h-8 w-8 text-indigo-700 animate-spin" />
        ) : (
          <Inbox className="h-8 w-8 text-indigo-700" />
        )}
        <p className="text-sm text-muted-foreground">
          {mutation.isPending ? "Uploading..." : "Drag and drop your PDF here"}
        </p>
      </>
    </div>
  );
}
