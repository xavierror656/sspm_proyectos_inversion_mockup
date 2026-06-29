# Investment Portfolio SSPM

Mock/demo en **SvelteKit** del Submódulo de Cartera y Seguimiento de Proyectos de Inversión de la SSPM.

## Objetivo

Permitir que stakeholders prueben primero la lógica funcional antes de implementar backend, base de datos, autenticación o integración real.

## Características

- Datos mock locales, sin backend real.
- Sin base de datos real.
- Sin autenticación real.
- 8 proyectos mock con folios `CART-0001-2026` a `CART-0008-2026`.
- Dashboard ejecutivo.
- Cartera filtrable.
- Detalle de proyecto.
- Análisis financiero y semáforo.
- Movimientos simulados.
- Compromisos de compras simulados.
- Redistribuciones con validación de remanente.
- Alertas con atención mock.
- Reportes Excel/PDF/print mock.
- Auditoría y timeline simulados.

## Lógica implementada

```js
currentAmount = initialAuthorizedAmount + sum(movements)
committedAmount = sum(formalized commitments)
remainingBalance = currentAmount - committedAmount
executionPercentage = committedAmount / currentAmount * 100
closureCandidate = committedAmount > 0 && remainingBalance < currentAmount * 0.20
pendingBalance = remainingBalance > currentAmount * 0.20
exceedsAvailableAmount = committedAmount > currentAmount
```

## Reglas de negocio mock

- No editar `currentAmount` directamente.
- Redistribución no puede exceder `remainingBalance`.
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

## Estructura principal

```text
src/lib/data/mockProjects.js   Datos mock locales
src/lib/finance.js             Cálculos financieros y semáforo
src/lib/projectStore.js        Store Svelte con acciones simuladas
src/routes/+page.svelte        Dashboard
src/routes/projects            Cartera y detalle
src/routes/analysis            Análisis financiero
src/routes/movements           Movimientos
src/routes/commitments         Compromisos de compras
src/routes/redistributions     Redistribuciones
src/routes/alerts              Alertas
src/routes/reports             Reportes mock
src/routes/audit               Auditoría / Timeline
```

## Base local front-only

La demo ahora usa una base local en el navegador con `localStorage`.

- Llave: `sspm-investment-portfolio:v1`
- Persistencia: los cambios sobreviven al refresh del navegador.
- Alcance: cada navegador/equipo tiene sus propios datos.
- No hay backend, API, PostgreSQL ni autenticación real.

### Formularios disponibles

- `/forms`: alta de proyectos, documentos, alertas y eventos de timeline.
- `/movements`: alta de movimientos financieros.
- `/commitments`: alta y formalización de compromisos de compras.
- `/redistributions`: redistribución validada contra remanente disponible.

### Recomendación técnica

Para este mock se recomienda `localStorage` por simplicidad y velocidad de validación. Si más adelante la demo requiere miles de registros, adjuntos offline o consultas más complejas, conviene migrar a IndexedDB usando Dexie.js antes de pasar al backend real.

### Administración de la base local

En `/forms` también se puede:

- Editar datos generales de un proyecto existente.
- Eliminar un proyecto completo de la base local.
- Eliminar elementos hijos del proyecto seleccionado:
  - movimientos,
  - compromisos,
  - documentos,
  - alertas,
  - eventos de timeline.
- Exportar toda la base local a JSON.
- Importar un archivo JSON exportado previamente.
- Pegar JSON manualmente y reemplazar la base local.
- Restablecer la semilla original o vaciar la base local.

Nota: editar/eliminar funciona solo en el navegador actual porque la demo sigue siendo front-only. La regla de negocio se mantiene: `currentAmount` no se edita directamente; se deriva de `initialAuthorizedAmount + movements`.

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

No se agregó Tailwind real al mock para mantenerlo liviano; los estilos se emulan desde `src/app.css`.
