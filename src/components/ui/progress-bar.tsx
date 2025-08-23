// src/components/ui/ProgressBar.tsx
import React from "react";

interface ProgressBarProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
}

export default function ProgressBar({ progress, className = "", showPercentage = true }: ProgressBarProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Processing...</span>
        {showPercentage && <span>{Math.round(progress)}%</span>}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
