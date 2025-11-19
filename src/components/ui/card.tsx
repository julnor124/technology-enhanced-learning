"use client";

import * as React from "react";

import { cn } from "@/components/ui/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rounded-2xl border bg-card text-card-foreground", className)} {...props} />
  ),
);
Card.displayName = "Card";

export { Card };

