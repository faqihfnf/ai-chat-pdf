import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("files") as File;
    const splitMethod = formData.get("splitMethod") as string;
    const splitValue = formData.get("splitValue") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
    }

    console.log(`Processing split PDF: ${file.name}, method: ${splitMethod}, value: ${splitValue}`);

    // Read the PDF file
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const totalPages = pdfDoc.getPageCount();

    console.log(`PDF has ${totalPages} pages`);

    const splitRanges: Array<{ start: number; end: number; name: string }> = [];

    // Determine split ranges based on method
    switch (splitMethod) {
      case "pages":
        // Split every N pages
        const pagesPerSplit = parseInt(splitValue) || 1;
        for (let i = 0; i < totalPages; i += pagesPerSplit) {
          const start = i;
          const end = Math.min(i + pagesPerSplit - 1, totalPages - 1);
          splitRanges.push({
            start,
            end,
            name: `pages_${start + 1}-${end + 1}`,
          });
        }
        break;

      case "range":
        // Split by custom ranges (format: "1-3,4-6,7-9")
        const ranges = splitValue.split(",").map((range) => range.trim());
        ranges.forEach((range) => {
          const [startStr, endStr] = range.split("-").map((s) => s.trim());
          const start = parseInt(startStr) - 1; // Convert to 0-based
          const end = parseInt(endStr) - 1;

          if (start >= 0 && end < totalPages && start <= end) {
            splitRanges.push({
              start,
              end,
              name: `pages_${start + 1}-${end + 1}`,
            });
          }
        });
        break;

      case "single":
        // Split into single pages
        for (let i = 0; i < totalPages; i++) {
          splitRanges.push({
            start: i,
            end: i,
            name: `page_${i + 1}`,
          });
        }
        break;

      case "specific":
        // Split specific pages (format: "1,3,5,7")
        const pageNumbers = splitValue.split(",").map((p) => parseInt(p.trim()) - 1);
        pageNumbers.forEach((pageIndex) => {
          if (pageIndex >= 0 && pageIndex < totalPages) {
            splitRanges.push({
              start: pageIndex,
              end: pageIndex,
              name: `page_${pageIndex + 1}`,
            });
          }
        });
        break;

      default:
        return NextResponse.json({ error: "Invalid split method" }, { status: 400 });
    }

    if (splitRanges.length === 0) {
      return NextResponse.json({ error: "No valid page ranges to split" }, { status: 400 });
    }

    console.log(`Creating ${splitRanges.length} split files`);

    // Create split PDFs
    const splitPdfs: Array<{ name: string; data: Uint8Array }> = [];

    for (const range of splitRanges) {
      const newPdf = await PDFDocument.create();

      // Copy pages from original PDF
      for (let pageIndex = range.start; pageIndex <= range.end; pageIndex++) {
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageIndex]);
        newPdf.addPage(copiedPage);
      }

      const pdfBytes = await newPdf.save();
      splitPdfs.push({
        name: `${range.name}.pdf`,
        data: pdfBytes,
      });
    }

    // If only one file, return it directly as PDF
    if (splitPdfs.length === 1) {
      const singlePdf = splitPdfs[0];
      return new NextResponse(Buffer.from(singlePdf.data), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${singlePdf.name}"`,
        },
      });
    }

    // If multiple files, create a ZIP
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    splitPdfs.forEach((pdf) => {
      zip.file(pdf.name, pdf.data);
    });

    const zipBuffer = await zip.generateAsync({ type: "uint8array" });

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, "");
    const filename = `split_pdf_${timestamp}.zip`;

    return new NextResponse(Buffer.from(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error processing PDF split:", error);
    return NextResponse.json({ error: "Failed to split PDF. Please try again." }, { status: 500 });
  }
}
