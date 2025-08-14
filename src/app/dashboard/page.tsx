import { ResizablePanel } from "@/components/ui/resizable";
import React from "react";

export default function Dashboard() {
  return (
    <ResizablePanel
      defaultSize={85}
      minSize={10}
      className="h-full grid place-items-center">
      Dashboard
    </ResizablePanel>
  );
}
