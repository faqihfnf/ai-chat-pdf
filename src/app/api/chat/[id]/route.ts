import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chat = await prisma.chat.findUnique({
      where: { id },
    });
    return NextResponse.json(chat, { status: 200 });
  } catch (error) {
    console.log(error);
  }
}
