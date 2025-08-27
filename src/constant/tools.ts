import { Combine, Split, Scaling, FileText, RotateCcw, Unlock, Droplets, FilePenLine, type LucideIcon, ImageUpscale, FileSpreadsheet, LockKeyhole } from "lucide-react";

export interface PdfTool {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  bgColor: string;
  textColor: string;
  shadowColor: string;
  isComingSoon?: boolean;
}

export const pdfTools: PdfTool[] = [
  {
    href: "/tools/merge",
    title: "Merge PDF",
    description: "Combine multiple PDF into a single document.",
    icon: Combine,
    bgColor: "bg-red-100",
    textColor: "text-red-600",
    shadowColor: "shadow-red-300",
  },
  {
    href: "/tools/split",
    title: "Split PDF",
    description: "Extract pages from a PDF file into separate documents.",
    icon: Split,
    bgColor: "bg-orange-100",
    textColor: "text-orange-600",
    shadowColor: "shadow-orange-300",
    isComingSoon: true,
  },
  {
    href: "/tools/compress",
    title: "Compress PDF",
    description: "Reduce the file size of your PDF while optimizing for quality.",
    icon: Scaling,
    bgColor: "bg-green-100",
    textColor: "text-green-600",
    shadowColor: "shadow-green-300",
  },
  {
    href: "/tools/pdf-to-word",
    title: "PDF to Word",
    description: "Easily convert your PDF files into editable DOCX documents.",
    icon: FileText,
    bgColor: "bg-blue-100",
    textColor: "text-blue-600",
    shadowColor: "shadow-blue-300",
    isComingSoon: true,
  },
  {
    href: "/tools/rotate",
    title: "Rotate PDF",
    description: "Rotate your PDF documents to the desired orientation.",
    icon: RotateCcw,
    bgColor: "bg-pink-100",
    textColor: "text-pink-600",
    shadowColor: "shadow-pink-300",
  },
  {
    href: "/tools/unlock",
    title: "Unlock PDF",
    description: "Unlock PDF files that are password-protected.",
    icon: Unlock,
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-600",
    shadowColor: "shadow-yellow-300",
    isComingSoon: true,
  },
  {
    href: "/tools/watermark",
    title: "Watermark PDF",
    description: "Add a text or image watermark to your PDF documents.",
    icon: Droplets,
    bgColor: "bg-teal-100",
    textColor: "text-teal-600",
    shadowColor: "shadow-teal-300",
    isComingSoon: true,
  },
  {
    href: "/tools/img-to-pdf",
    title: "Image to PDF ",
    description: "Convert your images into a single PDF file.",
    icon: ImageUpscale,
    bgColor: "bg-purple-100",
    textColor: "text-purple-600",
    shadowColor: "shadow-purple-300",
  },
  {
    href: "/tools/pdf-to-excel",
    title: "PDF to Excel",
    description: "Convert your PDF files into Excel spreadsheets.",
    icon: FileSpreadsheet,
    bgColor: "bg-indigo-100",
    textColor: "text-indigo-600",
    shadowColor: "shadow-indigo-300",
    isComingSoon: true,
  },
  {
    href: "/tools/protect",
    title: "Protect PDF",
    description: "Secure your PDF files with password protection.",
    icon: LockKeyhole,
    bgColor: "bg-fuchsia-100",
    textColor: "text-fuchsia-600",
    shadowColor: "shadow-fuchsia-300",
    isComingSoon: true,
  },
  {
    href: "/tools/pdf-to-ppt",
    title: "PDF to PowerPoint",
    description: "Convert your PDF files into PowerPoint presentations.",
    icon: FilePenLine,
    bgColor: "bg-cyan-100",
    textColor: "text-cyan-600",
    shadowColor: "shadow-cyan-300",
    isComingSoon: true,
  },
  {
    href: "/tools/remove",
    title: "Remove Page",
    description: "Remove specific pages from a PDF file.",
    icon: FilePenLine,
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-600",
    shadowColor: "shadow-emerald-300",
  },
];
