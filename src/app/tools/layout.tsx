"use client";
import React from "react";

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <div className="h-full min-h-screen mt-14">{children}</div>;
}
