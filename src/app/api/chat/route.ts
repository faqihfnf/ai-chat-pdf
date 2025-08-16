import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Upsert user data
    await prisma.user.upsert({
      where: {
        id: userId,
      },
      update: {
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        name: clerkUser.fullName,
      },
      create: {
        id: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        name: clerkUser.fullName,
      },
    });

    const userChat = await prisma.user.findUnique({
      where: {
        id: userId, // Langsung gunakan Clerk userId
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
  } catch (error) {
    console.log(error);
    return NextResponse.json(error, { status: 500 });
  }
}
