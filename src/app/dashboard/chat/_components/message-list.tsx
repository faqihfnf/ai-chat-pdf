"use client";

import { Message, MessageRole } from "@prisma/client";
import clsx from "clsx";
import { useEffect } from "react";
import { User, Bot } from "lucide-react";

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
      '<code class="bg-gray-200 px-1 py-0.5 rounded text-sm font-mono">$1</code>'
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
      className="flex-1 flex flex-col gap-4 p-4 overflow-auto bg-gray-50">
      {isLoading && (
        <div className="flex items-center gap-3 p-4">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-blue-600" />
          </div>
          <div className="bg-white rounded-2xl rounded-tl-md px-4 py-2 shadow-sm">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
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
              message.role === MessageRole.USER ? "bg-blue-500" : "bg-gray-100"
            )}>
            {message.role === MessageRole.USER ? (
              <User className="w-4 h-4 text-white" />
            ) : (
              <Bot className="w-4 h-4 text-gray-600" />
            )}
          </div>

          {/* Message Bubble */}
          <div
            className={clsx(
              "rounded-2xl px-4 py-2 shadow-sm",
              message.role === MessageRole.USER
                ? "bg-blue-500 text-white rounded-tr-md"
                : "bg-white text-gray-800 rounded-tl-md border border-gray-200"
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
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-gray-600" />
          </div>
          <div className="bg-white rounded-2xl rounded-tl-md px-4 py-2 shadow-sm border border-gray-200">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
