import React from "react";
import Link from "next/link";
import { PdfTool } from "@/constant/tools";

export default function ToolCard({ tool }: { tool: PdfTool }) {
  const Icon = tool.icon;

  return (
    <Link href={tool.href} className="group">
      <div className="flex h-full flex-col justify-between p-6 bg-white border rounded-lg shadow-sm shadow-orange-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${tool.bgColor}`}>
            <div className={`${tool.textColor}`}>
              {/* Render komponen ikon menggunakan variabel tersebut */}
              <Icon strokeWidth={2} className="w-6 h-6" />
            </div>
          </div>
          <h2 className="text-lg font-semibold mt-4">{tool.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
        </div>
      </div>
    </Link>
  );
}
