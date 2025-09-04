import * as React from "react";
import { cn } from "./utils";

/**
 * Text component that safely handles loading states and skeletons
 * Use this instead of <p> tags when you might need to render skeleton components
 */
const Text = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    as?: 'p' | 'span' | 'div';
  }
>(({ className, as = 'div', ...props }, ref) => {
  const Component = as;
  
  return (
    <Component
      ref={ref}
      className={cn("text-sm", className)}
      {...props}
    />
  );
});

Text.displayName = "Text";

export { Text };