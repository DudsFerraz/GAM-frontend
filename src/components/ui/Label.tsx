import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block text-foreground mb-1"
)

function RequiredIndicator() {
  return <span aria-hidden="true" className="ml-1 text-red-600 dark:text-red-400">*</span>
}

function RequiredDescription({ id }: { id?: string }) {
  return (
    <span className="sr-only" id={id}>
      (obrigatório)
    </span>
  )
}

const Label = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants> & {
      required?: boolean
    }
>(({ children, className, required = false, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      labelVariants(),
      required && "after:ml-1 after:text-red-600 after:content-['*'] dark:after:text-red-400",
      className,
    )}
    data-required={required || undefined}
    {...props}
  >
    {children}
  </LabelPrimitive.Root>
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label, RequiredDescription, RequiredIndicator }
