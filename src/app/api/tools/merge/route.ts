import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(request: NextRequest) {
  console.log("🚀 Merge PDF API called");

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    console.log("📁 Files received:", files.length);

    if (!files || files.length === 0) {
      console.log("❌ No files provided");
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length < 2) {
      console.log("❌ Less than 2 files provided");
      return NextResponse.json({ error: "At least 2 PDF files are required for merging" }, { status: 400 });
    }

    // Validate each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`📄 Processing file ${i + 1}: ${file.name}, Size: ${file.size}, Type: ${file.type}`);

      if (file.type !== "application/pdf") {
        console.log(`❌ Invalid file type: ${file.type}`);
        return NextResponse.json({ error: `File ${file.name} is not a valid PDF` }, { status: 400 });
      }
    }

    console.log("✅ All files validated, starting merge...");

    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();

    // Process each file
    for (const file of files) {
      try {
        console.log(`🔄 Processing: ${file.name}`);
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Load the PDF
        const pdf = await PDFDocument.load(uint8Array);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

        console.log(`✅ Added ${pages.length} pages from ${file.name}`);

        // Add pages to merged PDF
        pages.forEach((page) => {
          mergedPdf.addPage(page);
        });
      } catch (error) {
        console.error(`❌ Error processing file ${file.name}:`, error);
        return NextResponse.json({ error: `Failed to process file: ${file.name}. Make sure it's a valid PDF.` }, { status: 400 });
      }
    }

    console.log("🔄 Generating merged PDF...");

    // Generate the merged PDF
    const pdfBytes = await mergedPdf.save();

    // Convert Uint8Array to Buffer for NextResponse
    const buffer = Buffer.from(pdfBytes);

    console.log(`✅ Merge successful! Final PDF size: ${buffer.length} bytes`);

    // Create response with the merged PDF
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="merged.pdf"',
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("💥 Merge PDF error:", error);
    return NextResponse.json({ error: "Failed to merge PDFs. Please try again." }, { status: 500 });
  }
}
