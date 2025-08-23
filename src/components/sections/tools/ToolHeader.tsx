import React from "react";

interface ToolHeaderProps {
  title: string;
  description: string;
}

export default function ToolHeader({ title, description }: ToolHeaderProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-2 max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
      <p className="text-md text-muted-foreground">{description}</p>
    </div>
  );
}
