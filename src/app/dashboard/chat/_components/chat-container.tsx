"use client";
import { Input } from "@/components/ui/input";
import MessageList from "./message-list";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
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
      if (!message) return;
      const response = await fetch("/api/message/send", {
        method: "POST",
        body: JSON.stringify({
          content: message,
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
    onMutate: async ({
      content,
      chatId,
      role,
    }: {
      content: string;
      chatId: string;
      role: MessageRole;
    }) => {
      await queryClient.cancelQueries({ queryKey: ["messages", chatId] });
      const previousMessages = queryClient.getQueryData(["messages", chatId]);

      queryClient.setQueryData(["messages", chatId], (old: Message[]) => {
        const optimisticMessage: Message = {
          id: "optimistic" + Date.now(),
          content: content,
          role,
          chatId,
          userId: "",
          createdAt: new Date(),
        };
        return old ? [...old, optimisticMessage] : [optimisticMessage];
      });

      return { previousMessages };
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
      const res = await fetch("/api/message/response", {
        method: "POST",
        body: JSON.stringify({
          message: data.content,
          fileName,
          chatId: data.chatId,
          userId: data.userId,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to send message");
      }
      queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
    },
    onError: () => {
      toast.error("Failed to send message");
    },
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    mutation.mutate({
      content: message!,
      chatId,
      role: MessageRole.USER,
    });
  }

  if (error) return <p>Error : {error.message}</p>;

  return (
    <div className="flex flex-col h-full">
      <div className="p-3">
        <h2 className="font-semibold text-xl">Chat with AI</h2>
      </div>
      <MessageList
        messages={messages}
        isSending={mutation.isPending}
        isLoading={isLoading}
      />
      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={mutation.isPending}
        />
        <Button type="submit" disabled={mutation.isPending}>
          <Send />
        </Button>
      </form>
    </div>
  );
}
