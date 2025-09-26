// Button.jsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // Replaced 'emerald' with standard 'green' colors
        default: "bg-green-600 text-white hover:bg-green-700",
        // Replaced custom destructive color with standard red
        destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-200",
        // Replaced custom theme colors with standard gray and white classes
        outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100",
        // Replaced custom secondary color with standard gray
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
        // Replaced custom hover colors with standard gray
        ghost: "hover:bg-gray-100 hover:text-gray-900",
        // Replaced 'emerald' with standard 'green' colors
        link: "text-green-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
