"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";

interface UsePdfProcessorApiOptions {
  tool: string;
  minFiles?: number;
  maxFiles?: number;
  maxFileSize?: number;
  successMessage?: string;
  downloadFileName?: string;
  compressionLevel?: "low" | "recommended" | "extreme";
  skipFileTypeValidation?: boolean;
  splitMode?: "pages" | "ranges";
  pageRanges?: string;
  password?: string;
}

interface UsePdfProcessorApiReturn {
  processFiles: (files: File[]) => Promise<void>;
  isLoading: boolean;
  progress: number;
  error: string | null;
}

export const usePdfProcessorApi = (options: UsePdfProcessorApiOptions): UsePdfProcessorApiReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    tool,
    minFiles = 1,
    maxFiles = 1,
    maxFileSize,
    successMessage = "Files processed successfully!",
    downloadFileName = "processed",
    compressionLevel = "recommended",
    skipFileTypeValidation = false,
    splitMode = "pages",
    pageRanges,
    password,
  } = options;

  const validateFiles = useCallback(
    (files: File[]): boolean => {
      if (files.length < minFiles) {
        const message = `Please select at least ${minFiles} file${minFiles > 1 ? "s" : ""}`;
        toast.error(message);
        return false;
      }

      if (maxFiles && files.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        return false;
      }

      if (maxFileSize && files.some((file) => file.size > maxFileSize)) {
        toast.error(`Maximum file size is ${maxFileSize / 1024 / 1024} MB per file`);
        return false;
      }

      // Validate each file
      for (const file of files) {
        if (!skipFileTypeValidation && file.type !== "application/pdf") {
          toast.error(`File "${file.name}" is not a valid PDF`);
          return false;
        }

        if (file.size === 0) {
          toast.error(`File "${file.name}" is empty`);
          return false;
        }

        // Check for reasonable file size (max 100MB untuk API)
        if (file.size > 100 * 1024 * 1024) {
          toast.error(`File "${file.name}" is too large. Maximum 100MB per file for API processing.`);
          return false;
        }
      }

      return true;
    },
    [minFiles, maxFiles, maxFileSize, skipFileTypeValidation]
  );

  const downloadFile = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, []);

  const startProgressSimulation = useCallback(() => {
    let currentProgress = 0;
    setProgress(0);

    progressIntervalRef.current = setInterval(() => {
      currentProgress += Math.random() * 3 + 1; // Random increment between 1-4%

      // Slow down as we approach certain milestones
      if (currentProgress > 85) {
        currentProgress += Math.random() * 0.5; // Very slow near the end
      } else if (currentProgress > 70) {
        currentProgress += Math.random() * 1; // Slower after 70%
      }

      // Cap at 95% until actual completion
      if (currentProgress >= 95) {
        currentProgress = 95;
      }

      setProgress(Math.floor(currentProgress));
    }, 200); // Update every 200ms for smooth animation
  }, []);

  const completeProgress = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setProgress(100);
  }, []);

  const resetProgress = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setProgress(0);
  }, []);

  const processFiles = useCallback(
    async (files: File[]) => {
      if (!validateFiles(files)) return;

      setIsLoading(true);
      startProgressSimulation();
      setError(null);

      try {
        console.log(
          `Starting ${tool} process via API route for files:`,
          files.map((f) => ({ name: f.name, size: f.size, type: f.type }))
        );

        // Create FormData to send files to API route
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        // Add tool-specific parameters
        if (tool === "compress") {
          formData.append("compressionLevel", compressionLevel);
        } else if (tool === "split") {
          formData.append("splitMode", splitMode);
          if (pageRanges) {
            formData.append("pageRanges", pageRanges);
          }
        } else if (tool === "unlock" && password) {
          formData.append("password", password);
        }

        // Call the appropriate API route with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes timeout

        const response = await fetch(`/api/tools/${tool}`, {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          let errorMessage = `Failed to ${tool} PDF files`;

          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (error) {
            // If we can't parse JSON, use status text
            errorMessage = response.statusText || errorMessage;
            console.error("Failed to parse error response:", error);
          }

          // Handle specific error codes
          if (response.status === 401) {
            errorMessage = "Authentication failed. Please check your iLovePDF API credentials.";
          } else if (response.status === 429) {
            errorMessage = "Monthly file limit exceeded. Please upgrade your iLovePDF plan.";
          } else if (response.status === 413) {
            errorMessage = "File too large. Please use a smaller file.";
          }

          throw new Error(errorMessage);
        }

        // Check if response is actually a PDF
        const contentType = response.headers.get("content-type");
        if (!contentType?.includes("application/pdf") && !contentType?.includes("application/octet-stream")) {
          // Might be an error response in JSON format
          try {
            const errorData = await response.json();
            throw new Error(errorData.error || "Invalid response format");
          } catch (error) {
            throw new Error("Invalid response format - expected PDF file" + error);
          }
        }

        // Get the blob response
        const resultBlob = await response.blob();
        console.log("Download completed, blob size:", resultBlob.size);

        if (resultBlob.size === 0) {
          throw new Error("Received empty file from API");
        }

        completeProgress();

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, "");
        const filename = `${downloadFileName}_${timestamp}.pdf`;

        // Try to get filename from response headers if available
        // const contentDisposition = response.headers.get("Content-Disposition");
        // if (contentDisposition) {
        //   const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
        //   if (filenameMatch) {
        //     filename = filenameMatch[1];
        //   }
        // }

        // Download the file
        downloadFile(resultBlob, filename);

        // Show success message
        let message = successMessage;
        if (tool === "compress") {
          const originalSize = files.reduce((total, file) => total + file.size, 0);
          const compressedSize = resultBlob.size;
          const compressionRatio = Math.round(((originalSize - compressedSize) / originalSize) * 100);
          message = `PDF compressed successfully! Reduced by ${compressionRatio}%`;
        }

        toast.success(message);
      } catch (error) {
        console.error(`Error processing files with ${tool}:`, error);

        let errorMessage = `Failed to ${tool} PDF files`;

        if (error instanceof Error) {
          errorMessage = error.message;

          // Handle specific error types
          if (error.name === "AbortError") {
            errorMessage = "Request timed out. Please try with a smaller file or try again later.";
          }
        }

        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
        setTimeout(() => resetProgress(), 1000);
      }
    },
    [tool, validateFiles, downloadFile, successMessage, downloadFileName, compressionLevel, splitMode, pageRanges, password, startProgressSimulation, completeProgress, resetProgress]
  );

  return {
    processFiles,
    isLoading,
    progress,
    error,
  };
};
