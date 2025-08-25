"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { FileText, X, GripVertical, AlertCircle, Eraser } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { PDFFileData, FileAction } from "@/types/pdf";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/format-file-size";

const generateFileId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Memoized Sortable Item
const SortableItem = React.memo(({ fileData, index, onRemove, showReorder = true }: { fileData: PDFFileData; index: number; onRemove: (id: string) => void; showReorder?: boolean }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: fileData.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleRemove = useCallback(() => onRemove(fileData.id), [fileData.id, onRemove]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-4 p-4 bg-white rounded-lg border-2 border-slate-200
        transition-all duration-200 hover:border-orange-300 hover:shadow-md
        ${isDragging ? "shadow-lg border-orange-400 opacity-50" : ""}
      `}
    >
      {/* Drag Handle - Only show if reordering is enabled */}
      {showReorder && (
        <div {...attributes} {...listeners} className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing touch-none">
          <GripVertical className="h-5 w-5" />
        </div>
      )}

      {/* File Preview */}
      <div className="flex-shrink-0 w-16 h-20 bg-red-50 rounded border flex items-center justify-center overflow-hidden">
        {fileData.file.type.startsWith("image/") ? (
          <img
            src={URL.createObjectURL(fileData.file)}
            alt={fileData.name}
            className="w-full h-full object-cover"
            onLoad={(e) => {
              // Clean up object URL after image loads
              const target = e.currentTarget;
              if (target && target.src) {
                setTimeout(() => URL.revokeObjectURL(target.src), 100);
              }
            }}
          />
        ) : (
          <FileText className="h-8 w-8 text-orange-500" />
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate" title={fileData.name}>
          {fileData.name}
        </p>
        <p className="text-xs text-slate-500">{formatFileSize(fileData.size)}</p>
        <p className="text-xs text-slate-400">{fileData.type}</p>
      </div>

      {/* Order Number */}
      <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
        <span className="text-sm font-semibold text-orange-600">{index + 1}</span>
      </div>

      {/* Remove Button */}
      <button onClick={handleRemove} className="flex-shrink-0 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer" type="button" aria-label={`Remove ${fileData.name}`}>
        <X className="h-4 w-4" />
      </button>
    </div>
  );
});

SortableItem.displayName = "SortableItem";

// Main PdfFileManager component
interface PdfFileManagerProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  actions: FileAction[];
  title?: string;
  allowReorder?: boolean;
  maxFiles?: number;
  isProcessing?: boolean;
  className?: string;
}

export default function PdfFileManager({ files, onFilesChange, actions, title = "PDF Files", allowReorder = true, maxFiles, isProcessing = false, className = "" }: PdfFileManagerProps) {
  const [fileData, setFileData] = useState<PDFFileData[]>([]);
  const [pendingUpdate, setPendingUpdate] = useState<File[] | null>(null);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Convert files to fileData when files prop changes
  useEffect(() => {
    const newFileData: PDFFileData[] = files.map((file) => ({
      id: generateFileId(),
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      file,
    }));
    setFileData(newFileData);
  }, [files]);

  // Handle pending updates to avoid render conflicts
  useEffect(() => {
    if (pendingUpdate) {
      onFilesChange(pendingUpdate);
      setPendingUpdate(null);
    }
  }, [pendingUpdate, onFilesChange]);

  // Handle drag end with useCallback for performance
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setFileData((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const reorderedItems = arrayMove(items, oldIndex, newIndex);

        // Schedule update to avoid setState during render
        setPendingUpdate(reorderedItems.map((item) => item.file));

        return reorderedItems;
      });
    }
  }, []);

  // Handle file removal with useCallback
  const handleFileRemove = useCallback((fileId: string) => {
    setFileData((prevFiles) => {
      const newFiles = prevFiles.filter((file) => file.id !== fileId);

      // Schedule update to avoid setState during render
      setPendingUpdate(newFiles.map((item) => item.file));

      return newFiles;
    });
    toast.info("File removed");
  }, []);

  // Handle action clicks with useCallback
  const handleActionClick = useCallback(
    (action: FileAction) => {
      if (action.requiresMinFiles && files.length < action.requiresMinFiles) {
        toast.error(`Please add at least ${action.requiresMinFiles} files`);
        return;
      }
      action.onClick(files);
    },
    [files]
  );

  // Handle reset all files
  const handleResetAll = useCallback(() => {
    setFileData([]);
    setPendingUpdate([]);
    toast.info("All files removed");
  }, []);

  // Memoized file validation
  const fileValidation = useMemo(() => {
    const hasFiles = fileData.length > 0;
    const exceedsMax = maxFiles ? fileData.length > maxFiles : false;

    return { hasFiles, exceedsMax };
  }, [fileData.length, maxFiles]);

  if (fileData.length === 0) return null;

  const FileList = () => (
    <div className="space-y-3">
      {fileData.map((file, index) => (
        <SortableItem key={file.id} fileData={file} index={index} onRemove={handleFileRemove} showReorder={allowReorder} />
      ))}
    </div>
  );

  return (
    <div className={`mt-6 ${className}`}>
      {/* Header with file count and validation */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {title} ({fileData.length} {fileData.length === 1 ? "file" : "files"})
        </h3>

        {fileValidation.exceedsMax && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>Maximum {maxFiles} files allowed</span>
          </div>
        )}
      </div>

      {/* File List with conditional drag and drop */}
      {allowReorder ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={fileData.map((file) => file.id)} strategy={verticalListSortingStrategy}>
            <FileList />
          </SortableContext>
        </DndContext>
      ) : (
        <FileList />
      )}

      {/* Action Buttons */}
      {fileData.length > 0 && !isProcessing && (
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          {/* Main Actions */}
          {actions.map((action, index) => (
            <Button key={index} size="xl" variant={action.variant || "primary"} onClick={() => handleActionClick(action)} disabled={action.disabled || isProcessing} className="flex items-center gap-2">
              {action.icon && <action.icon className="h-5 w-5" />}
              {action.label}
            </Button>
          ))}

          {/* Reset Button */}
          <Button size="xl" variant="outline" onClick={handleResetAll} disabled={isProcessing} className="hover:bg-red-500 dark:hover:bg-red-500 hover:text-white">
            <Eraser className="h-5 w-5" /> Reset All
          </Button>
        </div>
      )}
    </div>
  );
}
