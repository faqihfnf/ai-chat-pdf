"use client";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { Chat } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { GripVertical, Trash } from "lucide-react";
import { useParams } from "next/navigation";
import React from "react";

export default function DetailChat() {
  const { id } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["chats", id],
    queryFn: async (): Promise<Chat> => {
      const res = await fetch(`/api/chat/${id}`);
      return await res.json();
    },
  });

  if (isError) return <div>Error...</div>;
  return (
    <>
      <ResizablePanel defaultSize={55} minSize={30} className="h-full">
        {isLoading ? (
          "Loading..."
        ) : (
          <div className="h-full">
            <div className="flex flex-row justify-between px-4 py-2 gap-4 items-center">
              <p className=" font-semibold">{data?.fileName}</p>
              <Button size={"icon"} variant={"destructive"}>
                <Trash />
              </Button>
            </div>
            <iframe
              src={`${data?.fileUrl}#view=fitH`}
              className="w-full h-full"></iframe>
          </div>
        )}
      </ResizablePanel>
      {/* Handler Resizer */}
      <div className="relative flex items-center">
        <ResizableHandle className="bg-slate-100 w-0.5 h-full" />
        <div className="absolute inset-0 flex items-center pointer-events-none justify-center">
          <div className="bg-slate-100 py-1 rounded">
            <GripVertical className="h-4 w-4 text-slate-900 " />
          </div>
        </div>
      </div>

      <ResizablePanel defaultSize={30} minSize={20} className="h-full">
        Chat
      </ResizablePanel>
    </>
  );
}
