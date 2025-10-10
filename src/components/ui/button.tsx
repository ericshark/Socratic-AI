import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group relative inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold tracking-tight transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary via-[hsl(var(--accent))] to-sky-500 bg-[length:200%_200%] text-primary-foreground shadow-glow transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-glow-cyan focus-visible:-translate-y-0.5 active:translate-y-0 animate-gradient",
        secondary:
          "border border-white/10 bg-secondary/70 text-secondary-foreground shadow-inner-glow hover:border-white/20 hover:bg-secondary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-lg shadow-rose-500/30 hover:brightness-110",
        outline:
          "border border-white/15 bg-transparent text-foreground shadow-inner-glow hover:border-white/30 hover:bg-white/5",
        ghost:
          "text-muted-foreground hover:text-foreground hover:bg-white/5",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-9 rounded-lg px-4 text-sm",
        lg: "h-12 rounded-2xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
