"use client";

import { Message, MessageRole } from "@prisma/client";
import clsx from "clsx";
import { useEffect } from "react";

type Props = {
  messages: Message[];
  isSending: boolean;
  isLoading: boolean;
};
export default function MessageList({ messages, isSending, isLoading }: Props) {
  useEffect(() => {
    const messageList = document.getElementById("message-list");
    if (messageList) {
      messageList.scrollTo({
        top: messageList.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);
  return (
    <div
      id="message-list"
      className="flex-1 flex flex-col gap-2 p-2 overflow-auto">
      {isLoading && <p>Loading ...</p>}
      {messages.map((messages) => (
        <div
          key={messages.id}
          className={clsx(
            "text-sm p-2 bg-slate-100 rounded-lg",
            messages.role === MessageRole.USER
              ? "self-end bg-slate-300"
              : "self-start border-slate-200 border-1"
          )}>
          {messages.content}
        </div>
      ))}
      {isSending && (
        <p className="text-sm p-2 rounded-lg self-start border-slate-200 border-1 animate-pulse">
          Retrieving answer ...
        </p>
      )}
    </div>
  );
}
