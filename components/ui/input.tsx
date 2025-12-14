import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-black placeholder:text-black/60 selection:bg-[#97011A] selection:text-white flex h-11 w-full min-w-0 rounded-lg border-2 border-black/25 bg-white px-4 py-2 text-base text-black font-medium transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-[#97011A] focus-visible:ring-[3px] focus-visible:ring-[#97011A]/10',
        'aria-invalid:ring-[#97011A]/20 aria-invalid:border-[#97011A]',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
