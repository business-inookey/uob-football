import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function GameCardSkeleton() {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}

export function PlayerCardSkeleton() {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

export function VideoCardSkeleton() {
  return (
    <div className="card p-6 space-y-4">
      <Skeleton className="aspect-video w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}

export function AttendanceGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-8 w-full rounded" />
            <Skeleton className="h-8 w-full rounded" />
            <Skeleton className="h-8 w-full rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    </div>
  );
}
