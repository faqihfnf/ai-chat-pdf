"use client";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { Chat } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GripVertical, Loader, Trash } from "lucide-react";
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
      const res = await fetch(`/api/chat/${id}`, { method: "DELETE" });

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
      <ResizablePanel defaultSize={55} minSize={30} className="h-full">
        {isLoading ? (
          "Loading..."
        ) : (
          <div className="h-full">
            <div className="flex flex-row justify-between px-4 py-2 gap-4 items-center">
              <p className=" font-semibold">{data?.fileName}</p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  {/* Tombol ini sekarang berfungsi sebagai pemicu dialog */}
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

      <ResizablePanel defaultSize={30} minSize={20} className="h-full">
        Chat
      </ResizablePanel>
    </>
  );
}
