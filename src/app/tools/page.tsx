import ToolCard from "@/components/sections/tools/ToolCard";
import { pdfTools } from "@/constant/tools";

export default function ToolsPage() {
  return (
    <div className="container mx-auto py-4">
      {/* Header section */}
      <div className="flex flex-col items-center justify-center text-center gap-4 max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Every Tool You Need to Work With PDFs</h1>
        <p className="text-lg text-muted-foreground">Merge, split, compress, convert, rotate, unlock, and watermark PDFs with just a few clicks. All are 100% FREE and easy to use.</p>
      </div>

      {/* Grid of tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        {pdfTools.map((tool) => (
          <ToolCard key={tool.title} tool={tool} />
        ))}
      </div>
    </div>
  );
}
