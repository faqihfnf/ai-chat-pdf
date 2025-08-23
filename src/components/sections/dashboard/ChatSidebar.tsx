"use client";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { Skeleton } from "@/components/ui/skeleton";
import formatFileName from "@/lib/format-file-name";
import { cn } from "@/lib/utils";
import { Chat } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GripVertical, Loader, Upload, AlertCircle, Trash } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function ChatSidebar() {
  const MAX_CHATS = 3; // Batas maksimal chat per user

  const { data, isLoading } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const res = await fetch("/api/chat");
      return await res.json();
    },
  });

  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);

  // Hitung sisa credit
  const usedChats = data?.length || 0;
  const remainingCredits = MAX_CHATS - usedChats;
  const isMaxReached = usedChats >= MAX_CHATS;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (chatId: string) => {
      const res = await fetch(`/api/chat/${chatId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete chat");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Chat deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      // Redirect ke dashboard jika chat yang dihapus sedang aktif
      if (chatToDelete === id) {
        router.push("/dashboard");
      }
      setDeleteDialogOpen(false);
      setChatToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete chat");
      setDeleteDialogOpen(false);
      setChatToDelete(null);
    },
  });

  const handleDeleteClick = (e: React.MouseEvent, chatId: string) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();
    setChatToDelete(chatId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (chatToDelete) {
      deleteMutation.mutate(chatToDelete);
    }
  };

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // Cek limit sebelum upload
      if (isMaxReached) {
        throw new Error("Maximum chat limit reached (3/3)");
      }

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
      toast.error(err.message || "File upload failed");
    },
  });

  const { getInputProps, open } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles[0]) {
        if (isMaxReached) {
          toast.error("Maximum chat limit reached! You can only have 3 documents.");
          return;
        }
        uploadMutation.mutate(acceptedFiles[0]);
      }
    },
    noClick: true, // Mencegah pembukaan dialog file saat area lain diklik
    noKeyboard: true,
    disabled: isMaxReached, // Disable dropzone jika sudah maksimal
  });

  return (
    <>
      <ResizablePanel defaultSize={15} minSize={12}>
        <div className="h-full bg-slate-700 flex flex-col items-center mt-4">
          <div className="p-4 w-full">
            <input {...getInputProps()} />
            {/* Upload Button */}
            <Button
              className={cn(
                "w-full border-2 border-dotted text-xs transition-all duration-200",
                isMaxReached
                  ? "border-red-400 text-red-400 bg-red-50/10 cursor-not-allowed opacity-60"
                  : "border-slate-300 hover:text-orange-300 hover:border-orange-300 dark:border-slate-800 dark:hover:text-orange-500 dark:hover:border-orange-500"
              )}
              onClick={isMaxReached ? undefined : open}
              disabled={uploadMutation.isPending || isMaxReached}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader className="h-4 w-4 animate-spin text-orange-300" />
                  <span className="animate-pulse text-orange-300">Uploading PDF...</span>
                </>
              ) : isMaxReached ? (
                <>
                  <AlertCircle className="h-4 w-4" />
                  <span className="mt-0.5">Limit Reached</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span className="mt-0.5">Upload PDF</span>
                </>
              )}
            </Button>
          </div>

          <div className="h-full overflow-y-auto w-full px-4 flex-1">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="w-full h-8 mb-4" />)
            ) : (
              <>
                <div className="w-full flex flex-col gap-2">
                  {data?.map((chat: Chat) => (
                    <div key={chat.id} className="relative group">
                      <Link
                        href={`/dashboard/chat/${chat.id}`}
                        className={cn("w-full truncate text-xs bg-slate-900/10 text-slate-100 hover:bg-slate-900/30 hover:text-orange-300 p-2 mb-1 rounded-md flex items-center justify-between pr-8", {
                          "bg-slate-900/40 text-orange-400": chat.id === id,
                        })}
                      >
                        <span className="truncate">{formatFileName(chat.fileName)}</span>
                      </Link>

                      {/* Delete Button */}
                      <Button
                        size={"icon"}
                        onClick={(e) => handleDeleteClick(e, chat.id)}
                        disabled={deleteMutation.isPending && chatToDelete === chat.id}
                        className={cn(
                          "absolute right-0 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200",
                          deleteMutation.isPending && chatToDelete === chat.id ? "bg-transparent cursor-not-allowed" : "bg-transparent hover:bg-transparent text-orange-300 hover:text-red-500"
                        )}
                        title={deleteMutation.isPending && chatToDelete === chat.id ? "Deleting..." : "Delete chat"}
                      >
                        <span className="mb-1">{deleteMutation.isPending && chatToDelete === chat.id ? <Loader className="h-3 w-3 animate-spin" /> : <Trash className="h-3 w-3 " />}</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Credit Information Section */}
          <div className="w-full p-4">
            <div
              className={cn(
                "text-xs text-slate-200 mb-4 w-full p-3 rounded-md border transition-all duration-200",
                isMaxReached ? "bg-red-500/20 border-red-400/30" : remainingCredits === 1 ? "bg-amber-500/20 border-amber-400/30" : "bg-blue-500/20 border-blue-400/30"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-xs">Documents</span>
                <span className={cn("font-bold", isMaxReached ? "text-red-300" : "text-slate-200")}>
                  {usedChats}/{MAX_CHATS}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800/50 rounded-md h-1.5 mb-2">
                <div className={cn("h-1.5 rounded-md transition-all duration-300", isMaxReached ? "bg-red-400" : remainingCredits === 1 ? "bg-amber-400" : "bg-blue-400")} style={{ width: `${(usedChats / MAX_CHATS) * 100}%` }} />
              </div>

              <div className="text-[9px] opacity-75">{isMaxReached ? "⚠️ Max limit reached" : remainingCredits === 1 ? "⚠️ 1 docs remaining" : `${remainingCredits} docs remaining`}</div>
            </div>
          </div>
        </div>
      </ResizablePanel>

      {/* Handler Resizer */}
      <div className="relative flex items-center">
        <ResizableHandle className="bg-slate-700 w-0.5 h-full" />
        <div className="absolute inset-0 flex items-center pointer-events-none justify-center">
          <div className="bg-slate-100 py-1 rounded">
            <GripVertical className="h-4 w-4 text-slate-900 " />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan. Ini akan menghapus chat secara permanen dari server kami.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteMutation.isPending} className="bg-red-600 hover:bg-red-700">
              {deleteMutation.isPending ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  Menghapus...
                </>
              ) : (
                "Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
