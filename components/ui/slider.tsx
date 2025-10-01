"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, value, defaultValue, ...props }, ref) => {
  // Determine how many thumbs to render based on controlled or uncontrolled values
  const thumbCount = Array.isArray(value)
    ? value.length
    : Array.isArray(defaultValue)
      ? defaultValue.length
      : 1

  const thumbs = Array.from({ length: Math.max(thumbCount, 1) })

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn("relative flex w-full touch-none select-none items-center cursor-pointer", className)}
      value={value as any}
      defaultValue={defaultValue as any}
      step={1}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        {/* Highlighted selected range */}
        <SliderPrimitive.Range className="absolute h-full bg-primary transition-[left,width] duration-300 ease-out" />
      </SliderPrimitive.Track>
      {thumbs.map((_, idx) => (
        <SliderPrimitive.Thumb
          key={idx}
          className="block h-5 w-5 rounded-full border-2 border-primary bg-background shadow-sm ring-offset-background transition-transform duration-300 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 will-change-transform"
        />
      ))}
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
