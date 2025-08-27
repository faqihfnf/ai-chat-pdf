import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("files") as File;
    const pagesToRemove = formData.get("pagesToRemove") as string;

    if (!file) {
      return NextResponse.json({ error: "No PDF file provided" }, { status: 400 });
    }

    if (!pagesToRemove) {
      return NextResponse.json({ error: "No pages to remove specified" }, { status: 400 });
    }

    // Parse pages to remove (comma-separated page numbers)
    const pageNumbers = pagesToRemove
      .split(",")
      .map((p) => parseInt(p.trim()))
      .filter((p) => !isNaN(p) && p > 0);

    if (pageNumbers.length === 0) {
      return NextResponse.json({ error: "Invalid page numbers provided" }, { status: 400 });
    }

    console.log("Processing PDF:", file.name, "Removing pages:", pageNumbers);

    // Read the PDF file
    const pdfBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    const totalPages = pdfDoc.getPageCount();
    console.log("Total pages in PDF:", totalPages);

    // Validate page numbers
    const invalidPages = pageNumbers.filter((p) => p > totalPages);
    if (invalidPages.length > 0) {
      return NextResponse.json({ error: `Invalid page numbers: ${invalidPages.join(", ")}. PDF has only ${totalPages} pages.` }, { status: 400 });
    }

    // Sort page numbers in descending order to avoid index issues when removing
    const sortedPages = pageNumbers.sort((a, b) => b - a);

    // Remove pages (convert to 0-based index)
    for (const pageNumber of sortedPages) {
      const pageIndex = pageNumber - 1;
      pdfDoc.removePage(pageIndex);
      console.log(`Removed page ${pageNumber} (index ${pageIndex})`);
    }

    const remainingPages = pdfDoc.getPageCount();
    console.log("Remaining pages:", remainingPages);

    if (remainingPages === 0) {
      return NextResponse.json({ error: "Cannot remove all pages from PDF" }, { status: 400 });
    }

    // Save the modified PDF
    const modifiedPdfBytes = await pdfDoc.save();

    const buffer = Buffer.from(modifiedPdfBytes);

    console.log("PDF processing completed successfully");

    // Return the modified PDF
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=removed_pages.pdf",
      },
    });
  } catch (error) {
    console.error("Error processing PDF:", error);

    let errorMessage = "Failed to remove pages from PDF";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
