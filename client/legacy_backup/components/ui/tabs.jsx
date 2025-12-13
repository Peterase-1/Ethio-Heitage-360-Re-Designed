"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

/**
 * A simple utility function for conditionally joining class names.
 * This is included for the component to be self-contained.
 * You may already have a more robust version in your project.
 */
function cn(...args) {
  return args.filter(Boolean).join(" ");
}

/**
 * The root component for the tabs. It provides context for the tabs.
 * @param {object} props - The component props.
 * @param {string} props.className - Additional class names for styling.
 * @param {object} props.props - All other props passed to the Radix Tabs.
 */
function Tabs({ className, ...props }) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

/**
 * The container for the list of tabs triggers.
 * @param {object} props - The component props.
 * @param {string} props.className - Additional class names for styling.
 * @param {object} props.props - All other props passed to the Radix TabsList.
 */
function TabsList({ className, ...props }) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-xl p-[3px] flex",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The individual tab trigger button.
 * @param {object} props - The component props.
 * @param {string} props.className - Additional class names for styling.
 * @param {object} props.props - All other props passed to the Radix TabsTrigger.
 */
function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-card dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The content area for a specific tab.
 * @param {object} props - The component props.
 * @param {string} props.className - Additional class names for styling.
 * @param {object} props.props - All other props passed to the Radix TabsContent.
 */
function TabsContent({ className, ...props }) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
