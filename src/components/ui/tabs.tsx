import { useState, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

export interface TabItem {
  id: string
  label: string
  content: ReactNode
}

export function Tabs({ items, className }: { items: TabItem[]; className?: string }) {
  const [active, setActive] = useState(items[0]?.id)
  const current = items.find((item) => item.id === active) ?? items[0]
  return (
    <div className={className}>
      <div role="tablist" className="flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
        {items.map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={item.id === current?.id}
            onClick={() => setActive(item.id)}
            className={cn(
              'rounded-md px-3.5 py-2 text-sm font-semibold transition-colors',
              item.id === current?.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-5">{current?.content}</div>
    </div>
  )
}
