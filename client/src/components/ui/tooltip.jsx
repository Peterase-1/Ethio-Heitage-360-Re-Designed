import * as React from "react"
import { cn } from "./utils"

const TooltipProvider = ({ children }) => {
  return <>{children}</>
}

const Tooltip = ({ children }) => {
  const [open, setOpen] = React.useState(false)

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { 'data-state': open ? 'open' : 'closed', open })
        }
        return child
      })}
    </div>
  )
}

const TooltipTrigger = React.forwardRef(({ children, asChild, ...props }, ref) => {
  if (asChild) {
    return React.cloneElement(children, { ref, ...props })
  }
  return <button ref={ref} {...props}>{children}</button>
})
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipContent = React.forwardRef(({ className, sideOffset = 4, open, ...props }, ref) => {
  // We access the 'open' state passed down from Tooltip via cloneElement
  // In a real implementation this would use Context

  if (!props['data-state'] || props['data-state'] === 'closed') return null

  return (
    <div
      ref={ref}
      className={cn(
        "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 absolute left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-nowrap",
        className
      )}
      {...props}
    />
  )
})
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
