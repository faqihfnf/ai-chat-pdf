import { LoadToPinecone } from "@/lib/pinecone";
import prisma from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Authentication user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Dapatkan data user dari Clerk
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file");

    // Validate file
    if (!file) {
      return NextResponse.json(
        { message: "File is required" },
        { status: 400 }
      );
    }

    if (!(file instanceof Blob)) {
      return NextResponse.json(
        { message: "Invalid file type" },
        { status: 400 }
      );
    }

    // Extract file details
    const fileSize = file.size;
    const mimeType = file.type;
    const originalFileName = file.name;
    const fileName = `${originalFileName}-${Date.now()}`;
    const bucketName = "documents";

    // Upload file to supabase
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file);

    if (error) {
      console.log(error);
      return NextResponse.json(error, { status: 500 });
    }

    const { data: publicUrlData } = await supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    // Upload to pinecone
    await LoadToPinecone(fileName);

    // Upsert user data (buat jika belum ada, update jika sudah ada)
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

    // Save document data to prisma
    await prisma.chat.create({
      data: {
        fileName: fileName,
        fileSize: fileSize,
        mimeType: mimeType,
        fileUrl: publicUrlData?.publicUrl,
        userId: userId, // Langsung gunakan Clerk userId
      },
    });

    return NextResponse.json(
      {
        message: "File Upload Successfully",
        publicUrl: publicUrlData?.publicUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(error, { status: 500 });
  }
}
