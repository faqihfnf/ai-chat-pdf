import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, chatId, role } = body;
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

    const message = await prisma.message.create({
      data: {
        content,
        chatId,
        role,
        userId: userId, // Langsung gunakan Clerk userId
      },
    });

    return NextResponse.json(message, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(error, { status: 500 });
  }
}
