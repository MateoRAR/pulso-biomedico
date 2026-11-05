import { Send } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input, Label, Textarea } from '@/components/ui/field'
import { toast } from '@/components/ui/toast'
import { track } from '@/lib/analytics'

/** Formulario sencillo para cotizar un plan a la medida con el equipo. En este prototipo no se envía a ningún servidor. */
export function ContactoCustom({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [telefono, setTelefono] = useState('')
  const [mensaje, setMensaje] = useState('')

  function enviar(event: React.FormEvent) {
    event.preventDefault()
    if (!nombre.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo.trim())) {
      toast.error('Revisa tus datos', { description: 'Escribe tu nombre y un correo completo para que podamos responderte.' })
      return
    }
    track('contacto_plan_custom', { conTelefono: Boolean(telefono.trim()) })
    toast.success('Recibimos tu mensaje', { description: 'Esto es una demostración: no se envió a ningún correo real.' })
    setNombre('')
    setCorreo('')
    setTelefono('')
    setMensaje('')
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Cotizar un plan a la medida"
      description="Cuéntanos cómo es tu organización y armamos las condiciones contigo."
    >
      <form onSubmit={enviar} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cc-nombre">Tu nombre</Label>
          <Input id="cc-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cc-correo">Correo</Label>
          <Input id="cc-correo" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} autoComplete="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cc-tel">Teléfono (opcional)</Label>
          <Input id="cc-tel" inputMode="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} autoComplete="tel" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cc-msg">¿Qué necesitas? (opcional)</Label>
          <Textarea id="cc-msg" value={mensaje} onChange={(e) => setMensaje(e.target.value)} placeholder="Por ejemplo: cuántas sedes tienen y qué equipos." />
        </div>
        <Button type="submit" size="lg" className="w-full">
          <Send /> Enviar mensaje
        </Button>
      </form>
    </Dialog>
  )
}
