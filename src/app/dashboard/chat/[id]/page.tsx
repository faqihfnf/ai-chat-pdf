import { ResizablePanel } from "@/components/ui/resizable";
import React from "react";

export default function DetailChat() {
  return (
    <>
      <ResizablePanel defaultSize={55} minSize={30} className="h-full">
        PDF
      </ResizablePanel>

      <ResizablePanel defaultSize={30} minSize={20} className="h-full">
        Chat
      </ResizablePanel>
    </>
  );
}
