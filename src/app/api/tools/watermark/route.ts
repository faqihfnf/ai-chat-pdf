import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const watermarkText = (formData.get("watermarkText") as string) || "WATERMARK";
    const opacity = parseFloat(formData.get("opacity") as string) || 0.5;
    const fontSize = parseFloat(formData.get("fontSize") as string) || 48;
    const position = (formData.get("position") as string) || "center";
    const color = (formData.get("color") as string) || "red";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
    }

    // Read the PDF file
    const pdfBytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Get font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Define color mapping
    const colorMap: { [key: string]: any } = {
      red: rgb(1, 0, 0),
      blue: rgb(0, 0, 1),
      green: rgb(0, 1, 0),
      black: rgb(0, 0, 0),
      gray: rgb(0.5, 0.5, 0.5),
      white: rgb(1, 1, 1),
    };

    const watermarkColor = colorMap[color] || rgb(1, 0, 0);

    // Get all pages
    const pages = pdfDoc.getPages();

    // Add watermark to each page
    pages.forEach((page) => {
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
      const textHeight = font.heightAtSize(fontSize);

      // Calculate position
      let x: number, y: number;

      switch (position) {
        case "top-left":
          x = 50;
          y = height - 50;
          break;
        case "top-right":
          x = width - textWidth - 50;
          y = height - 50;
          break;
        case "bottom-left":
          x = 50;
          y = 50;
          break;
        case "bottom-right":
          x = width - textWidth - 50;
          y = 50;
          break;
        case "center":
          x = (width - textWidth) / 2;
          y = (height - textHeight) / 2;
          break;
        case "default":
        default:
          x = (width - textWidth) / 2;
          y = (height - textHeight) / 2;
          break;
      }

      // Add watermark text with rotation for center position
      if (position === "default") {
        // For center position, add rotated text
        page.drawText(watermarkText, {
          x,
          y,
          size: fontSize,
          font,
          color: watermarkColor,
          opacity,
          rotate: degrees(45),
        });
      } else {
        // For other positions, add normal text
        page.drawText(watermarkText, {
          x,
          y,
          size: fontSize,
          font,
          color: watermarkColor,
          opacity,
        });
      }
    });

    // Save the PDF
    const modifiedPdfBytes = await pdfDoc.save();

    // Return the modified PDF
    return new NextResponse(Buffer.from(modifiedPdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="watermarked-${file.name}"`,
      },
    });
  } catch (error) {
    console.error("Error processing PDF watermark:", error);
    return NextResponse.json({ error: "Failed to add watermark to PDF" }, { status: 500 });
  }
}
