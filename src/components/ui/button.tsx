import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "animated-btn inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 ease-in-out focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-white",
        destructive: "bg-red-500 text-white",
        outline: "bg-transparent text-primary border border-primary",
        secondary: "bg-gray-200 text-gray-900",
        ghost: "bg-transparent text-primary",
        link: "bg-transparent text-primary underline-offset-4 hover:underline",
        success: "bg-emerald-500 text-white",
      },
      size: {
        default: "h-12 min-w-32 max-w-full px-4 py-2",
        sm: "h-10 min-w-24 max-w-full px-3 text-xs",
        lg: "h-14 min-w-40 max-w-full px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  dataTitle?: string
  dataText?: string
  dataStart?: string
  isActive?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, dataTitle, dataText, dataStart, isActive, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    if (asChild) {
      return (
        <Comp
          className={cn(
            buttonVariants({ variant, size, className }),
            isActive && "animated-btn-active"
          )}
          data-title={dataTitle}
          data-text={dataText}
          data-start={dataStart}
          ref={ref}
          {...props}
        />
      )
    }
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          isActive && "animated-btn-active"
        )}
        data-title={dataTitle}
        data-text={dataText}
        data-start={dataStart}
        ref={ref}
        {...props}
      >
        <span className="absolute inset-0 z-10" />
        <p className="animated-btn-text m-0 p-0 transition-all duration-400 ease-out absolute w-full h-full flex items-center justify-center">
          {props.children}
        </p>
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
