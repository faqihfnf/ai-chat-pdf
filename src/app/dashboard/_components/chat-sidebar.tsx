import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { GripVertical, Upload } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function ChatSidebar() {
  return (
    <>
      <ResizablePanel defaultSize={15} minSize={10}>
        <div className="h-full bg-slate-700 flex flex-col items-center">
          <div className="p-4 w-full">
            <Link href="/dashboard" className="w-full">
              <Button className="w-full border-2 border-dotted border-slate-300 text-xs">
                <Upload />
                <span className="mt-0.5">Upload PDF</span>
              </Button>
            </Link>
          </div>
        </div>
      </ResizablePanel>

      <div className="relative flex items-center">
        <ResizableHandle className="bg-slate-100 w-0.5 h-full" />
        <div className="absolute inset-0 flex items-center pointer-events-none justify-center">
          <div className="bg-slate-100 py-1 rounded">
            <GripVertical className="h-4 w-4 text-slate-900 " />
          </div>
        </div>
      </div>
    </>
  );
}
