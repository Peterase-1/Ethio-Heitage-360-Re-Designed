"use client";

import React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

function AlertDialog(props) {
  return <AlertDialogPrimitive.Root {...props} />;
}

function AlertDialogTrigger(props) {
  return <AlertDialogPrimitive.Trigger {...props} />;
}

function AlertDialogPortal(props) {
  return <AlertDialogPrimitive.Portal {...props} />;
}

function AlertDialogOverlay({ className = "", ...props }) {
  return (
    <AlertDialogPrimitive.Overlay
      className={`fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 ${className}`}
      {...props}
    />
  );
}

function AlertDialogContent({ className = "", ...props }) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        className={`
          fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] sm:max-w-lg 
          translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border border-gray-300 p-6 
          bg-white shadow-lg duration-200 
          data-[state=open]:animate-in data-[state=closed]:animate-out 
          data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 
          data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 
          ${className}
        `}
        {...props}
      />
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({ className = "", ...props }) {
  return (
    <div className={`flex flex-col gap-2 text-center sm:text-left ${className}`} {...props} />
  );
}

function AlertDialogFooter({ className = "", ...props }) {
  return (
    <div className={`flex flex-col-reverse gap-2 sm:flex-row sm:justify-end ${className}`} {...props} />
  );
}

function AlertDialogTitle({ className = "", ...props }) {
  return (
    <AlertDialogPrimitive.Title
      className={`text-lg font-semibold ${className}`}
      {...props}
    />
  );
}

function AlertDialogDescription({ className = "", ...props }) {
  return (
    <AlertDialogPrimitive.Description
      className={`text-sm text-gray-600 ${className}`}
      {...props}
    />
  );
}

function AlertDialogAction({ className = "", ...props }) {
  return (
    <AlertDialogPrimitive.Action
      className={`
        inline-flex items-center justify-center rounded-md bg-blue-600 text-white 
        px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors 
        disabled:opacity-50 disabled:pointer-events-none 
        ${className}
      `}
      {...props}
    />
  );
}

function AlertDialogCancel({ className = "", ...props }) {
  return (
    <AlertDialogPrimitive.Cancel
      className={`
        inline-flex items-center justify-center rounded-md border border-gray-300 
        bg-white text-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-100 
        transition-colors disabled:opacity-50 disabled:pointer-events-none 
        ${className}
      `}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};


