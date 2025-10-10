import * as React from "react";

import { cn } from "@/lib/utils";

const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
  <div
    ref={ref}
    role={decorative ? "none" : "separator"}
    aria-orientation={orientation}
    className={cn(
      "shrink-0",
      orientation === "horizontal"
        ? "h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent"
        : "h-full w-px bg-gradient-to-b from-transparent via-white/20 to-transparent",
      className,
    )}
    {...props}
  />
));
Separator.displayName = "Separator";

export { Separator };
