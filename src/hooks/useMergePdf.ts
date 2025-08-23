import { useState } from "react";
import { toast } from "sonner";

interface UseMergePdfReturn {
  mergePdfs: (files: File[]) => Promise<void>;
  isLoading: boolean;
  progress: number;
}

export const useMergePdf = (): UseMergePdfReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const mergePdfs = async (files: File[]) => {
    if (files.length < 2) {
      toast.error("Please select at least 2 PDF files to merge");
      return;
    }

    setIsLoading(true);
    setProgress(0);

    try {
      console.log(
        "🚀 Starting merge process with files:",
        files.map((f) => ({ name: f.name, size: f.size, type: f.type }))
      );

      // Validate files before sending
      for (const file of files) {
        if (file.type !== "application/pdf") {
          toast.error(`File "${file.name}" is not a valid PDF`);
          setIsLoading(false);
          setProgress(0);
          return;
        }
        if (file.size === 0) {
          toast.error(`File "${file.name}" is empty`);
          setIsLoading(false);
          setProgress(0);
          return;
        }
      }

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Create FormData
      const formData = new FormData();
      files.forEach((file, index) => {
        console.log(`📁 Adding file ${index + 1}: ${file.name}`);
        formData.append("files", file);
      });

      console.log("📤 Sending request to API...");

      // Send request to API
      const response = await fetch("/api/tools/merge", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      console.log("📥 Response status:", response.status);
      console.log("📥 Response headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorMessage = "Failed to merge PDFs";

        try {
          // Try to parse as JSON first
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          // If not JSON, get text content
          const errorText = await response.text();
          console.error("❌ Non-JSON error response:", errorText.substring(0, 200));

          if (errorText.includes("<!DOCTYPE")) {
            errorMessage = "Server error occurred. Please check the server logs.";
          } else {
            errorMessage = errorText.substring(0, 100) || errorMessage;
          }
        }

        throw new Error(errorMessage);
      }

      // Check if response is actually a PDF
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/pdf")) {
        const responseText = await response.text();
        console.error("❌ Expected PDF but got:", contentType, responseText.substring(0, 200));
        throw new Error("Server returned unexpected content type");
      }

      // Get the merged PDF as blob
      const blob = await response.blob();
      console.log("✅ PDF blob created, size:", blob.size);

      if (blob.size === 0) {
        throw new Error("Received empty PDF file");
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `merged_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("PDFs merged successfully!");
    } catch (error) {
      console.error("💥 Error merging PDFs:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to merge PDFs";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  return {
    mergePdfs,
    isLoading,
    progress,
  };
};
