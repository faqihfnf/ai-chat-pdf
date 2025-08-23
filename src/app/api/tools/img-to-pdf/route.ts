import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, PageSizes } from "pdf-lib";

export async function POST(request: NextRequest) {
  try {
    console.log("🖼️ Starting Images to PDF conversion...");

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    console.log(`📄 Processing ${files.length} image files`);

    // Validation
    if (!files || files.length === 0) {
      console.error("❌ No files provided");
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Validate file types
    const supportedTypes = ["image/jpeg", "image/jpg", "image/png"];
    const invalidFiles = files.filter((file) => !supportedTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      console.error(
        "❌ Invalid file types:",
        invalidFiles.map((f) => f.type)
      );
      return NextResponse.json(
        {
          error: `Invalid file types. Only JPG and PNG are supported. Found: ${invalidFiles.map((f) => f.type).join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Check file sizes (5MB limit per image)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      console.error(
        "❌ Oversized files:",
        oversizedFiles.map((f) => `${f.name}: ${f.size}`)
      );
      return NextResponse.json(
        {
          error: `Some files are too large. Maximum 5MB per image. Oversized files: ${oversizedFiles.map((f) => f.name).join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    console.log("🔧 Processing images...");

    // Process each image file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`📷 Processing image ${i + 1}/${files.length}: ${file.name}`);

      try {
        // Convert file to ArrayBuffer
        const imageBuffer = await file.arrayBuffer();

        let image;

        // Embed image based on type
        if (file.type === "image/jpeg" || file.type === "image/jpg") {
          image = await pdfDoc.embedJpg(imageBuffer);
        } else if (file.type === "image/png") {
          image = await pdfDoc.embedPng(imageBuffer);
        } else {
          console.warn(`⚠️ Skipping unsupported image type: ${file.type}`);
          continue;
        }

        // Get image dimensions
        const imageDims = image.size();
        console.log(`📐 Image dimensions: ${imageDims.width}x${imageDims.height}`);

        // Calculate page size to fit image (with some padding)
        const maxWidth = PageSizes.A4[0] - 40; // A4 width minus padding
        const maxHeight = PageSizes.A4[1] - 40; // A4 height minus padding

        let pageWidth = imageDims.width;
        let pageHeight = imageDims.height;

        // Scale down if image is larger than A4
        if (imageDims.width > maxWidth || imageDims.height > maxHeight) {
          const scaleX = maxWidth / imageDims.width;
          const scaleY = maxHeight / imageDims.height;
          const scale = Math.min(scaleX, scaleY);

          pageWidth = imageDims.width * scale;
          pageHeight = imageDims.height * scale;
        }

        // Add page with appropriate size
        const page = pdfDoc.addPage([pageWidth + 40, pageHeight + 40]); // Add padding

        // Draw image centered on page
        page.drawImage(image, {
          x: 20, // 20px padding from left
          y: 20, // 20px padding from bottom
          width: pageWidth,
          height: pageHeight,
        });

        console.log(`✅ Added image ${i + 1} to PDF`);
      } catch (imageError) {
        console.error(`❌ Error processing image ${file.name}:`, imageError);
        return NextResponse.json(
          {
            error: `Failed to process image: ${file.name}. Please ensure it's a valid image file.`,
          },
          { status: 400 }
        );
      }
    }

    console.log("💾 Generating PDF...");

    // Serialize the PDF document
    const pdfBytes = await pdfDoc.save();

    // Convert Uint8Array to Buffer for NextResponse
    const buffer = Buffer.from(pdfBytes);

    console.log(`✅ PDF generated successfully! Size: ${pdfBytes.length} bytes`);

    // Return the PDF as response
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("💥 Fatal error in Images to PDF conversion:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An unexpected error occurred during conversion",
      },
      { status: 500 }
    );
  }
}
