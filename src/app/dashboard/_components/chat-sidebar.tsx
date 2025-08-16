"use client";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { Skeleton } from "@/components/ui/skeleton";
import formatFileName from "@/lib/format-file-name";
import { cn } from "@/lib/utils";
import { chat } from "@pinecone-database/pinecone/dist/assistant/data/chat";
import { Chat } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GripVertical, Loader, Upload } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

export default function ChatSidebar() {
  const { data, isLoading } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const res = await fetch("/api/chat");
      return await res.json();
    },
  });

  const { id } = useParams();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error("File upload failed");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast.success("File uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
    onError: (err) => {
      console.error(err);
      toast.error("File upload failed");
    },
  });

  const { getInputProps, open } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles[0]) {
        mutation.mutate(acceptedFiles[0]);
      }
    },
    noClick: true, // Mencegah pembukaan dialog file saat area lain diklik
    noKeyboard: true,
  });

  return (
    <>
      <ResizablePanel defaultSize={15} minSize={10}>
        <div className="h-full bg-slate-700 flex flex-col items-center">
          <div className="p-4 w-full">
            <input {...getInputProps()} />

            {/* 4. Ubah Link menjadi Button dengan onClick dan state loading */}
            <Button
              className="w-full border-2 border-dotted border-slate-300 text-xs hover:text-orange-300 hover:border-orange-300"
              onClick={open} // Panggil fungsi 'open' untuk memicu upload
              disabled={mutation.isPending} // Nonaktifkan tombol saat proses upload
            >
              {mutation.isPending ? (
                <>
                  <Loader className="h-4 w-4 animate-spin text-orange-300" />
                  <span className="animate-pulse text-orange-300">
                    Uploading PDF...
                  </span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span className="mt-0.5">Upload PDF</span>
                </>
              )}
            </Button>
          </div>
          <div className="h-full overflow-y-auto w-full p-4 flex-1">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="w-full h-8 mb-4" />
              ))
            ) : (
              <div className="w-full flex flex-col gap-2">
                {data?.map((chat: Chat) => (
                  <Link
                    key={chat.id}
                    href={`/dashboard/chat/${chat.id}`}
                    className={cn(
                      "w-full truncate text-xs bg-slate-900/10 text-slate-100 hover:bg-slate-900/30 hover:text-orange-300 p-2 mb-1 rounded-md",
                      {
                        "bg-slate-900/40 text-orange-400": chat.id === id,
                      }
                    )}>
                    {formatFileName(chat.fileName)}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
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
    </>
  );
}
