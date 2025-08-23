"use client";

import React from "react";
import { FileText, X, GripVertical } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Interface yang sama dengan yang di page
interface PDFFileData {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  file: File;
}

interface PDFListProps {
  files: PDFFileData[];
  onFilesReorder: (files: PDFFileData[]) => void;
  onFileRemove: (fileId: string) => void;
}

// Sortable Item Component
function SortableItem({ fileData, index, onRemove }: { fileData: PDFFileData; index: number; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: fileData.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Format file size safely
  const formatFileSize = (bytes: number): string => {
    if (!bytes || isNaN(bytes) || bytes === 0) return "0 MB";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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

      {/* PDF Icon */}
      <div className="flex-shrink-0 w-16 h-20 bg-red-50 rounded border flex items-center justify-center">
        <FileText className="h-8 w-8 text-red-500" />
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate" title={fileData.name}>
          {fileData.name}
        </p>
        <p className="text-xs text-gray-500">{formatFileSize(fileData.size)}</p>
        <p className="text-xs text-gray-400">{fileData.type}</p>
      </div>

      {/* Order Number */}
      <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
        <span className="text-sm font-semibold text-orange-600">{index + 1}</span>
      </div>

      {/* Remove Button */}
      <button onClick={() => onRemove(fileData.id)} className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer" type="button">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function PDFList({ files, onFilesReorder, onFileRemove }: PDFListProps) {
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
            {files.map((fileData, index) => (
              <SortableItem key={fileData.id} fileData={fileData} index={index} onRemove={onFileRemove} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
