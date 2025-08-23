export interface PDFFileData {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  file: File;
}

export interface FileAction {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (files: File[]) => void | Promise<void>;
  variant?: "primary" | "outline" | "secondary";
  disabled?: boolean;
  requiresMinFiles?: number;
}
