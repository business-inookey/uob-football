"use client";
import * as React from "react";

type GridProps = React.PropsWithChildren<{
  as?: keyof React.JSX.IntrinsicElements;
  cols?: string;
  gap?: string;
  className?: string;
}>;

export function Grid({ as = "div", cols = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4", gap = "gap-3", className = "", children }: GridProps) {
  const Comp = as as React.ElementType;
  return <Comp className={`grid ${cols} ${gap} ${className}`}>{children}</Comp>;
}


