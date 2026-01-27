import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full rounded-md border-2 border-border bg-input px-3 py-2 text-base font-medium shadow-brutal transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:shadow-brutal-md focus:translate-x-[-2px] focus:translate-y-[-2px] disabled:cursor-not-allowed disabled:opacity-50 resize-y",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
