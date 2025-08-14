"use client";
import { ResizablePanelGroup } from "@/components/ui/resizable";
import { UseMediaQuery } from "@/hooks/use-media-query";
import React from "react";
import ChatSidebar from "./_components/chat-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = UseMediaQuery("(max-width: 768px)");
  return (
    <div className="h-[calc(100vh-56px)] mt-14">
      <ResizablePanelGroup direction={isMobile ? "vertical" : "horizontal"}>
        <ChatSidebar />
        {children}
      </ResizablePanelGroup>
    </div>
  );
}
