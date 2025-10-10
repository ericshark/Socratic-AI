import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        outline: "text-muted-foreground border-border",
        success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
        danger: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
        info: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
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
