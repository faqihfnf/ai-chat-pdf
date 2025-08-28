import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 cursor-pointer",
        primary: "bg-gradient-to-tr hover:bg-gradient-to-tl from-amber-500 via-orange-500 to-rose-500 shadow-lg hover:shadow-xl text-white font-semibold",
        tertiary: "bg-gradient-to-tr hover:bg-gradient-to-tl from-sky-500 via-cyan-500 to-emerald-500 shadow-lg hover:shadow-xl text-white font-semibold",
        destructive: "bg-destructive text-white shadow-xs hover:bg-red-700 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 cursor-pointer",
        indigo: "bg-indigo-700 text-white shadow-xs hover:bg-indigo-600 focus-visible:ring-indigo-700/20 dark:focus-visible:ring-indigo-700/40 dark:bg-indigo-700/60 cursor-pointer",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:hover:text-black dark:bg-input/30 dark:border-slate-200 dark:hover:bg-slate-100 text-black cursor-pointer",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 cursor-pointer",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 cursor-pointer",
        link: "text-primary underline-offset-4 hover:underline cursor-pointer",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        xl: "h-14 rounded-md px-10 has-[>svg]:px-8",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
