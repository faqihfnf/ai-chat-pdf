"use client";
import { Input } from "@/components/ui/input";
import MessageList from "./message-list";
import { Button } from "@/components/ui/button";
import { Send, FileText, BotMessageSquare } from "lucide-react";
import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Message, MessageRole } from "@prisma/client";
import { toast } from "sonner";

type Props = {
  fileName: string;
  chatId: string;
};

export default function ChatContainer({ fileName, chatId }: Props) {
  const [message, setMessage] = useState<string>("");

  const queryClient = useQueryClient();

  const {
    data: messages = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["messages", chatId],
    queryFn: async (): Promise<Message[]> => {
      const res = await fetch(`/api/message/${chatId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch messages");
      }
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!message.trim()) return;
      const response = await fetch("/api/message/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: message.trim(),
          chatId,
          role: MessageRole.USER,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      setMessage("");
      return await response.json();
    },
    onMutate: async () => {
      if (!message.trim()) return;

      await queryClient.cancelQueries({ queryKey: ["messages", chatId] });
      const previousMessages = queryClient.getQueryData(["messages", chatId]);

      queryClient.setQueryData(["messages", chatId], (old: Message[]) => {
        const optimisticMessage: Message = {
          id: "optimistic-" + Date.now(),
          content: message.trim(),
          role: MessageRole.USER,
          chatId,
          userId: "",
          createdAt: new Date(),
        };
        return old ? [...old, optimisticMessage] : [optimisticMessage];
      });

      return { previousMessages };
    },
    onSuccess: async (data) => {
      if (!data) return;

      queryClient.invalidateQueries({ queryKey: ["messages", chatId] });

      try {
        const res = await fetch("/api/message/response", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: data.content,
            fileName,
            chatId: data.chatId,
            userId: data.userId,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to get AI response");
        }

        queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
      } catch (error) {
        toast.error("Failed to get AI response");
        console.error("AI response error:", error);
      }
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ["messages", chatId],
          context.previousMessages
        );
      }
      toast.error("Failed to send message");
      console.error("Send message error:", error);
    },
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!message.trim() || mutation.isPending) return;
    mutation.mutate();
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-6">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error Loading Chat
          </div>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white p-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <BotMessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Chat with AI</h2>
            <p className="text-sm text-gray-500 truncate max-w-[300px]">
              {fileName
                ? fileName.replace(/^.*-(\d+)$/, "").replace(/\.[^/.]+$/, "")
                : "Document"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={messages}
        isSending={mutation.isPending}
        isLoading={isLoading}
      />

      {/* Input Form */}
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="flex-1">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              disabled={mutation.isPending}
              className="resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
            />
          </div>
          <Button
            type="submit"
            disabled={mutation.isPending || !message.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2.5"
            size="sm">
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <p className="text-xs text-gray-400 mt-2">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}
