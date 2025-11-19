import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  console.log("[Parse PDF API] Request received");

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.error("[Parse PDF API] No file provided");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("[Parse PDF API] File received:", file.name, file.type, file.size);

    // Validate file type
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
    }

    // Convert File to Buffer
    console.log("[Parse PDF API] Converting file to buffer...");
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PDF using pdf-parse v2 class-based API
    console.log("[Parse PDF API] Parsing PDF with pdf-parse...");
    // @ts-ignore - pdf-parse is a CommonJS module that needs require()
    // eslint-disable-next-line
    const { PDFParse } = require("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    await parser.load();
    const pdfData = await parser.getText();

    console.log("[Parse PDF API] Extraction complete, text length:", pdfData.text.length);
    console.log("[Parse PDF API] PDF info - pages:", pdfData.numpages);

    if (!pdfData.text || !pdfData.text.trim()) {
      return NextResponse.json(
        { error: "PDF appears to be empty or contains no extractable text" },
        { status: 400 }
      );
    }

    console.log("[Parse PDF API] Returning extracted text");
    return NextResponse.json({ text: pdfData.text.trim() });
  } catch (error: any) {
    console.error("[Parse PDF API] Error:", error);
    if (error instanceof Error) {
      console.error("[Parse PDF API] Error message:", error.message);
      console.error("[Parse PDF API] Error stack:", error.stack);
    }
    return NextResponse.json(
      { error: error?.message || "Failed to parse PDF" },
      { status: 500 }
    );
  }
}

