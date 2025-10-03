"use client";
import * as React from "react";

type StackProps = React.PropsWithChildren<{
  as?: keyof React.JSX.IntrinsicElements;
  gap?: string;
  className?: string;
}>;

export function Stack({ as = "div", gap = "gap-3", className = "", children }: StackProps) {
  const Comp = as as React.ElementType;
  return <Comp className={`flex flex-col ${gap} ${className}`}>{children}</Comp>;
}


