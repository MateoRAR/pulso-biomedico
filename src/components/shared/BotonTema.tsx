import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useTema } from '@/lib/tema'
import { cn } from '@/lib/utils'

export function BotonTema({ className }: { className?: string }) {
  const { tema, alternar } = useTema()
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={tema === 'oscuro' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      onClick={alternar}
      className={cn('relative overflow-hidden', className)}
    >
      <Sun className={cn('absolute transition-all duration-500', tema === 'oscuro' ? 'rotate-0 scale-100' : '-rotate-90 scale-0')} />
      <Moon className={cn('absolute transition-all duration-500', tema === 'oscuro' ? 'rotate-90 scale-0' : 'rotate-0 scale-100')} />
    </Button>
  )
}
