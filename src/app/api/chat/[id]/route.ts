import { deleteNamespace } from "@/lib/pinecone";
import prisma from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
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

//# delete
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chat = await prisma.chat.delete({
      where: { id },
    });

    //# delete from supabase
    await supabase.storage.from("documents").remove([chat.fileName]);

    //# delete from pinecone
    await deleteNamespace(chat.fileName);

    return NextResponse.json(chat, { status: 200 });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}
