# Pulso Biomédico: modelo de ingresos, precios y proyecciones (V5)

*Nov 5, 2026 · @Andres Bueno*

> Pulso cobra una cuota mensual por plan (Esencial $100.000 e Integral $200.000) más 15 % de cada visita técnica; con 10, 16 y 22 clientes nuevos por año, el caso base pierde 28,3 M en el año 1, pierde 8,4 M en el año 2 y gana 9,3 M en el año 3, y necesita unos 30,1 M adicionales a los 12 M de aportes.

## Lo esencial

Con cifras que se pueden rastrear, el negocio gana menos por cliente que en la versión anterior: con la misma adquisición mínima, el resultado del año 3 pasa de +15,0 M a -6,2 M. Lo recupera vender un consultorio por mes (caso base), que es una hipótesis con una sola venta de respaldo.

- **Dos planes.** Esencial ($100.000 al mes, 1 a 6 equipos) e Integral ($200.000 al mes, 7 a 15 equipos y hasta 3 sedes). Inoos (unos 12 equipos y 3 sedes) corresponde al Integral.
- **Equipos aterrizados.** 4 por cliente Esencial y 11 por cliente Integral; con mezcla 20 / 80 el promedio es 9,6 (antes 8 para todos).
- **Visita programada** de $240.000 en promedio (antes $420.000), calculada con un salario verificado, horas y supuestos explícitos.
- **Caso base.** 10, 16 y 22 consultorios nuevos por año; resultado operativo de -28,3 M, -8,4 M y +9,3 M, y 30,1 M de financiación externa además de los 12 M de aportes. La caja toca fondo en el mes 25.
- **Transparencia.** 12 incongruencias corregidas y 8 datos que no existen, declarados en la sección 8.

Las decisiones que se desprenden están en la sección 7. Las más urgentes: definir la fuente de los 30,1 M, conseguir tres cotizaciones de ingenieros en Cali y confirmar con Inoos cuántas horas de gestión gasta hoy.

## Modelo de ingresos

Pulso gana por dos vías: una cuota mensual por consultorio (suscripción) y una comisión de 15 % sobre cada servicio técnico que el consultorio paga al ingeniero a través de la plataforma. En el caso base, la suscripción es el 86 % de los ingresos propios del año 3 ($69,3 M de $80,6 M) y las comisiones el 14 %.

| Fuente | Qué se cobra | Valor en el modelo (año 1) | Estado |
|---|---|---|---|
| Suscripción mensual | Gestión: cronograma, asignación, expediente, semáforo, triage | $100.000 (Esencial) o $200.000 (Integral); promedio $180.000 con mezcla 20 / 80 | Estimación con método; una venta de respaldo |
| Comisión por visita programada | 15 % de una visita de $240.000 | $36.000 por visita; 0,45 visitas al mes por cliente promedio | Supuesto con referencia (rango de marketplaces: 10 a 20 %) |
| Comisión por correctivo | 15 % de un servicio de $300.000, sin repuestos | $45.000 por correctivo; 0,2 correctivos al mes por cliente promedio | Supuesto heredado, sin datos de fallas reales |
| Comisión por diagnóstico exprés | 15 % de $110.000 | $16.500; 2 por cliente nuevo | Supuesto del modelo de negocio |
| Repuestos (opcional, desde el año 3) | 8 % del pedido que canaliza el distribuidor | $28.000 sobre un pedido de $350.000; 40 % de los correctivos | Hipótesis, no está acordada con ningún distribuidor |

El consultorio paga la cuota a Pulso y cada visita aparte, por la plataforma; Pulso retiene el 15 % y gira el resto al ingeniero. Esa es la versión que calcula el modelo financiero, y la que se adoptó porque los documentos del proyecto decían ambas cosas (sección 8, punto 3).

Así se ve un cliente al mes en el año 1, después de costos variables e ICA: el margen es de $160.169 para el cliente promedio, de $181.596 para un cliente Integral y de $74.463 para uno Esencial. Los costos variables son nube, soporte, firma electrónica, garantía del 1 % y comisión de la pasarela de pagos (2,65 % + $700, tarifa publicada de Wompi).

Los gastos fijos del modelo suman $37,4 M, $45,1 M y $54,4 M en los años 1, 2 y 3: apoyo de $600.000 por cada uno de los tres integrantes, captación de clientes e ingenieros y otros gastos de $900.000 al mes. Se cubren con 20, 23 y 26 clientes. El caso base cierra cada año con 10, 22 y 34 clientes, así que el flujo mensual solo se vuelve positivo hacia el mes 25.

## Estrategia de precios y condiciones de compra

El precio se ancla en lo que le cuesta al cliente hacer la gestión sin Pulso, no en la competencia, porque no hay tarifas públicas comparables. La lista queda 4 % por debajo de ese costo para que el cliente ahorre.

| | Esencial | Integral |
|---|---|---|
| Precio de lista (mes, sin IVA) | $100.000 | $200.000 |
| Equipos de referencia | 4 | 11 |
| Precio por equipo y mes | $25.000 | $18.182 |
| Horas de gestión interna que evita (supuesto) | 5 al mes | 10 al mes |
| Valor de esas horas a $20.769 la hora (ancla) | $103.846 | $207.692 |
| Piso por costo de captación (recuperar en 12 meses) | $129.269 | $129.269 |
| Margen mensual de Pulso por cliente (año 1) | $74.463 | $181.596 |
| Meses para recuperar el costo de captación | 15,5 | 6,4 |
| Gasto anual del cliente (cuota + servicios) | $2.040.000 | $4.710.000 |
| Esa cuota como parte del gasto anual | 59 % | 51 % |
| Gasto anual como parte del costo de un ingeniero de planta con cargas | 4,5 % | 10,4 % |

**Integral, $200.000, es el precio con más respaldo.** Equivale a unas 10 horas mensuales de personal del consultorio a $20.769 la hora (salario de un ingeniero en Cali de $2,7 M por 1,40 de cargas entre 182 horas al mes). Inoos aceptó el piloto y pagó $40.000, el 20 % de esa lista. Es una sola compra y las 10 horas son una hipótesis: todavía no validan la lista.

**Esencial, $100.000, es el precio con menos evidencia.** No hay ninguna venta en ese perfil. Con el costo de captación del modelo, recupera la inversión en más de 15 meses y no alcanza el piso de $129.269 que sirve de referencia a 12 meses. Por eso no se prospecta: se acepta por referidos y como puerta de entrada.

**La objeción más probable es la cuota.** Pesa entre la mitad y el 60 % de lo que el cliente gasta al año con Pulso. La respuesta es compararla con lo que cuesta hacer la gestión a mano y con un ingeniero de planta (cerca del 10 % en el Integral), no con el precio de una visita.

### Condiciones de compra (propuesta del equipo)

- **Qué se paga.** Cuota mensual por plan; la visita del ingeniero se paga aparte, a tarifa de la red, por la plataforma, y Pulso retiene el 15 %.
- **Primer pago.** 20 % de la mensualidad, reembolsable y descontado de la primera cuota. Inoos pagó $40.000 sobre un Integral de $200.000.
- **Permanencia.** Sin cláusula con los primeros clientes, para bajar la fricción; el modelo supone cancelación mensual de 3 %, 2,5 % y 2 % en los años 1, 2 y 3. Un plan anual con descuento queda como hipótesis para cuando haya datos de retención; no está en el modelo.
- **Tope.** Esencial hasta 6 equipos; Integral hasta 15 equipos y 3 sedes. El diagnóstico inicial confirma el inventario; si lo supera, el cliente pasa al plan siguiente o se cotiza a la medida.
- **Ajuste.** Anual, 5 % en el modelo (inflación de 2025: 5,10 %, DANE).
- **Garantía.** Reintervención sin costo durante un periodo por definir con los ingenieros; el modelo reserva el 1 % del valor del servicio.
- **Diagnóstico inicial.** Lo asume Pulso (cerca de $340.000 por cliente promedio). Cobrarlo a costo es una palanca por probar, no está en el caso base.

**Ruta de precios.** Año 1: $100.000 y $200.000, sin descuento fundador para no manejar dos precios. Años 2 y 3: +5 % anual. Pendiente: probar $250.000 en el Integral con el segundo o tercer cliente, solo si Inoos confirma unas 12 horas de gestión al mes.

## Alineación entre el cliente y la oferta

El plan Integral es el núcleo del negocio y el que corresponde a Inoos; el Esencial existe para no rechazar al consultorio unipersonal. Los dos se distinguen por rango de equipos y por cuatro beneficios que son propuesta del equipo, no hechos validados.

| | Esencial | Integral |
|---|---|---|
| A quién va dirigido | Consultorio unipersonal o de una sede, con un profesional; 1 a 6 equipos | Prestador pequeño con 1 a 3 sedes y dotación intensiva (odontología, estética, rehabilitación); 7 a 15 equipos |
| Dolor principal | Cumplir el mínimo de habilitación al menor costo, sin dedicar tiempo propio | Cronograma consolidado, documentación auditable y respuesta rápida cuando un equipo falla |
| Cómo lo resuelve hoy | Contacto de confianza por referencia; paga por visita; sin garantía verificable | Referencia personal o una empresa pensada para clientes más grandes que lo trata como cliente marginal |
| Prioridad comercial | Media: llega por referidos; 20 % de los clientes en el modelo | Alta: prospección activa; 80 % de los clientes en el modelo |
| Incluido en ambos | Diagnóstico inicial, cronograma anual con recordatorios, ingeniero verificado por zona, expediente digital, semáforo de habilitación, garantía de reintervención | Lo mismo |
| Solo en el Integral (propuesta) | No | Atención prioritaria de fallas con triage, franjas horarias fijas, capacitación básica en cada visita, hasta 3 sedes bajo un contrato |

Los rangos se ajustaron a lo que el modelo puede atender y justificar. Los documentos hablaban de menos de 5 equipos, de 5 a 10 y de hasta 40, sin precio para lo que pasara de 10. Más de 15 equipos o más de 3 sedes se cotiza a la medida y queda fuera de las proyecciones. No se inventaron tiempos de respuesta ni la duración de la garantía: faltan definirlos con los ingenieros.

### El caso Inoos con las mismas cifras del modelo

| Concepto | Valor |
|---|---|
| Equipos (dato del equipo, por confirmar) | 12 |
| Visitas programadas al año (12 × 2,25 ÷ 4) | 6,75 |
| Valor de esas visitas ($240.000 cada una) | $1.620.000 |
| Correctivos al año (12 × 0,25) y su valor ($300.000 cada uno) | 3 y $900.000 |
| Cuota anual del Integral | $2.400.000 |
| Gasto anual todo incluido | $4.920.000 |
| Como parte del costo de un ingeniero de planta con cargas | 11 % |
| Primer pago realizado el 15 de octubre de 2026 | $40.000 |

Queda por confirmar si el acuerdo con Inoos cubre las tres sedes o solo la de Cali, y cómo se registra el primer pago (anticipo reembolsable o cobro de piloto). Con 12 equipos y 3 sedes, el Integral es el plan que corresponde.

## Respaldo de las cifras

Solo cinco cifras del modelo son datos verificados; el resto son estimaciones con método o supuestos que se prueban en la sensibilidad. No hay datos de mercado sobre tarifas de ingenieros biomédicos independientes en Cali ni sobre la dotación de los consultorios pequeños, así que el valor de una visita y el número de equipos son estimaciones y no precios observados. Cada estado significa: **verificado** (fuente pública consultada el 5 de noviembre de 2026), **del equipo** (lo vivió el equipo), **estimación** (se calcula con datos verificados y supuestos explícitos) o **supuesto** (sin fuente).

| Cifra | Valor | Estado | Respaldo y qué falta |
|---|---|---|---|
| Salario mínimo 2026 | $1.750.905 | Verificado | Decreto 1469 de 2025 |
| Salario de un ingeniero biomédico en Cali | $2,7 M al mes | Verificado (rango de ofertas) | Ofertas de empleo en Cali de $2,5 a $3 M; promedio nacional cerca de $2,3 M. Es salario de oferta, no tarifa de independiente |
| Jornada | 182 horas al mes | Verificado (derivado) | 42 horas semanales desde julio de 2026 (Ley 2101 de 2021) |
| Inflación y ajuste anual de precios | 5,10 % y 5 % | Verificado | DANE, diciembre de 2025 |
| Pasarela de pagos | 2,65 % + $700 | Verificado | Tarifa publicada de Wompi |
| Comisión de la plataforma | 15 % | Supuesto con referencia | Fiverr 20 %, Upwork 0 a 15 %, Freelancer.com 10 %; son plataformas globales y no validan el caso. Falta: entrevistas con ingenieros de Cali |
| Valor de una visita programada | $240.000 | Estimación | Tabla siguiente. Falta: 3 cotizaciones reales |
| Equipos por cliente | 4 (Esencial) y 11 (Integral) | Estimación con un dato | Inoos trabaja con unos 12. No hay censo por prestador en Cali. Falta: inventario de los primeros 5 clientes |
| Intervenciones programadas por equipo | 2,25 al año | Supuesto del equipo | 2 preventivos y calibración en 1 de cada 4 equipos; un compresor odontológico pide mantenimiento cada 4 meses (ficha técnica de Ecuador) |
| Correctivos por equipo | 0,25 al año | Supuesto heredado | Sin datos de fallas reales |
| Horas de gestión interna que evita la cuota | 5 y 10 al mes | Supuesto | Falta: preguntar a Inoos cuántas gasta hoy |
| Consultorios nuevos por año | 10, 16 y 22 | Estimación con un dato | 1 pago entre 13 consultorios contactados (7,7 %). Un cliente por mes exige unas 13 conversaciones al mes |
| Cancelación mensual | 3 %, 2,5 % y 2 % | Supuesto | Sin historial de retención; se prueba a 5 % |
| Equipo fundador | 3 × $600.000 | Del equipo | Es un apoyo, no un salario |

### Cómo se estima el valor de una visita

| Paso | Valor | Estado |
|---|---|---|
| Salario mensual de referencia | $2.700.000 | Verificado |
| × Factor de carga laboral | 1,40 | Supuesto (rango habitual 1,35 a 1,50) |
| ÷ Horas al mes | 182 | Verificado |
| = Costo de una hora cargada | $20.769 | Estimación |
| ÷ Parte de las horas que un independiente logra facturar | 50 % | Supuesto |
| = Tarifa facturable por hora | $41.538 | Estimación |
| Horas de una visita: 4 equipos × 1 hora + 1 hora de desplazamiento y documentación | 5 horas | Supuesto |
| + Insumos y transporte | $30.000 | Supuesto |
| = Costo de una visita | $237.692, redondeado a $240.000 | Estimación |

El Plan Básico de Precisión Ingeniería (10 equipos básicos, $340.000 + IVA) solo sirve como orden de magnitud: su página no dice si es por visita, mes o año, y un resultado de búsqueda mostraba $315.000. Una visita real puede ir de la mitad al doble según los equipos. Con una visita 25 % más barata, la financiación sube solo 1,2 M; con una de $340.000, baja 2,2 M.

## Proyecciones e interpretación financiera

Ningún escenario elimina la necesidad de financiación: el caso base pierde 28,3 M en el año 1, 8,4 M en el año 2 y gana 9,3 M en el año 3, con una caja mínima de -30,1 M en el mes 25. Las proyecciones son a tres años, en millones de COP, sin IVA, con los precios ajustados 5 % cada año.

| Escenario | Clientes nuevos (años 1, 2, 3) | Clientes al cierre del año 3 | Ventas año 3 | Resultado años 1 / 2 / 3 | Clientes de equilibrio (año 3) | Financiación adicional a los aportes |
|---|---|---|---|---|---|---|
| Plantilla original (plan único de $250.000) | 7, 7, 9 | 23 | 73,3 | -26,0 / -6,4 / +15,0 | 15 | 25,8 |
| Dos planes, adquisición mínima | 7, 7, 9 | 23 | 52,5 | -30,2 / -18,5 / -6,2 | 23 | 48,6 |
| **Dos planes, caso base** | **10, 16, 22** | **34** | **80,6** | **-28,3 / -8,4 / +9,3** | **26** | **30,1** |
| Dos planes, adquisición acelerada | 14, 30, 45 | 68 | 147,8 | -26,6 / +2,1 / +50,4 | 32 | 23,3 |

La adquisición base es un cliente por mes desde el mes 3, a partir de una sola conversión observada (1 pago entre 13 contactos). La mínima es 0,6 por mes, el supuesto original. La acelerada (14, 30 y 45 clientes) depende de alianzas con asesores en habilitación y agremiaciones, y no tiene respaldo propio.

### Qué dicen los resultados

- Con la misma adquisición, el negocio gana menos que lo que suponía la plantilla: pasa de +15,0 M a -6,2 M en el año 3. Los precios, equipos y valor de visita realistas bajan el margen por cliente de $236.568 a $160.169 al mes.
- Lo que recupera el resultado es vender más: pasar de 0,6 a 1 cliente por mes suma 15,4 M en el año 3 y baja la financiación de 48,6 M a 30,1 M. Es la hipótesis con menos respaldo del modelo.
- Un cliente cuesta $1.152.800 captarlo en el año 1 (incluye un tercio del tiempo del equipo) y se recupera en 7,2 meses con el margen del cliente promedio. En el Integral son 6,4 meses; en el Esencial, 15,5.
- La ocupación de la red de ingenieros es baja (13 % el año 1 y 35 % el año 3 del caso base): con 3 o 4 ingenieros alcanza la demanda, y vincular 5 a 8 es un objetivo operativo, no un supuesto del modelo.
- En el año 3 los ingresos propios son $80,6 M, mientras que el valor de los servicios técnicos que fluye a los ingenieros es $70,3 M; Pulso se queda con $11,3 M de comisión sobre ese volumen.

### Qué explica el cambio del resultado del año 3

| Paso | Resultado año 3 | Cambio |
|---|---|---|
| Plantilla original | +15,0 | |
| Planes, mezcla y equipos por cliente nuevos | -1,1 | -16,1 |
| Valor de visita, correctivo y exprés estimados | -4,3 | -3,2 |
| Diagnóstico inicial a costo realista | -6,2 | -1,9 |
| Adquisición base: un cliente por mes (caso base) | +9,3 | +15,4 |
| Palancas por validar: diagnóstico cobrado a costo e Integral a $250.000 | +32,4 | +23,2 |

Las palancas del último paso no están en el caso base. Juntas bajarían la financiación de 30,1 M a 17,3 M y los clientes de equilibrio de 26 a 18, pero dependen de que Inoos confirme unas 12 horas de gestión al mes y de que el segundo y tercer cliente acepten pagar el diagnóstico.

**Límite del modelo:** la cancelación y el abandono de ingenieros se redondean a unidades enteras, así que con menos de unos 10 consultorios el efecto de la cancelación se subestima.

## Riesgos y decisiones

El riesgo que más mueve el resultado es el costo del equipo, seguido de la cancelación de clientes y la lentitud de la adquisición. Cada impacto sale de volver a correr el modelo cambiando solo ese supuesto sobre el caso base (resultado del año 3: +9,3 M; financiación adicional: 30,1 M). La probabilidad es una estimación cualitativa del equipo, sin validar.

| Riesgo | Qué se midió | Resultado año 3 (M) | Financiación (M) | Probabilidad | Mitigación y señal temprana |
|---|---|---|---|---|---|
| Costo real del equipo | 3 integrantes a $2.000.000 en lugar de $600.000 | -66,7 | +166,2 | Media | No pasar a dedicación completa sin ingresos que lo cubran. Señal: un integrante pasa a nómina |
| Cancelación alta | 5 % mensual (cerca de la mitad al año) | -21,5 | +23,8 | Media | Vender la obligación permanente (Res. 3100), garantía de reintervención. Señal: cancelación mensual por encima de 3 % |
| Mezcla sesgada al Esencial | 70 % Esencial, 30 % Integral | -18,4 | +21,4 | Media | No prospectar el Esencial. Señal: más del 30 % de clientes en Esencial |
| Adquisición más lenta | 0,6 clientes por mes, supuesto original | -15,4 | +18,5 | Alta | Prospección 1 a 1, alianzas con asesores en habilitación y agremiaciones. Señal: menos de 3 clientes pagando al mes 6 (base: 4) o menos de 8 al mes 12 (base: 10) |
| Precios 20 % menores | Lista de $80.000 y $160.000 | -13,4 | +14,4 | Media | Defender el precio con la gestión que se evita. Señal: un cliente que no acepta $200.000 al terminar el piloto |
| Comisión de 10 % | Ingenieros no aceptan 15 % | -3,5 | +3,0 | Media | Validar con 5 ingenieros de Cali (en curso). Señal: un ingeniero cobra directo al consultorio |
| Captación al doble | $200.000 por consultorio | -1,8 | +2,7 | Media | Referidos y alianzas; cobrar el diagnóstico a costo. Señal: CAC 50 % sobre el modelo |
| Visita 25 % más barata | Tarifa por hora más baja | -1,5 | +1,2 | Media | Tres cotizaciones antes de la próxima junta. Señal: cotizaciones por debajo de $180.000 |
| Poca disponibilidad de ingenieros | 6 órdenes al mes y solo 3 vinculados | -1,1 | -0,1 | Media | Vincular más ingenieros antes de escalar. Señal: demanda atendida bajo 90 % (en este escenario, 69 %) |
| Adverso combinado | Comisión 10 %, precios -20 %, cancelación 5 % y captación al doble | -34,5 | +48,4 | Baja | No escalar: congelar contratación y pauta, revisar precio en el mes 6 |

Tres riesgos no tienen cifra propia. **Precio percibido alto:** la cuota pesa entre la mitad y el 60 % del gasto anual del cliente; se mide con el escenario de precios menores. **Cifras sin validar** (probabilidad alta): el valor de la visita, los equipos por cliente y las horas de gestión son estimaciones; se miden con la visita más barata y se resuelven con cotizaciones e inventarios reales. **Cambio regulatorio:** la Res. 1732 de 2026 se revocó con la Res. 2080 del 8 de septiembre, y la demanda depende de que el mantenimiento siga siendo requisito de habilitación (Res. 3100); no está medido.

### Decisiones que se desprenden

1. **Definir la fuente de los 30,1 M** (capital semilla, premios o aportes) antes de aumentar gastos. Con las cifras actuales el proyecto no se sostiene solo.
2. **Proteger la prospección.** Pasar de 0,6 a 1 cliente por mes mueve el resultado del año 3 de -6,2 M a +9,3 M; pesa más que cualquier ajuste de precio.
3. **No prospectar el Esencial.** Tarda 15,5 meses en recuperar su captación; se recibe por referidos o como puerta de entrada y se prioriza el perfil de 7 a 15 equipos.
4. **Probar dos palancas con los próximos clientes.** Cobrar el diagnóstico inicial a costo suma 8,2 M al resultado del año 3 y baja la financiación 7,9 M; el Integral a $250.000 suma 14,9 M y baja la financiación 7,1 M. Ninguna está en el caso base.
5. **No pasar al equipo a dedicación completa** hasta tener ingresos propios que lo cubran: pagado a $2.000.000 por integrante, el equilibrio sube a 58 clientes.
6. **Puntos de control.** Al mes 6, al menos 3 clientes pagando y 2 ingenieros activos (base: 4 y 2); al mes 12, al menos 8 clientes (base: 10). Si no se cumplen, no ampliar equipo ni pauta y revisar precio y canal.
7. **Antes de la próxima junta:** tres cotizaciones de ingenieros en Cali, las horas de gestión que Inoos gasta hoy, el alcance de su acuerdo y la unidad del precio de Precisión Ingeniería.

## Incongruencias resueltas y datos que no se tienen

La revisión del 5 de noviembre de 2026 encontró 12 cosas que no coincidían entre los documentos del proyecto, la plantilla original y las slides. Las 12 se resolvieron en el modelo; las slides y los documentos siguen mostrándolas hasta que se corrijan.

| # | Qué no coincidía | Cómo se resolvió | Qué sigue sin saberse |
|---|---|---|---|
| 1 | La Res. 1732 de 2026 se citaba como vigente | La Res. 2080 del 8 de septiembre la revocó y nunca tuvo eficacia. Se cita la Res. 3100 de 2019, vigente, y la Res. 2313 de 2026 (amplía plazos) | Si la Res. 2313 cubre Valle del Cauca (no se verificó) |
| 2 | Precio de $250.000 (plantilla), $200.000 (slides) y $40.000 pagados | Una tabla: Esencial $100.000 e Integral $200.000; los $40.000 son el 20 % del Integral. Los $250.000 quedan como palanca | Si Inoos acepta $200.000 como lista; cómo se registra el pago |
| 3 | La cuota "cubre el cronograma completo" o solo la gestión y la visita se paga aparte | Se adopta la segunda, que es la que calcula el modelo | Si los clientes aceptan pagar dos veces |
| 4 | Rango de equipos: menos de 5, de 5 a 10 y hasta 40, sin precio sobre 10 | Dos planes: 1 a 6 y 7 a 15 equipos; lo demás se cotiza | Número real de equipos de los consultorios de Cali |
| 5 | 8 equipos por cliente, 3 por visita y $140.000 por equipo, sin respaldo | 4 y 11 equipos por plan, 4 por visita y una visita de $240.000 estimada con método | Tarifas reales de ingenieros en Cali |
| 6 | Ingenieros: 5 a 8 en los documentos y la slide 17, 3 a 4 en el modelo | El modelo vincula 2 al inicio y 4 al año 3; 5 a 8 queda como objetivo | Disponibilidad real de los ingenieros |
| 7 | SOM de 60 a 150 clientes en el año 1 frente a 10 en el modelo | El SOM se trata como cota superior no validada | Tamaño real del mercado alcanzable |
| 8 | La slide dice "2 convertidos" y hay un solo pago entre 13 contactos | Se usa 1 pago entre 13 contactos (7,7 %) | Cuántos son pagos y cuántos interesados |
| 9 | La slide 14 dice que la solución cuesta "<9 % del costo de planta" | Con cifras vivas es 4,5 % (Esencial) y 10,4 % (Integral); se dice "cerca del 10 %" | Si el comparador correcto es un ingeniero de planta |
| 10 | Diagnóstico inicial de $150.000 y exprés de $120.000, sin respaldo | $340.000 para el cliente promedio y $110.000, calculados con la tarifa por hora | Horas reales de un inventario |
| 11 | Precisión Ingeniería muestra $340.000 + IVA en su página y $315.000 en una búsqueda | Solo orden de magnitud; no se cita como precio de la competencia | Unidad del precio (visita, mes o año) y qué incluye |
| 12 | Inoos: 3 sedes y unos 12 equipos, con el alcance del acuerdo sin escribir | El Integral cubre 7 a 15 equipos y hasta 3 sedes para que Inoos quepa | Si el acuerdo cubre 3 sedes o solo Cali |

### Datos que no se tienen y no se inventaron

- Tarifas de mercado de ingenieros biomédicos independientes en Cali, por visita o por hora.
- Número de equipos por consultorio pequeño en Cali: no hay censo, solo el caso de Inoos.
- Historial de cancelación: todavía no hay clientes recurrentes.
- Porcentaje real de correctivos por equipo y duración de una visita.
- Disposición a pagar del plan Esencial: no hay ventas en ese perfil.
- Tratamiento contable del primer pago de Inoos (anticipo reembolsable o ingreso de piloto) y alcance de su acuerdo.
- Si la Res. 2313 de 2026 incluye a Valle del Cauca.
- Comisión que aceptan los ingenieros de Cali (entrevistas en curso).

## Fuentes

Consultadas el 5 de noviembre de 2026. Las cifras del equipo (Inoos, contactos, campaña) vienen de los documentos del proyecto y de la plantilla financiera V5 (hojas Respaldo de cifras, Sensibilidad, Riesgos e Incongruencias).

- [Salario mínimo 2026, Decreto 1469 de 2025 (ConsultorSalud)](https://consultorsalud.com/aumento-del-salario-minimo-en-colombia-2026/)
- [Resolución 2080 de 2026, que revoca la Res. 1732 (Ministerio de Salud)](https://www.minsalud.gov.co/sites/rid/Lists/BibliotecaDigital/RIDE/DE/DIJ/resolucion-2080-de-2026.pdf)
- [Estándar de dotación, Res. 3100 de 2019 (Secretaría Distrital de Salud de Bogotá, cápsula 12)](https://www.saludcapital.gov.co/DDS/Capsulas/Cart12_Estand_Dotacion_f.pdf)
- [Habilitación de IPS, Res. 2313 de 2026 (ConsultorSalud)](https://consultorsalud.com/habilitacion-de-ips-resolucion-002313-2026/)
- [Revocatoria de la Res. 1732 de 2026 (ConsultorSalud)](https://consultorsalud.com/minsalud-revoca-la-resolucion-1732-de-2026-asi-quedan-las-reglas-de-habilitacion-para-prestadores-de-servicios-de-salud/)
- [Comisiones de marketplaces de servicios en 2026 (jobbers.io)](https://www.jobbers.io/average-platform-fees-across-50-freelance-marketplaces-in-2026/)
- [Plan Básico de mantenimiento (Precisión Ingeniería)](https://precisioningenieria.com/mantenimiento-de-equipos-biom%C3%A9dicos/)
- [Ficha técnica COM-03-R01, compresor odontológico (Ministerio de Salud Pública de Ecuador)](https://www.salud.gob.ec/wp-content/uploads/2018/06/COM-03-R01.pdf)
- [Tarifas de la pasarela de pagos (Wompi)](https://wompi.co/es/co/planes-tarifas/)
- Salarios de ingeniero biomédico: ofertas en elempleo.com (Cali, $2,5 a $3 M) y promedios de Computrabajo y Prosfy (nacional, cerca de $2,3 M). Inflación de 2025 (5,10 %): DANE, reportada por La República el 8 de enero de 2026. Jornada de 42 horas: hacecuentas.com, con base en la Ley 2101 de 2021. En estos tres casos no quedó registrada la dirección exacta de la página.
