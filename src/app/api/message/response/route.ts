import { getContext } from "@/lib/context";
import { llm } from "@/lib/gemini";
import prisma from "@/lib/prisma";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { MessageRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, fileName, chatId, userId } = body;
    const context = await getContext(message, fileName);

    const systemMessage = [
      new SystemMessage(`Based on the provided context,  respons to the user's query...
        
        CONTEXT:
        ${context}
        
        RULES:
        - Answer the user's query based on the context.
        - Use a conversational tone.
        - Provide a clear and concise response.
        - Provide relevant and accurate information based on the context.
        - Answer the query based on the language used by the user.
        - If the user's query is not related to the context, respond with a generic "I'm sorry, I don't have the information you're looking for."
        `),
      new HumanMessage(message),
    ];
    const response = await llm.invoke(systemMessage);
    const content = response.content;

    await prisma.message.create({
      data: {
        content: content as string,
        role: MessageRole.SYSTEM,
        chatId,
        userId,
      },
    });
    return NextResponse.json(
      { message: content, role: MessageRole.SYSTEM },
      { status: 200 }
    );
  } catch (error) {}
}
