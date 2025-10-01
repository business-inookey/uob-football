import { cn } from "@/lib/utils";

interface InlineLoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function InlineLoadingSpinner({ size = "md", className }: InlineLoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <span 
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-current border-t-transparent",
        sizeClasses[size],
        className
      )}
      aria-hidden="true"
    />
  );
}
