import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-[#97011A]/30",
  {
    variants: {
      variant: {
        default:
          'bg-[#97011A] text-white border-2 border-[#97011A] hover:bg-[#7A0115] hover:border-[#7A0115] shadow-[0_2px_8px_rgba(151,1,26,0.2)] hover:shadow-[0_4px_12px_rgba(151,1,26,0.3)] active:shadow-[0_1px_4px_rgba(151,1,26,0.2)]',
        destructive:
          'bg-[#97011A] text-white border-2 border-[#97011A] hover:bg-[#7A0115] shadow-[0_2px_8px_rgba(151,1,26,0.2)] hover:shadow-[0_4px_12px_rgba(151,1,26,0.3)]',
        outline:
          'border-2 border-black bg-white text-black hover:bg-black/5 shadow-sm hover:border-[#97011A] hover:text-[#97011A]',
        secondary:
          'bg-white text-black border-2 border-black hover:bg-black/5 shadow-sm',
        ghost:
          'text-black hover:bg-black/5',
        link: 'text-[#97011A] underline-offset-4 hover:underline hover:text-[#7A0115] font-semibold',
      },
      size: {
        default: 'h-11 px-5 sm:px-6 py-2 has-[>svg]:px-4 sm:has-[>svg]:px-5',
        sm: 'h-9 rounded-md gap-1 sm:gap-1.5 px-3 sm:px-4 has-[>svg]:px-2 sm:has-[>svg]:px-3',
        lg: 'h-12 rounded-lg px-6 sm:px-8 text-base has-[>svg]:px-5 sm:has-[>svg]:px-7',
        icon: 'size-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
