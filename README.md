# Investment Portfolio SSPM

Mock/demo en **SvelteKit** del Submódulo de Cartera y Seguimiento de Proyectos de Inversión de la SSPM.

## Objetivo

Permitir que stakeholders prueben la experiencia funcional antes de implementar backend, base de datos, autenticación o integración real con Compras/Adquisiciones.

El demo ahora prioriza que el usuario vea **solo la acción que necesita** mediante tarjetas y modales, en lugar de formularios largos incrustados.

## Flujo funcional validado

### Regla principal

En **Cartera de proyectos** no se cargan documentos.

Los documentos se cargan en el flujo de **Proyecto adquisitivo**. La cartera solo consulta documentos vinculados desde ese flujo.

### Estados entre Cartera y Proyecto adquisitivo

1. El usuario crea un proyecto de inversión en cartera.
2. El usuario puede crear proyectos:
   - manualmente, o
   - por carga masiva con plantilla Excel/CSV.
3. En Proyecto adquisitivo se captura el ID del proyecto de inversión, por ejemplo `CART-0001-2026`.
4. Al capturar ese ID en Proyecto adquisitivo, el proyecto en cartera queda como **ID vinculado / comprometido**.
5. Al formalizar la adquisición en Proyecto adquisitivo, el proyecto en cartera pasa a **Formalizado**.
6. Solo los compromisos/adquisiciones formalizados afectan `committedAmount`.

```text
Cartera de proyectos
  ├─ Alta manual
  ├─ Carga masiva Excel/CSV
  └─ Consulta de estado y documentos vinculados

Proyecto adquisitivo
  ├─ Captura ID del proyecto de inversión
  ├─ Carga documentos
  ├─ Registra requisición / contrato / pedido
  └─ Formaliza adquisición

Resultado en cartera
  ├─ ID capturado en adquisiciones => ID vinculado / comprometido
  └─ Adquisición formalizada => Formalizado + impacta committedAmount
```

## Características

- Datos mock locales, sin backend real.
- Sin base de datos real.
- Sin autenticación real.
- Persistencia front-only con `localStorage`.
- 8 proyectos mock con folios `CART-0001-2026` a `CART-0008-2026`.
- Dashboard ejecutivo.
- Cartera filtrable.
- Detalle de proyecto.
- Análisis financiero y semáforo.
- Movimientos simulados.
- Proyecto adquisitivo simulado.
- Vinculación por ID de proyecto de inversión.
- Carga documental solo en Proyecto adquisitivo.
- Carga masiva de proyectos por plantilla Excel/CSV.
- Redistribuciones con validación de remanente.
- Alertas con atención mock.
- Reportes Excel/PDF/print mock.
- Auditoría y timeline simulados.
- Capturas principales en modales para mejorar UX.

## Lógica financiera implementada

```js
currentAmount = initialAuthorizedAmount + sum(movements)
committedAmount = sum(formalized commitments)
remainingBalance = currentAmount - committedAmount
executionPercentage = committedAmount / currentAmount * 100
closureCandidate = committedAmount > 0 && remainingBalance < currentAmount * 0.20
pendingBalance = remainingBalance > currentAmount * 0.20
exceedsAvailableAmount = committedAmount > currentAmount
```

## Estados funcionales

| Estado | Uso en demo |
|---|---|
| `fiscal_year_authorized` | Proyecto autorizado para ejercicio fiscal en cartera, sin ID vinculado en adquisiciones. |
| `committed` | ID del proyecto de inversión capturado en Proyecto adquisitivo. Todavía puede no impactar `committedAmount`. |
| `formalized` | Proyecto adquisitivo formalizado. Impacta `committedAmount`. |
| `redistributing` | Proyecto con movimiento de redistribución/remanente. |
| `closed` | Proyecto cerrado, consulta histórica. |
| `cancelled` | Proyecto cancelado, consulta histórica. |

## Reglas de negocio mock

- No editar `currentAmount` directamente.
- `currentAmount` se deriva de `initialAuthorizedAmount + movements`.
- Redistribución no puede exceder `remainingBalance`.
- En cartera no se suben documentos.
- Los documentos se suben en Proyecto adquisitivo.
- Cartera puede consultar documentos vinculados desde Proyecto adquisitivo.
- Carga masiva de proyectos se realiza por plantilla Excel/CSV.
- Capturar el ID del proyecto de inversión en Proyecto adquisitivo cambia cartera a **ID vinculado / comprometido**.
- Formalizar en Proyecto adquisitivo cambia cartera a **Formalizado**.
- Solo compromisos formalizados afectan `committedAmount`.
- Cierre requiere definir destino del remanente.
- Cada acción simulada genera evento de timeline y auditoría mock.

## Instalar y correr

```bash
npm install
npm run dev
```

Luego abrir la URL que indique Vite, normalmente:

```text
http://localhost:5173
```

Para validar producción estática:

```bash
npm run build
```

## Estructura principal

```text
src/lib/data/mockProjects.js       Datos mock locales
src/lib/finance.js                 Cálculos financieros, estados y semáforo
src/lib/projectStore.js            Store Svelte con acciones simuladas
src/lib/components/Modal.svelte    Modal reusable para capturas UX
src/routes/+page.svelte            Dashboard
src/routes/projects                Cartera y detalle
src/routes/forms                   Captura local por tarjetas + modales
src/routes/analysis                Análisis financiero
src/routes/movements               Movimientos
src/routes/commitments             Proyecto adquisitivo / formalización
src/routes/redistributions         Redistribuciones
src/routes/alerts                  Alertas
src/routes/reports                 Reportes mock
src/routes/audit                   Auditoría / Timeline
```

## Pantallas y responsabilidades

### `/projects` — Cartera de proyectos

- Consulta de proyectos de inversión.
- Filtros por búsqueda, estado, semáforo y área.
- Muestra vigente, comprometido, remanente y avance.
- Muestra referencias adquisitivas vinculadas y formalizadas.
- No permite carga documental.
- Da acceso a alta manual, carga masiva y Proyecto adquisitivo.

### `/forms` — Captura local de cartera

- Pantalla limpia con tarjetas de acción.
- Cada acción abre un modal.
- Permite:
  - crear proyecto individual,
  - cargar proyectos por plantilla Excel/CSV,
  - editar/eliminar proyecto,
  - registrar alertas,
  - agregar eventos de timeline,
  - administrar base local JSON.
- No contiene formulario de documentos.

### `/commitments` — Proyecto adquisitivo

- Simula el flujo que en producción viviría en Compras/Adquisiciones.
- Permite:
  - capturar ID del proyecto de inversión,
  - crear requisición/contrato/pedido,
  - subir documentos del Proyecto adquisitivo,
  - formalizar adquisición,
  - consultar impacto en cartera.
- Al vincular ID, cartera queda comprometida.
- Al formalizar, cartera queda formalizada.

## Base local front-only

La demo usa una base local en el navegador con `localStorage`.

- Llave: `sspm-investment-portfolio:v1`
- Persistencia: los cambios sobreviven al refresh del navegador.
- Alcance: cada navegador/equipo tiene sus propios datos.
- No hay backend, API, PostgreSQL ni autenticación real.

### Administración de base local

En `/forms`, desde el modal **Base local**, se puede:

- Exportar toda la base local a JSON.
- Importar un archivo JSON exportado previamente.
- Pegar JSON manualmente y reemplazar la base local.
- Restablecer la semilla original o vaciar la base local.
- Eliminar elementos hijos del proyecto seleccionado:
  - movimientos,
  - compromisos/adquisiciones,
  - documentos vinculados desde Proyecto adquisitivo,
  - alertas,
  - eventos de timeline.

Nota: editar/eliminar funciona solo en el navegador actual porque la demo sigue siendo front-only.

## Alineación visual con panel principal

El mock fue ajustado para aproximarse al panel principal descrito:

- Apariencia tipo Filament/Tailwind.
- Color primario basado en Tailwind `teal`.
- Navegación agrupada en:
  - Operación,
  - Reportes,
  - Configuración.
- Iconografía estilo Heroicons mediante SVG inline local (`src/lib/components/HeroIcon.svelte`).
- Tokens semánticos de estado similares a los `--bx-*` usados en el tema principal.
- Acciones de captura en modales para evitar pantallas saturadas.

No se agregó Tailwind real al mock para mantenerlo liviano; los estilos se emulan desde `src/app.css`.
