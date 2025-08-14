import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userChat = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
      include: {
        chat: {
          orderBy: {
            uploadedAt: "desc",
          },
        },
      },
    });

    const chats = userChat?.chat;

    return NextResponse.json(chats, { status: 200 });
  } catch (error) {}
}
