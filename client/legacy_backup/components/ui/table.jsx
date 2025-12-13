"use client";

import * as React from "react";

/**
 * A simple utility function for conditionally joining class names.
 * This is included for the component to be self-contained.
 * You may already have a more robust version in your project.
 */
function cn(...args) {
  return args.filter(Boolean).join(" ");
}

/**
 * The root container for the table, including an overflow wrapper.
 * @param {object} props - The component props.
 * @param {string} props.className - Additional class names for styling.
 * @param {object} props.props - All other props passed to the table element.
 */
function Table({ className, ...props }) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

/**
 * The table header component.
 * @param {object} props - The component props.
 * @param {string} props.className - Additional class names for styling.
 * @param {object} props.props - All other props passed to the thead element.
 */
function TableHeader({ className, ...props }) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  );
}

/**
 * The table body component.
 * @param {object} props - The component props.
 * @param {string} props.className - Additional class names for styling.
 * @param {object} props.props - All other props passed to the tbody element.
 */
function TableBody({ className, ...props }) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

/**
 * The table footer component.
 * @param {object} props - The component props.
 * @param {string} props.className - Additional class names for styling.
 * @param {object} props.props - All other props passed to the tfoot element.
 */
function TableFooter({ className, ...props }) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The table row component.
 * @param {object} props - The component props.
 * @param {string} props.className - Additional class names for styling.
 * @param {object} props.props - All other props passed to the tr element.
 */
function TableRow({ className, ...props }) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The table header cell component.
 * @param {object} props - The component props.
 * @param {string} props.className - Additional class names for styling.
 * @param {object} props.props - All other props passed to the th element.
 */
function TableHead({ className, ...props }) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The table data cell component.
 * @param {object} props - The component props.
 * @param {string} props.className - Additional class names for styling.
 * @param {object} props.props - All other props passed to the td element.
 */
function TableCell({ className, ...props }) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The table caption component.
 * @param {object} props - The component props.
 * @param {string} props.className - Additional class names for styling.
 * @param {object} props.props - All other props passed to the caption element.
 */
function TableCaption({ className, ...props }) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};

