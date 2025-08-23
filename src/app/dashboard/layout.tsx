"use client";
import { ResizablePanelGroup } from "@/components/ui/resizable";
import { UseMediaQuery } from "@/hooks/use-media-query";
import React from "react";
import ChatSidebar from "../../components/sections/dashboard/chat-sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const isMobile = UseMediaQuery("(max-width: 768px)");
  return (
    <div className="h-[calc(100vh)] mt-10">
      <ResizablePanelGroup direction={isMobile ? "vertical" : "horizontal"}>
        <ChatSidebar />
        {children}
      </ResizablePanelGroup>
    </div>
  );
}
