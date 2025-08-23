// src/components/sections/tools/PDFPreviewList.tsx
"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { FileText, X, GripVertical } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Dynamic import untuk react-pdf components
const Document = dynamic(() => import("react-pdf").then((mod) => mod.Document), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
    </div>
  ),
});

const Page = dynamic(() => import("react-pdf").then((mod) => mod.Page), { ssr: false });

// Set up PDF.js worker hanya di client side
if (typeof window !== "undefined") {
  import("react-pdf").then((pdfjs) => {
    pdfjs.pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.pdfjs.version}/pdf.worker.min.js`;
  });
}

interface PDFFile extends File {
  id: string;
  preview?: string;
}

interface PDFPreviewListProps {
  files: PDFFile[];
  onFilesReorder: (files: PDFFile[]) => void;
  onFileRemove: (fileId: string) => void;
}

// Sortable Item Component
function SortableItem({ file, index, onRemove }: { file: PDFFile; index: number; onRemove: (id: string) => void }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: file.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Create object URL for the file
  React.useEffect(() => {
    const url = URL.createObjectURL(file);
    setFileUrl(url);

    // Cleanup function to revoke the URL
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const handleLoadStart = () => setIsLoading(true);
  const handleLoadSuccess = () => {
    setIsLoading(false);
    setHasError(false);
  };
  const handleLoadError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-4 p-4 bg-white rounded-lg border-2 border-gray-200
        transition-all duration-200 hover:border-orange-300 hover:shadow-md
        ${isDragging ? "shadow-lg border-orange-400 opacity-50" : ""}
      `}
    >
      {/* Drag Handle */}
      <div {...attributes} {...listeners} className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing touch-none">
        <GripVertical className="h-5 w-5" />
      </div>

      {/* PDF Preview */}
      <div className="flex-shrink-0 w-16 h-20 bg-gray-100 rounded border overflow-hidden">
        {hasError || !fileUrl ? (
          <div className="w-full h-full flex items-center justify-center bg-red-50">
            <FileText className="h-6 w-6 text-red-400" />
          </div>
        ) : (
          <Document
            file={fileUrl}
            onLoadStart={handleLoadStart}
            onLoadSuccess={handleLoadSuccess}
            onLoadError={handleLoadError}
            loading={
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
              </div>
            }
            error={
              <div className="w-full h-full flex items-center justify-center bg-red-50">
                <FileText className="h-6 w-6 text-red-400" />
              </div>
            }
          >
            <Page pageNumber={1} width={60} renderTextLayer={false} renderAnnotationLayer={false} />
          </Document>
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
      </div>

      {/* Order Number */}
      <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
        <span className="text-sm font-semibold text-orange-600">{index + 1}</span>
      </div>

      {/* Remove Button */}
      <button onClick={() => onRemove(file.id)} className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" type="button">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function PDFPreviewList({ files, onFilesReorder, onFileRemove }: PDFPreviewListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = files.findIndex((file) => file.id === active.id);
      const newIndex = files.findIndex((file) => file.id === over?.id);

      onFilesReorder(arrayMove(files, oldIndex, newIndex));
    }
  }

  if (files.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">PDF Files to Merge ({files.length} files)</h3>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={files.map((file) => file.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {files.map((file, index) => (
              <SortableItem key={file.id} file={file} index={index} onRemove={onFileRemove} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
