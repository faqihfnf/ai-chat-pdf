import { type NextRequest, NextResponse } from "next/server";

// Manual implementation using direct HTTP requests to iLovePDF API
async function compressPDFManually(files: File[], compressionLevel: string, publicKey: string, secretKey: string) {
  console.log("=== Starting manual compress PDF process ===");
  console.log("Public Key:", publicKey.substring(0, 15) + "...");
  console.log("Secret Key:", secretKey ? "EXISTS" : "MISSING");
  console.log(`Processing ${files.length} file(s) with compression level: ${compressionLevel}`);

  try {
    console.log("Starting manual PDF compression...");

    // Step 1: Get auth token
    console.log("Step 1: Getting auth token...");
    const authResponse = await fetch("https://api.ilovepdf.com/v1/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        public_key: publicKey,
      }),
    });

    console.log("Auth response status:", authResponse.status);
    if (!authResponse.ok) {
      const authError = await authResponse.text();
      console.error("Auth error:", authError);
      throw new Error(`Authentication failed (${authResponse.status}): ${authError}`);
    }

    const authData = await authResponse.json();
    const token = authData.token;
    console.log("✅ Auth token received");

    // Step 2: Start compress task
    console.log("Step 2: Starting compress task...");
    const startResponse = await fetch("https://api.ilovepdf.com/v1/start/compress", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Start task response status:", startResponse.status);
    if (!startResponse.ok) {
      const startError = await startResponse.text();
      console.error("Start task error:", startError);
      throw new Error(`Failed to start task (${startResponse.status}): ${startError}`);
    }

    const startData = await startResponse.json();
    const taskId = startData.task;
    const serverUrl = startData.server;
    console.log(`✅ Task started: ${taskId} on server: ${serverUrl}`);

    // Step 3: Upload files
    console.log("Step 3: Uploading files...");
    const uploadedFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`Uploading file ${i + 1}/${files.length}: ${file.name}`);

      const uploadFormData = new FormData();
      uploadFormData.append("task", taskId);
      uploadFormData.append("file", file);

      const uploadResponse = await fetch(`https://${serverUrl}/v1/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      console.log(`Upload response for ${file.name}: ${uploadResponse.status}`);
      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.text();
        console.error(`Upload error for ${file.name}:`, uploadError);
        throw new Error(`Failed to upload ${file.name} (${uploadResponse.status}): ${uploadError}`);
      }

      const uploadData = await uploadResponse.json();
      uploadedFiles.push(uploadData);
      console.log(`✅ File ${file.name} uploaded:`, uploadData);
    }

    // Step 4: Process files
    console.log("Step 4: Processing files...");

    const processPayload = {
      task: taskId,
      tool: "compress",
      files: uploadedFiles.map((file) => ({
        server_filename: file.server_filename,
        filename: file.filename || file.server_filename,
      })),
      compression_level: compressionLevel === "extreme" ? "extreme" : compressionLevel === "low" ? "low" : "recommended",
    };

    console.log("Process payload:", JSON.stringify(processPayload, null, 2));

    const processResponse = await fetch(`https://${serverUrl}/v1/process`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(processPayload),
    });

    console.log("Process response status:", processResponse.status);
    if (!processResponse.ok) {
      const errorData = await processResponse.text();
      console.error("Process error:", errorData);
      throw new Error(`Failed to process files (${processResponse.status}): ${errorData}`);
    }

    const processData = await processResponse.json();
    console.log("✅ Processing completed:", processData);

    // Step 5: Download result
    console.log("Step 5: Downloading result...");
    const downloadResponse = await fetch(`https://${serverUrl}/v1/download/${taskId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Download response status:", downloadResponse.status);
    if (!downloadResponse.ok) {
      const downloadError = await downloadResponse.text();
      console.error("Download error:", downloadError);
      throw new Error(`Failed to download result (${downloadResponse.status}): ${downloadError}`);
    }

    const resultBuffer = await downloadResponse.arrayBuffer();
    console.log("✅ Download completed, result size:", resultBuffer.byteLength);

    return Buffer.from(resultBuffer);
  } catch (error) {
    console.error("=== Error in compress route ===", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Starting compress PDF process...");

    // Get environment variables
    const publicKey = process.env.ILOVEPDF_PUBLIC_KEY;
    const secretKey = process.env.ILOVEPDF_SECRET_KEY;

    if (!publicKey || !secretKey) {
      console.error("Missing iLovePDF API keys");
      return NextResponse.json({ error: "API keys not configured" }, { status: 500 });
    }

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const compressionLevel = (formData.get("compressionLevel") as string) || "recommended";

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const resultBuffer = await compressPDFManually(files, compressionLevel, publicKey, secretKey);

    // Return the PDF file
    return new NextResponse(resultBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="compressed.pdf"',
        "Content-Length": resultBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error compressing PDF:", error);

    let errorMessage = "Failed to compress PDF";
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      if (error.message.includes("remaining files")) {
        statusCode = 429;
        errorMessage = "Monthly file limit exceeded. Please upgrade your iLovePDF plan.";
      } else if (error.message.includes("unauthorized") || error.message.includes("401")) {
        statusCode = 401;
        errorMessage = "Authentication failed. Please check your iLovePDF API credentials.";
      } else if (error.message.includes("Invalid token") || error.message.includes("JWT")) {
        statusCode = 401;
        errorMessage = "Authentication token error. Please verify your iLovePDF API keys.";
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
