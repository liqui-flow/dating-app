import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-black/12 placeholder:text-black/40 focus-visible:border-[#97011A] focus-visible:ring-[#97011A]/10 aria-invalid:ring-[#97011A]/20 aria-invalid:border-[#97011A] bg-white text-black flex field-sizing-content min-h-24 w-full rounded-lg border-2 px-4 py-3 text-base shadow-sm transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
