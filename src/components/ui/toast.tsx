import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

type Variant = 'success' | 'error' | 'info'
interface ToastItem {
  id: number
  title: string
  description?: string
  variant: Variant
}

let listeners: Array<(item: ToastItem) => void> = []
let counter = 0

function emit(variant: Variant, title: string, description?: string) {
  const item: ToastItem = { id: ++counter, title, description, variant }
  listeners.forEach((listener) => listener(item))
}

export const toast = {
  success: (title: string, options?: { description?: string }) => emit('success', title, options?.description),
  error: (title: string, options?: { description?: string }) => emit('error', title, options?.description),
  info: (title: string, options?: { description?: string }) => emit('info', title, options?.description),
}

const ICONS = { success: CheckCircle2, error: AlertTriangle, info: Info } as const

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    const listener = (item: ToastItem) => {
      setItems((prev) => [...prev, item])
      window.setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== item.id)), 4200)
    }
    listeners.push(listener)
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2">
      {items.map((item) => {
        const Icon = ICONS[item.variant]
        return (
          <div
            key={item.id}
            className={cn(
              'animate-fade-in pointer-events-auto flex items-start gap-3 rounded-lg border bg-card p-4 shadow-lg',
              item.variant === 'success' && 'border-good',
              item.variant === 'error' && 'border-alert',
              item.variant === 'info' && 'border-border',
            )}
          >
            <Icon
              className={cn(
                'mt-0.5 size-5 shrink-0',
                item.variant === 'success' && 'text-good-foreground',
                item.variant === 'error' && 'text-alert-foreground',
                item.variant === 'info' && 'text-primary',
              )}
            />
            <div>
              <p className="text-sm font-semibold">{item.title}</p>
              {item.description && <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
