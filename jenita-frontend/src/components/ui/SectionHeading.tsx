import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({ title, align = "left", className }: SectionHeadingProps) {
  return (
    <h2
      className={cn(
        "font-display text-display-lg font-bold text-ink",
        align === "center" && "text-center",
        className
      )}
    >
      {title}
    </h2>
  );
}
