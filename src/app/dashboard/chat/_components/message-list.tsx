"use client";

import { Message, MessageRole } from "@prisma/client";
import clsx from "clsx";
import { useEffect } from "react";
import { User, BotMessageSquare } from "lucide-react";

type Props = {
  messages: Message[];
  isSending: boolean;
  isLoading: boolean;
};

// Function untuk render markdown-like text
function renderMarkdownText(text: string) {
  // Replace bold text (**text** atau *text*)
  let formattedText = text
    .replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>") // Bold + Italic
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold
    .replace(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, "<em>$1</em>") // Italic
    .replace(
      /`([^`]+)`/g,
      '<code class="bg-slate-200 px-1 py-0.5 rounded text-sm font-mono">$1</code>'
    ) // Inline code
    .replace(/\n/g, "<br />"); // Line breaks

  return { __html: formattedText };
}

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
      className="flex-1 flex flex-col gap-4 p-4 overflow-auto">
      {isLoading && (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <BotMessageSquare className="w-4 h-4 text-white" />
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
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          className={clsx(
            "flex gap-3 max-w-[80%]",
            message.role === MessageRole.USER
              ? "self-end flex-row-reverse"
              : "self-start"
          )}>
          {/* Avatar */}
          <div
            className={clsx(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
              message.role === MessageRole.USER
                ? "bg-indigo-500"
                : "bg-orange-500"
            )}>
            {message.role === MessageRole.USER ? (
              <User className="w-5 h-5 text-white" />
            ) : (
              <BotMessageSquare className="w-5 h-5 text-white" />
            )}
          </div>

          {/* Message Bubble */}
          <div
            className={clsx(
              "rounded-2xl px-4 py-2 shadow-sm",
              message.role === MessageRole.USER
                ? "bg-indigo-50 rounded-md"
                : "bg-orange-50 rounded-md"
            )}>
            <div
              className={clsx(
                "text-sm leading-relaxed",
                message.role === MessageRole.SYSTEM &&
                  "prose prose-sm max-w-none"
              )}
              dangerouslySetInnerHTML={renderMarkdownText(message.content)}
            />
          </div>
        </div>
      ))}

      {isSending && (
        <div className="flex items-center gap-3 max-w-[80%] self-start">
          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
            <BotMessageSquare className="w-4 h-4 text-slate-600" />
          </div>
          <div className="bg-white rounded-2xl rounded-tl-md px-4 py-2 shadow-sm border border-slate-200">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}></div>
              <div
                className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
