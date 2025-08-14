"use client";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { Skeleton } from "@/components/ui/skeleton";
import { Chat } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { GripVertical, Upload } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function ChatSidebar() {
  const { data, isLoading } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const res = await fetch("/api/chat");
      return await res.json();
    },
  });
  return (
    <>
      <ResizablePanel defaultSize={15} minSize={10}>
        <div className="h-full bg-slate-700 flex flex-col items-center">
          <div className="p-4 w-full">
            <Link href="/dashboard" className="w-full">
              <Button className="w-full border-2 border-dotted border-slate-300 text-xs hover:text-indigo-300">
                <Upload />
                <span className="mt-0.5">Upload PDF</span>
              </Button>
            </Link>
          </div>
          <div className="h-full overflow-y-auto w-full p-4 flex-1">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="w-full h-8 mb-4" />
              ))
            ) : (
              <div className="w-full flex flex-col gap-2">
                {data.map((chat: Chat) => (
                  <Link
                    key={chat.id}
                    href={`/dashboard/chat/${chat.id}`}
                    className="w-full truncate text-xs bg-slate-900/10 text-slate-100 hover:bg-slate-900/30 hover:text-indigo-300 p-2 mb-1 rounded-md">
                    {chat.fileName}
                  </Link>
                ))}
              </div>
            )}
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
