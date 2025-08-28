import { useState, useCallback } from "react";
import { toast } from "sonner";

interface UsePdfProcessorOptions {
  apiEndpoint: string;
  minFiles?: number;
  maxFiles?: number;
  maxFileSize?: number;
  successMessage?: string;
  downloadFileName?: string;
  skipFileTypeValidation?: boolean;
  customFormData?: (files: File[]) => FormData; // New optional custom FormData function
}

interface UsePdfProcessorReturn {
  processFiles: (files: File[]) => Promise<void>;
  isLoading: boolean;
  progress: number;
  error: string | null;
}

export const usePdfProcessor = (options: UsePdfProcessorOptions): UsePdfProcessorReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { apiEndpoint, minFiles = 1, maxFiles, maxFileSize, successMessage = "Files processed successfully!", downloadFileName = "processed", skipFileTypeValidation = false, customFormData } = options;

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
        // Skip PDF validation if skipFileTypeValidation = true
        if (!skipFileTypeValidation && file.type !== "application/pdf") {
          toast.error(`File "${file.name}" is not a valid PDF`);
          return false;
        }

        if (file.size === 0) {
          toast.error(`File "${file.name}" is empty`);
          return false;
        }

        // Check for reasonable file size (e.g., max 50MB per file)
        if (file.size > 50 * 1024 * 1024) {
          toast.error(`File "${file.name}" is too large. Maximum 50MB per file.`);
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

    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, []);

  const processFiles = useCallback(
    async (files: File[]) => {
      if (!validateFiles(files)) return;

      setIsLoading(true);
      setProgress(0);
      setError(null);

      let progressInterval: NodeJS.Timeout | null = null;

      try {
        console.log(
          `Starting ${apiEndpoint} process with files:`,
          files.map((f) => ({ name: f.name, size: f.size, type: f.type }))
        );

        // Start progress simulation
        progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              return 90; // Don't complete until we actually finish
            }
            return prev + Math.random() * 15 + 5; // More realistic progress increments
          });
        }, 300);

        // Create FormData - use custom function if provided, otherwise default
        const formData = customFormData
          ? customFormData(files)
          : (() => {
              const defaultFormData = new FormData();
              files.forEach((file) => {
                defaultFormData.append("files", file);
              });
              return defaultFormData;
            })();

        console.log(`Sending request to ${apiEndpoint}...`);

        // Send request to API
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // Increased to 60s for larger files

        const response = await fetch(apiEndpoint, {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
        setProgress(100);

        console.log("Response status:", response.status);

        if (!response.ok) {
          let errorMessage = "Failed to process files";

          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            const errorText = await response.text();
            if (errorText.includes("<!DOCTYPE")) {
              errorMessage = "Server error occurred. Please check the server logs.";
            } else {
              errorMessage = errorText.substring(0, 100) || errorMessage;
            }
          }

          throw new Error(errorMessage);
        }

        // Check content type and handle accordingly
        const contentType = response.headers.get("content-type");
        const blob = await response.blob();
        console.log("File blob created, size:", blob.size, "type:", contentType);

        if (blob.size === 0) {
          throw new Error("Received empty file");
        }

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, "");

        let filename: string;
        if (contentType?.includes("application/zip")) {
          filename = `${downloadFileName}_${timestamp}.zip`;
        } else if (contentType?.includes("application/pdf")) {
          filename = `${downloadFileName}_${timestamp}.pdf`;
        } else {
          // Fallback based on blob type or default to PDF
          filename = `${downloadFileName}_${timestamp}.${blob.type.includes("zip") ? "zip" : "pdf"}`;
        }

        // Download the file
        downloadFile(blob, filename);

        toast.success(successMessage);
      } catch (error) {
        console.error(`Error processing files:`, error);

        let errorMessage = "Failed to process files";
        if (error instanceof Error) {
          if (error.name === "AbortError") {
            errorMessage = "Request timed out. Please try with smaller files.";
          } else {
            errorMessage = error.message;
          }
        }

        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        if (progressInterval) {
          clearInterval(progressInterval);
        }
        setIsLoading(false);
        // Reset progress after a short delay to show completion
        setTimeout(() => setProgress(0), 2000);
      }
    },
    [apiEndpoint, validateFiles, downloadFile, successMessage, downloadFileName, customFormData]
  );

  return {
    processFiles,
    isLoading,
    progress,
    error,
  };
};
