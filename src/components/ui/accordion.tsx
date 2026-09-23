import { ChevronDown } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function Accordion({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('divide-y divide-border', className)}>{children}</div>
}

export function AccordionItem({
  value,
  title,
  children,
}: {
  value: string
  title: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <div data-value={value}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left font-semibold hover:text-primary"
        aria-expanded={open}
      >
        {title}
        <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="pb-5 text-sm leading-7 text-muted-foreground">{children}</div>}
    </div>
  )
}
