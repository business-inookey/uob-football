import { cn } from "@/lib/utils";
import { CustomLoaderCSS } from "./CustomLoader";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  useCustom?: boolean;
}

export function LoadingSpinner({ size = "md", className, useCustom = true }: LoadingSpinnerProps) {
  if (useCustom) {
    return <CustomLoaderCSS size={size} className={className} />;
  }

  // Fallback to original spinner
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-muted border-t-primary",
        sizeClasses[size],
        className
      )}
    />
  );
}

export function LoadingButton({ 
  children, 
  loading, 
  className,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
}) {
  return (
    <button
      className={cn(
        "btn btn-primary relative",
        loading && "opacity-70 cursor-not-allowed",
        className
      )}
      disabled={loading}
      {...props}
    >
      {loading && (
        <LoadingSpinner size="sm" useCustom={true} className="mr-2" />
      )}
      {children}
    </button>
  );
}

export function LoadingCard({ children, loading }: { 
  children: React.ReactNode; 
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-3">
            <LoadingSpinner size="md" useCustom={true} />
            <span className="text-muted-foreground">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function PageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" useCustom={true} className="mx-auto" />
        <p className="text-muted-foreground">Loading page...</p>
      </div>
    </div>
  );
}

export function SectionLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center space-x-3">
        <LoadingSpinner size="md" useCustom={true} />
        <span className="text-muted-foreground">{message}</span>
      </div>
    </div>
  );
}
