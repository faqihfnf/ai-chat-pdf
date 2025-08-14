import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { CloudCog } from "lucide-react";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    //# authentication user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    //# parse from data
    const formData = await request.formData();
    const file = formData.get("file");

    //# validate file
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
    //# Extract file details
    const fileSize = file.size;
    const mimeType = file.type;
    const originalFileName = file.name;
    const fileName = `${originalFileName}-${Date.now()}`;
    const bucketName = "documents";
    //# upload file to supabase
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file);
    if (error) {
      console.log(error);
      return NextResponse.json(error, { status: 500 });
    }
    const { data: publicUrlData } = await supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);
    console.log(publicUrlData.publicUrl);

    //# upload to pinecone
    //# save document data to prisma

    return NextResponse.json(
      { message: "File Upload Successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(error, { status: 500 });
  }
}
