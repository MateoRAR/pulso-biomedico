import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { fechaCorta } from '@/lib/format'
import type { Criticidad } from '@/lib/mock/data'
import { cn } from '@/lib/utils'

export interface EventoCalendario {
  id: string
  fecha: string
  titulo: string
  subtitulo?: string
  criticidad?: Criticidad
}

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const PUNTO: Record<Criticidad, string> = {
  Crítica: 'bg-alert-foreground',
  Alta: 'bg-warning-foreground',
  Media: 'bg-primary',
  Programada: 'bg-muted-foreground',
}

export function Calendario({ eventos }: { eventos: EventoCalendario[] }) {
  const hoy = new Date()
  const [cursor, setCursor] = useState(() => new Date(hoy.getFullYear(), hoy.getMonth(), 1))
  const [seleccion, setSeleccion] = useState<string | null>(null)

  const porFecha = useMemo(() => {
    const mapa = new Map<string, EventoCalendario[]>()
    eventos.forEach((evento) => {
      mapa.set(evento.fecha, [...(mapa.get(evento.fecha) ?? []), evento])
    })
    return mapa
  }, [eventos])

  const celdas = useMemo(() => {
    const anio = cursor.getFullYear()
    const mes = cursor.getMonth()
    const inicio = (new Date(anio, mes, 1).getDay() + 6) % 7 // lunes = 0
    const diasMes = new Date(anio, mes + 1, 0).getDate()
    const total = Math.ceil((inicio + diasMes) / 7) * 7
    return Array.from({ length: total }, (_, i) => {
      const dia = i - inicio + 1
      if (dia < 1 || dia > diasMes) return null
      const iso = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
      return { dia, iso }
    })
  }, [cursor])

  const hoyIso = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
  const delDia = seleccion ? (porFecha.get(seleccion) ?? []) : []

  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <p className="font-display font-bold">
            {MESES[cursor.getMonth()]} {cursor.getFullYear()}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              aria-label="Mes anterior"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Mes siguiente"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground">
          {DIAS.map((dia) => (
            <div key={dia} className="py-1">
              {dia}
            </div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {celdas.map((celda, indice) =>
            celda === null ? (
              <div key={`v-${indice}`} />
            ) : (
              <button
                key={celda.iso}
                type="button"
                onClick={() => setSeleccion(celda.iso)}
                className={cn(
                  'flex min-h-16 flex-col items-center gap-1 rounded-md border p-1 text-sm transition',
                  celda.iso === hoyIso ? 'border-primary' : 'border-transparent',
                  seleccion === celda.iso ? 'bg-accent' : 'hover:bg-accent/60',
                )}
              >
                <span className={cn('text-xs font-semibold', celda.iso === hoyIso && 'text-primary')}>{celda.dia}</span>
                <span className="flex flex-wrap justify-center gap-0.5">
                  {(porFecha.get(celda.iso) ?? []).slice(0, 4).map((evento) => (
                    <span
                      key={evento.id}
                      className={cn('size-1.5 rounded-full', evento.criticidad ? PUNTO[evento.criticidad] : 'bg-primary')}
                    />
                  ))}
                </span>
              </button>
            ),
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <p className="font-display font-bold">
          {seleccion ? `Servicios del ${fechaCorta(seleccion)}` : 'Selecciona un día'}
        </p>
        {seleccion === null && (
          <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="size-4" /> Toca un día del calendario para ver sus servicios.
          </p>
        )}
        {seleccion !== null && delDia.length === 0 && (
          <p className="mt-3 text-sm text-muted-foreground">Sin servicios programados ese día.</p>
        )}
        <div className="mt-3 space-y-2">
          {delDia.map((evento) => (
            <div key={evento.id} className="rounded-md border border-border bg-background p-3">
              <p className="text-sm font-semibold">{evento.titulo}</p>
              {evento.subtitulo && <p className="text-xs text-muted-foreground">{evento.subtitulo}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
