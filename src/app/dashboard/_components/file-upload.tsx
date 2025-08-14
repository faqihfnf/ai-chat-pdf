"use client";
import { Inbox } from "lucide-react";
import { useDropzone } from "react-dropzone";

export default function FileUpload() {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    onDrop: () => {},
  });
  return (
    <div
      {...getRootProps()}
      className="bg-slate-200 w-full h-full border-dashed border-2 border-slate-400 flex flex-col items-center justify-center rounded-lg cursor-pointer hover:bg-slate-200/70 p-20">
      <input {...getInputProps()} accept="application/pdf" />
      <div className="flex flex-col items-center gap-4">
        <Inbox className="h-8 w-8 text-indigo-700" />
        <p>Drag and drop your PDF here, or click to select a file</p>
      </div>
    </div>
  );
}
