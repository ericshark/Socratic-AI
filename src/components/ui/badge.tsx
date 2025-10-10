import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.32em] shadow-inner-glow backdrop-blur-lg",
  {
    variants: {
      variant: {
        default: "text-primary-foreground",
        outline: "border-white/20 bg-transparent text-muted-foreground",
        success: "border-emerald-400/40 bg-emerald-400/15 text-emerald-200",
        danger: "border-rose-400/40 bg-rose-400/20 text-rose-100",
        info: "border-sky-400/40 bg-sky-400/20 text-sky-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = ({ className, variant, ...props }: BadgeProps) => (
  <div className={cn(badgeVariants({ variant }), className)} {...props} />
);

export { Badge, badgeVariants };
