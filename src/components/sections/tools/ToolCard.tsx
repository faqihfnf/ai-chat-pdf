import React from "react";
import Link from "next/link";
import { PdfTool } from "@/constant/tools";

export default function ToolCard({ tool }: { tool: PdfTool }) {
  const Icon = tool.icon;

  const href = tool.isComingSoon ? "/coming-soon" : tool.href;

  return (
    <Link href={href} className="group">
      <div className={`relative flex h-full flex-col justify-between p-6 bg-white border rounded-lg shadow-sm ${tool.shadowColor} transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
        <div>
          {/* Badge "Coming Soon" */}
          {tool.isComingSoon && (
            <div className="absolute top-3 right-3">
              <span className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-semibold ${tool.bgColor} ${tool.textColor} shadow-md`}>Coming Soon</span>
            </div>
          )}
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
