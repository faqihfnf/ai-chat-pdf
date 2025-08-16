"use client";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { Chat } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BotMessageSquare,
  FileText,
  GripVertical,
  Loader,
  Trash,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ChatContainer from "../_components/chat-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function DetailChat() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["chats", id],
    queryFn: async (): Promise<Chat> => {
      const res = await fetch(`/api/chat/${id}`);
      return await res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/chat/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete chat");

      return await res.json();
    },
    onSuccess: () => {
      toast.success("Chat deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      router.push("/dashboard");
    },
    onError: () => {
      toast.error("Failed to delete chat");
    },
  });

  if (isError) return <div>Error...</div>;
  return (
    <>
      <ResizablePanel defaultSize={40} minSize={30} className="h-full">
        {isLoading ? (
          <>
            <Skeleton className="w-full h-14 bg-slate-50 flex items-center justify-center" />
            <div className="flex items-center gap-3 mt-4">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white rounded-md px-4 py-2 shadow-sm">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}></div>
                  <div
                    className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full">
            <div className="flex flex-row justify-between p-2 gap-4 items-center">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className=" font-semibold">{data?.fileName}</h2>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={mutation.isPending}
                    size={"icon"}
                    variant={"destructive"}>
                    {mutation.isPending ? (
                      <Loader className="animate-spin" />
                    ) : (
                      <Trash />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tindakan ini tidak dapat dibatalkan. Ini akan menghapus
                      chat secara permanen dari server kami.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => mutation.mutate()}
                      className={"bg-red-600 hover:bg-red-700"}>
                      Hapus
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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

      <ResizablePanel defaultSize={50} minSize={20} className="h-full">
        <ChatContainer
          fileName={data?.fileName as string}
          chatId={id as string}
        />
      </ResizablePanel>
    </>
  );
}
