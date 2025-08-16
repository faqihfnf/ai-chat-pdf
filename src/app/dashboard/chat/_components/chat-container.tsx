"use client";
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

  // Function untuk reset textarea height
  const resetTextareaHeight = () => {
    const textarea = document.querySelector("textarea");
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = "40px"; // Reset ke height yang sama dengan button (h-10 = 40px)
    }
  };

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
      const messageContent = message.trim(); // Simpan untuk reset
      setMessage("");
      resetTextareaHeight(); // Reset height setelah clear message
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

  // Function untuk handle textarea change dan auto-resize
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize textarea dengan max height yang lebih kecil
    const target = e.target;
    target.style.height = "auto";
    target.style.height =
      Math.min(Math.max(target.scrollHeight, 40), 100) + "px"; // Min 40px, max 100px
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-6">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error Loading Chat
          </div>
          <p className="text-slate-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white p-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <BotMessageSquare className="w-5 h-5 text-indigo-600" />
          </div>
          <h2 className="font-semibold text-lg text-slate-900">Chat with AI</h2>
        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={messages}
        isSending={mutation.isPending}
        isLoading={isLoading}
      />

      {/* Input Form */}
      <div className="border-t border-slate-200 bg-white p-2">
        <form onSubmit={handleSubmit} className="flex items-end gap-2 mt-1">
          <div className="flex-1 -mb-1">
            <textarea
              value={message}
              onChange={handleTextareaChange}
              placeholder="Type your message here..."
              disabled={mutation.isPending}
              className="w-full h-10 py-2 px-3 border border-slate-300 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 disabled:bg-slate-100 overflow-hidden"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                } else if (e.key === "Enter" && e.shiftKey) {
                  // Allow default behavior for line break
                }
              }}
            />
          </div>
          <Button
            type="submit"
            disabled={mutation.isPending || !message.trim()}
            className="bg-orange-500 hover:bg-orange-600 mb-0.5 text-white h-10 w-10 p-0 flex-shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <p className="text-[11px] text-slate-400">
          Press Enter to Send Chat. Shift + Enter for New Line
        </p>
      </div>
    </div>
  );
}
