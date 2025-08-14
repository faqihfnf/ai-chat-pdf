import { ResizablePanel } from "@/components/ui/resizable";
import React from "react";
import FileUpload from "./_components/file-upload";

export default function Dashboard() {
  return (
    <ResizablePanel
      defaultSize={85}
      minSize={10}
      className="h-full grid place-items-center">
      <div className="flex flex-col items-center justify-center text-center gap-4 max-w-2xl">
        <h1 className="text-4xl font-bold">Chat with Any PDF</h1>
        <p className="text-lg text-muted-foreground ">
          Upload Any PDF, ask question and get answers instantly and in
          real-time with AI. It&apos;s that easy.
        </p>

        <div className="p-4 border-2  border-slate-400 rounded-lg shadow-xl">
          <FileUpload />
        </div>
      </div>
    </ResizablePanel>
  );
}
