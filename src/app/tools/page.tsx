import ToolCard from "@/components/sections/tools/ToolCard";
import ToolHeader from "@/components/sections/tools/ToolHeader";
import { pdfTools } from "@/constant/tools";

export default function ToolsPage() {
  return (
    <div className="mx-auto p-6">
      <ToolHeader title="Every Tool You Need to Work With PDF" description="A collection of tools to help you work with PDF files. All in one place for easy access and integration." />

      {/* Grid of tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {pdfTools.map((tool) => (
          <ToolCard key={tool.title} tool={tool} />
        ))}
      </div>
    </div>
  );
}
