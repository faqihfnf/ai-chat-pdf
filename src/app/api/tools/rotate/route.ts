import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, degrees } from "pdf-lib";

export async function POST(request: NextRequest) {
  try {
    console.log("=== Rotate PDF API Started ===");

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("files") as File;
    const rotationAngle = (formData.get("rotation") as string) || "90"; // Default 90 degrees
    const rotateAll = (formData.get("rotateAll") as string) || "true"; // Rotate all pages by default
    const specificPages = (formData.get("specificPages") as string) || ""; // e.g., "1,3,5" or "1-3,5"

    console.log("Form data:", {
      fileName: file?.name,
      rotation: rotationAngle,
      rotateAll,
      specificPages,
    });

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    // Validate file size (30MB max)
    const maxSize = 30 * 1024 * 1024; // 30MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size too large. Maximum 30MB allowed" }, { status: 400 });
    }

    // Validate rotation angle
    const rotation = parseInt(rotationAngle);
    if (![90, 180, 270].includes(rotation)) {
      return NextResponse.json({ error: "Invalid rotation angle. Must be 90, 180, or 270 degrees" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log(`Processing PDF rotation: ${file.name} (${buffer.length} bytes)`);

    // Load PDF document
    const pdfDoc = await PDFDocument.load(buffer);
    const pageCount = pdfDoc.getPageCount();
    console.log(`PDF loaded. Pages: ${pageCount}, Rotation: ${rotation}°`);

    // Determine which pages to rotate
    let pagesToRotate: number[] = [];

    if (rotateAll === "true") {
      // Rotate all pages
      pagesToRotate = Array.from({ length: pageCount }, (_, i) => i);
      console.log(`Rotating all ${pageCount} pages`);
    } else if (specificPages) {
      // Parse specific pages (e.g., "1,3,5" or "1-3,5")
      try {
        pagesToRotate = parsePageNumbers(specificPages, pageCount);
        console.log(`Rotating specific pages: ${pagesToRotate.map((p) => p + 1).join(", ")}`);
      } catch (parseError) {
        const errorMsg = parseError instanceof Error ? parseError.message : "Invalid page numbers";
        console.log(`Page parsing error: ${errorMsg}`);
        return NextResponse.json(
          {
            error: errorMsg,
            details: `Your PDF has ${pageCount} page${pageCount > 1 ? "s" : ""}. Please use valid page numbers.`,
          },
          { status: 400 }
        );
      }
    }

    if (pagesToRotate.length === 0) {
      return NextResponse.json({ error: "No pages specified for rotation" }, { status: 400 });
    }

    // Get all pages
    const pages = pdfDoc.getPages();

    // Rotate specified pages
    let rotatedCount = 0;
    pagesToRotate.forEach((pageIndex) => {
      if (pageIndex >= 0 && pageIndex < pages.length) {
        const page = pages[pageIndex];
        const currentRotation = page.getRotation().angle;
        const newRotation = (currentRotation + rotation) % 360;

        page.setRotation(degrees(newRotation));
        rotatedCount++;

        console.log(`Page ${pageIndex + 1}: ${currentRotation}° -> ${newRotation}°`);
      }
    });

    console.log(`Successfully rotated ${rotatedCount} pages`);

    // Save the rotated PDF
    const rotatedPdfBytes = await pdfDoc.save({
      useObjectStreams: false,
      addDefaultPage: false,
    });

    const rotatedSize = rotatedPdfBytes.length;
    console.log(`Rotated PDF saved: ${rotatedSize} bytes`);

    const responseBuffer = Buffer.from(rotatedPdfBytes);

    // Create response
    const response = new NextResponse(responseBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="rotated_${rotation}deg_${file.name}"`,
        "Content-Length": rotatedSize.toString(),
        "X-Original-Size": buffer.length.toString(),
        "X-Rotated-Size": rotatedSize.toString(),
        "X-Rotation-Angle": rotation.toString(),
        "X-Pages-Rotated": rotatedCount.toString(),
        "X-Total-Pages": pageCount.toString(),
      },
    });

    console.log("=== Rotate PDF API Completed Successfully ===");
    return response;
  } catch (error) {
    console.error("=== ERROR in Rotate PDF API ===");
    console.error("Error:", error instanceof Error ? error.message : String(error));
    console.error("Stack:", error instanceof Error ? error.stack : "No stack");

    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      if (errorMessage.includes("invalid pdf") || errorMessage.includes("pdf parsing")) {
        return NextResponse.json({ error: "Invalid PDF file format" }, { status: 400 });
      }

      if (errorMessage.includes("encrypted") || errorMessage.includes("password")) {
        return NextResponse.json({ error: "Cannot rotate password-protected PDFs" }, { status: 400 });
      }

      if (errorMessage.includes("memory") || errorMessage.includes("heap")) {
        return NextResponse.json({ error: "File too large to process" }, { status: 400 });
      }

      return NextResponse.json(
        {
          error: `Rotation failed: ${error.message.substring(0, 100)}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: "PDF rotation failed" }, { status: 500 });
  }
}

// Helper function to parse page numbers like "1,3,5" or "1-3,5"
function parsePageNumbers(pageStr: string, totalPages: number): number[] {
  const pages: Set<number> = new Set();
  const parts = pageStr
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (parts.length === 0) {
    throw new Error("No page numbers provided");
  }

  for (const part of parts) {
    if (part.includes("-")) {
      // Range like "1-3"
      const rangeParts = part.split("-").map((s) => s.trim());
      if (rangeParts.length !== 2) {
        throw new Error(`Invalid range format: "${part}". Use format like "1-3"`);
      }

      const start = parseInt(rangeParts[0]);
      const end = parseInt(rangeParts[1]);

      if (isNaN(start) || isNaN(end)) {
        throw new Error(`Invalid numbers in range: "${part}"`);
      }

      if (start < 1 || end > totalPages) {
        throw new Error(`Page range "${part}" is out of bounds. PDF has ${totalPages} page${totalPages > 1 ? "s" : ""} (1-${totalPages})`);
      }

      if (start > end) {
        throw new Error(`Invalid range "${part}": start page cannot be greater than end page`);
      }

      for (let i = start; i <= end; i++) {
        pages.add(i - 1); // Convert to 0-based index
      }
    } else {
      // Single page like "5"
      const pageNum = parseInt(part);
      if (isNaN(pageNum)) {
        throw new Error(`Invalid page number: "${part}"`);
      }
      if (pageNum < 1 || pageNum > totalPages) {
        throw new Error(`Page ${pageNum} is out of bounds. PDF has ${totalPages} page${totalPages > 1 ? "s" : ""} (1-${totalPages})`);
      }
      pages.add(pageNum - 1); // Convert to 0-based index
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}
