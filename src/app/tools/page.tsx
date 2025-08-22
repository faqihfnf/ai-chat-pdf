import ToolCard from "@/components/sections/tools/ToolCard";
import ToolHeader from "@/components/sections/tools/ToolHeader";
import { pdfTools } from "@/constant/tools";

export default function ToolsPage() {
  return (
    <div className="container mx-auto py-4">
      <ToolHeader title="Every Tool You Need to Work With PDFs" description="Merge, split, compress, convert, rotate, unlock, and watermark PDFs with just a few clicks. All are 100% FREE and easy to use." />

      {/* Grid of tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        {pdfTools.map((tool) => (
          <ToolCard key={tool.title} tool={tool} />
        ))}
      </div>
    </div>
  );
}
