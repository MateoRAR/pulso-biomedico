/** Saludo según la hora local. */
export function saludoHora(fecha = new Date()): string {
  const h = fecha.getHours()
  if (h < 5) return 'Buenas noches'
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}
