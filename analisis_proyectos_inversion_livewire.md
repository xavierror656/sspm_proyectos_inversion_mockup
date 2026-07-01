# Análisis de Proyectos de Inversión SSPM

**Documento:** Addendum funcional y técnico actualizado  
**Módulo:** Submódulo de Cartera y Seguimiento de Proyectos de Inversión SSPM  
**Clave:** MOD-Presupuesto-Cartera-Inversión  
**Arquitectura UI/UX objetivo:** Laravel Blade + Livewire sobre la arquitectura existente SSPM  
**Mock actual:** SvelteKit front-only con `localStorage`  
**Base de datos objetivo:** PostgreSQL, usando nombres de tablas y campos en inglés  
**Última actualización funcional:** separación entre Cartera de Proyectos y Proyecto Adquisitivo

---

## 1. Propósito

El análisis de proyectos permite convertir la cartera de inversión en información accionable para Presupuesto, Dirección Administrativa, Compras/Adquisiciones, Auditoría y Dashboard Ejecutivo.

No reemplaza el registro operativo de Compras ni el expediente documental. La cartera administra proyectos de inversión, montos, remanentes, avance y estado financiero; el flujo de **Proyecto Adquisitivo** administra la carga documental y la formalización de requisiciones, contratos o pedidos.

El análisis responde preguntas como:

- ¿Qué proyectos tienen recurso autorizado pero todavía no tienen ID vinculado en adquisiciones?
- ¿Qué proyectos ya tienen su ID capturado en Proyecto Adquisitivo?
- ¿Qué proyectos ya fueron formalizados en el flujo adquisitivo?
- ¿Cuánto recurso está comprometido formalmente y cuánto queda como remanente?
- ¿Qué proyectos son candidatos a cierre?
- ¿Qué proyectos requieren redistribución, reducción o cancelación de remanente?
- ¿Qué proyectos representan riesgo administrativo o de auditoría?
- ¿Qué documentos existen para el proyecto y desde qué Proyecto Adquisitivo se cargaron?

---

## 2. Principio funcional validado

### Regla principal

En **Cartera de Proyectos no se suben documentos**.

La carga documental pertenece al flujo de **Proyecto Adquisitivo**. Cartera solo puede consultar los documentos vinculados.

### Regla de estado

| Evento | Resultado en cartera |
|---|---|
| Proyecto creado en cartera | `fiscal_year_authorized` / Autorizado ejercicio |
| ID del proyecto de inversión capturado en Proyecto Adquisitivo | `committed` / ID vinculado o comprometido |
| Proyecto Adquisitivo formalizado | `formalized` / Formalizado |
| Compromiso formalizado | Afecta `committed_amount` |
| Documento cargado | Se guarda en Proyecto Adquisitivo y se consulta desde cartera |

### Flujo resumido

```text
1. Cartera crea proyecto de inversión.
2. Cartera puede crear proyectos manualmente o por plantilla Excel/CSV.
3. Proyecto Adquisitivo captura el ID de inversión, por ejemplo CART-0001-2026.
4. Al capturar el ID, cartera marca el proyecto como comprometido / ID vinculado.
5. Proyecto Adquisitivo carga documentos.
6. Proyecto Adquisitivo formaliza requisición, contrato o pedido.
7. Al formalizar, cartera marca el proyecto como Formalizado y actualiza committed_amount.
```

---

## 3. Alcance del análisis

El análisis se construye sobre información ya registrada. No debe permitir editar montos ni reemplazar movimientos formales. Su función es consultar, calcular, clasificar, alertar y facilitar toma de decisiones.

### Incluye

| Elemento | Descripción |
|---|---|
| Análisis financiero | Vigente, comprometido formalizado, remanente, porcentaje comprometido y porcentaje pendiente. |
| Análisis de estado | Clasificación por ciclo de vida: autorizado, ID vinculado, formalizado, redistribución, concluido, cancelado. |
| Análisis de cierre | Identificación de proyectos candidatos a cierre o bloqueados por remanente. |
| Análisis de alertas | Semáforos por remanente alto, falta de ID adquisitivo, falta de formalización, plurianualidad y múltiples movimientos. |
| Análisis de integración con Proyecto Adquisitivo | Revisión de requisiciones, contratos, pedidos, documentos y formalización. |
| Análisis de auditoría | Revisión de trazabilidad, movimientos, timeline y bitácora. |
| Carga masiva | Creación de proyectos por plantilla Excel/CSV desde cartera. |
| Experiencia UX | Capturas en modales para no saturar pantallas con formularios incrustados. |

### No incluye

| Exclusión | Motivo |
|---|---|
| Carga de documentos desde cartera | La evidencia documental se carga en Proyecto Adquisitivo. |
| Devengo y pago | El módulo solo controla compromiso, no pagos efectivos. |
| Cierre contable | Corresponde a procesos financieros posteriores. |
| Integración automática con SAF | Fuera del alcance documentado. |
| Edición directa de monto vigente | El monto vigente solo cambia mediante movimientos. |
| Liberación automática de remanente | El remanente requiere movimiento formal. |
| Sustitución del módulo de Compras | Cartera solo consume/vincula información adquisitiva. |

---

## 4. Dimensiones de análisis

| Dimensión | Campos fuente | Resultado esperado |
|---|---|---|
| Identificación | internal_folio, municipal_folio, name, fiscal_year | Ubicar proyecto y ejercicio fiscal. |
| Financiera | initial_authorized_amount, movements, committed_amount, remaining_balance | Conocer salud financiera del proyecto. |
| Proyecto Adquisitivo | financial_commitments, reference_type, folio, status | Saber si el ID de inversión ya está vinculado a Compras. |
| Documental | procurement_documents | Consultar documentos cargados desde Proyecto Adquisitivo. |
| Estado | status | Interpretar etapa actual del ciclo de vida. |
| Remanente | remaining_balance, current_amount | Detectar saldos pendientes de definición. |
| Cierre | closed_at, status, remaining_balance | Identificar si puede cerrarse o si requiere acción previa. |
| Riesgo | alerts, multiple commitments, due dates | Priorizar atención operativa. |
| Auditoría | project_timeline_events, external_audit_log | Revisar trazabilidad y evidencia. |

---

## 5. Fórmulas de análisis

| Indicador | Fórmula | Interpretación |
|---|---|---|
| Monto vigente | initial_authorized_amount + suma de movimientos financieros | Recurso real disponible después de ampliaciones/reducciones. |
| Monto comprometido | suma de financial_commitments formalizados | Recurso ya asociado a adquisición formalizada. |
| Remanente | current_amount - committed_amount | Saldo pendiente de definir. |
| Porcentaje comprometido | committed_amount / current_amount * 100 | Nivel de avance financiero formalizado. |
| Porcentaje remanente | remaining_balance / current_amount * 100 | Recurso pendiente. |
| Variación sobre inicial | current_amount - initial_authorized_amount | Crecimiento o reducción del proyecto. |
| Número de movimientos | count(project_movements) | Nivel de modificación administrativa/financiera. |
| Número de referencias adquisitivas | count(financial_commitments) | Cantidad de adquisiciones vinculadas por ID. |
| Número de documentos | count(procurement_documents) | Evidencia cargada en Proyecto Adquisitivo. |

---

## 6. Estados funcionales

| Estado | Etiqueta UI | Criterio |
|---|---|---|
| `fiscal_year_authorized` | Autorizado | Proyecto creado en cartera, sin ID capturado en adquisiciones. |
| `committed` | ID vinculado | El ID del proyecto de inversión ya fue capturado en Proyecto Adquisitivo. |
| `formalized` | Formalizado | La adquisición vinculada fue formalizada y afecta el comprometido. |
| `redistributing` | Redistribución | Proyecto con movimiento de redistribución/remanente. |
| `closed` | Concluido | Proyecto cerrado. Consulta histórica. |
| `cancelled` | Cancelado | Proyecto cancelado. Consulta histórica. |

---

## 7. Semáforo de análisis

| Color funcional | Condición | Acción sugerida |
|---|---|---|
| Verde | committed_amount > 0 y remaining_balance < 20% del current_amount | Revisar si es candidato a cierre. |
| Amarillo | ID vinculado pero sin formalización, o remanente entre 20% y 50% | Seguimiento con Proyecto Adquisitivo / definir remanente. |
| Rojo | remaining_balance > 50%, sin ID adquisitivo, o compromiso excede vigente | Revisión prioritaria por Presupuesto y Compras. |
| Azul | is_multi_year = true y fecha de término próxima | Dar seguimiento por vigencia plurianual. |
| Gris | status = closed o cancelled | Solo lectura y consulta histórica. |

---

## 8. Clasificación analítica de proyectos

| Clasificación | Criterio | Uso operativo |
|---|---|---|
| Sin ejercicio | Proyecto autorizado sin ID de Proyecto Adquisitivo | Detectar proyectos sin arranque adquisitivo. |
| ID en adquisiciones | Proyecto con referencia adquisitiva vinculada pero no formalizada | Seguimiento con Compras/Adquisiciones. |
| Formalizado | Proyecto con adquisición formalizada | Seguimiento financiero y cierre. |
| Con remanente pendiente | remaining_balance > 0 y status != closed | Definir destino del saldo. |
| Candidato a cierre | committed_amount > 0 y remaining_balance < 20% | Preparar cierre formal. |
| Plurianual activo | is_multi_year = true y status != closed | Seguimiento entre ejercicios. |
| Riesgo de exceso | committed_amount > current_amount | Bloqueo o advertencia. |
| Alta variabilidad | Múltiples movimientos financieros | Revisión administrativa. |

---

## 9. Requerimientos funcionales actualizados

| ID | Requerimiento | Prioridad | Criterio de aceptación |
|---|---|---|---|
| CP-01 | Crear proyecto de inversión desde cartera | Alta | El usuario captura datos generales y monto inicial en modal; el proyecto queda `fiscal_year_authorized`. |
| CP-02 | No permitir carga documental en cartera | Alta | La pantalla de cartera y captura no muestran formulario de documentos; solo informan que los documentos se cargan en Proyecto Adquisitivo. |
| CP-03 | Crear proyectos por plantilla Excel/CSV | Alta | El usuario descarga/importa plantilla y se crean proyectos masivamente sin columnas de documentos. |
| CP-04 | Mostrar cartera filtrable | Alta | El usuario filtra por texto, estado, semáforo y área. |
| CP-05 | Mostrar impacto financiero por proyecto | Alta | El usuario visualiza autorizado inicial, vigente, comprometido formalizado, remanente y porcentajes. |
| CP-06 | Consultar documentos vinculados | Media | El detalle del proyecto muestra documentos cargados desde Proyecto Adquisitivo en modo consulta. |
| PA-01 | Capturar ID de proyecto de inversión en Proyecto Adquisitivo | Alta | Al guardar una adquisición con ID válido, el proyecto de cartera cambia a `committed` / ID vinculado. |
| PA-02 | Registrar requisición, contrato o pedido | Alta | El usuario captura tipo, folio, proveedor, monto y estado desde modal. |
| PA-03 | Cargar documentos en Proyecto Adquisitivo | Alta | El usuario registra documento desde modal de Proyecto Adquisitivo; el documento queda vinculado al ID de inversión. |
| PA-04 | Formalizar adquisición | Alta | Al formalizar una referencia, el proyecto cambia a `formalized` y el monto afecta `committed_amount`. |
| PA-05 | Mostrar impacto de la adquisición en cartera | Alta | Proyecto Adquisitivo muestra estado de cartera, monto vigente, comprometido y referencias formalizadas. |
| AP-01 | Clasificar automáticamente proyectos por estado analítico | Alta | El sistema etiqueta sin ejercicio, ID en adquisiciones, formalizado, candidato a cierre, etc. |
| AP-02 | Mostrar semáforo por proyecto | Alta | El color se calcula con reglas de remanente, vinculación, formalización, estado y plurianualidad. |
| AP-03 | Detectar candidatos a cierre | Alta | El sistema lista proyectos con compromiso formalizado mayor a cero y remanente menor a 20%. |
| AP-04 | Detectar remanentes pendientes | Alta | El sistema lista proyectos activos con saldo pendiente de definición. |
| AP-05 | Exportar análisis a Excel y PDF mock | Media | El reporte incluye filtros aplicados, fecha de generación y usuario demo. |
| UX-01 | Usar modales para captura | Alta | Las capturas principales se abren en modales; la pantalla base muestra tarjetas de acción y resúmenes. |
| UX-02 | Mostrar flujo guiado | Alta | Cartera y Proyecto Adquisitivo muestran pasos claros: crear, vincular ID, cargar documentos, formalizar. |
| AUD-01 | Generar timeline y auditoría mock | Media | Cada acción simulada agrega evento de timeline y auditoría. |

---

## 10. Diseño spec-driven por componente Livewire objetivo

### 10.1 InvestmentPortfolioDashboard

**Responsabilidad:** Mostrar KPIs globales de cartera, semáforos, proyectos críticos y distribución por estado.

**Entradas:** fiscal_year, status, area, traffic_light, is_multi_year.  
**Lecturas:** investment_projects, financial_commitments, project_alerts.  
**Salidas:** tarjetas KPI, distribución por estado, lista de proyectos críticos.  
**Reglas:** No edita datos. Solo consume agregados.

### 10.2 InvestmentProjectTable

**Responsabilidad:** Tabla principal de cartera con filtros interactivos.

**Columnas mínimas:** internal_folio, name, fiscal_year, status, current_amount, committed_amount, remaining_balance, committed_percentage, traffic_light, procurement_links_count, formalized_commitments_count, actions.

**Acciones:** ver detalle, abrir Proyecto Adquisitivo, exportar, abrir timeline.

### 10.3 InvestmentProjectCaptureModal

**Responsabilidad:** Alta individual de proyectos de inversión.

**Debe capturar:** nombre, ejercicio, área, responsable, ubicación, objetivo, monto autorizado inicial, plurianualidad, fecha término.

**No debe capturar:** documentos.

### 10.4 BulkInvestmentProjectImportModal

**Responsabilidad:** Carga masiva de proyectos por plantilla Excel/CSV.

**Debe permitir:** descargar plantilla, importar archivo, pegar contenido tabular, validar filas y crear proyectos.

**Regla:** la plantilla no debe incluir carga documental.

### 10.5 ProcurementProjectModal

**Responsabilidad:** Capturar ID del proyecto de inversión en Proyecto Adquisitivo y registrar requisición/contrato/pedido.

**Debe capturar:** investment_project_id/internal_folio, type, folio, supplier, amount, status.

**Regla:** si el ID es válido, cartera cambia a `committed` cuando se registra la referencia.

### 10.6 ProcurementDocumentModal

**Responsabilidad:** Cargar documentos del Proyecto Adquisitivo.

**Debe capturar:** archivo/nombre, tipo, estado, folio adquisitivo opcional, ID de inversión.

**Regla:** documentos se guardan como evidencia adquisitiva y cartera solo los consulta.

### 10.7 ProcurementFormalizationAction

**Responsabilidad:** Formalizar una referencia adquisitiva.

**Reglas:**

- Cambia la referencia a `formalized`.
- Cambia el proyecto de cartera a `formalized`.
- Incluye el monto en `committed_amount`.
- Registra timeline y auditoría.

### 10.8 ProjectFinancialSummary

**Responsabilidad:** Resumen financiero dentro del detalle del proyecto.

**Debe mostrar:** monto inicial, movimientos netos, monto vigente, comprometido formalizado, remanente, porcentaje comprometido, porcentaje pendiente.

### 10.9 ProjectClosureAnalysis

**Responsabilidad:** Determinar si un proyecto puede cerrarse.

**Reglas:**

- Si remaining_balance > 0, no se puede cerrar sin definir destino.
- Si committed_amount = 0, no debe marcarse automáticamente como candidato a cierre.
- Si remaining_balance < 20% y committed_amount > 0, sugerir revisión de cierre.

### 10.10 ProjectRiskPanel

**Responsabilidad:** Mostrar alertas y riesgos.

**Riesgos mínimos:** sin ID adquisitivo, ID vinculado sin formalizar, remanente alto, candidato a cierre, plurianual próximo a vencer, múltiples contrataciones, compromiso mayor al vigente.

---

## 11. Modelo de datos recomendado

### Tablas principales

| Tabla | Propósito |
|---|---|
| investment_projects | Proyecto de inversión en cartera. |
| project_movements | Ampliaciones, reducciones, redistribuciones y ajustes. |
| financial_commitments | Tabla puente a requisiciones, contratos o pedidos del Proyecto Adquisitivo vinculados por ID de inversión. |
| procurement_documents | Documentos cargados desde Proyecto Adquisitivo. |
| project_alerts | Alertas manuales o automáticas. |
| project_timeline_events | Línea de tiempo del proyecto. |
| project_audit_events | Bitácora/auditoría funcional. |

### Campos críticos

```text
investment_projects.status:
  initial_registration | incorporated_authorized | fiscal_year_authorized | in_procurement_process | committed | formalized | pending_remaining_balance | closed | cancelled

financial_commitments.status:
  linked | formalized | modified | cancelled

procurement_documents.status:
  uploaded | validated | pending_validation | rejected
```

---

## 12. Vistas SQL recomendadas

```sql
CREATE VIEW vw_project_financial_analysis AS
SELECT
    p.id,
    p.internal_folio,
    p.name,
    p.fiscal_year,
    p.status,
    p.initial_authorized_amount,
    COALESCE(p.initial_authorized_amount, 0) + COALESCE(m.movements_total, 0) AS current_amount,
    COALESCE(c.formalized_amount, 0) AS committed_amount,
    (COALESCE(p.initial_authorized_amount, 0) + COALESCE(m.movements_total, 0)) - COALESCE(c.formalized_amount, 0) AS remaining_balance,
    COALESCE(c.procurement_links_count, 0) AS procurement_links_count,
    COALESCE(c.formalized_commitments_count, 0) AS formalized_commitments_count,
    COALESCE(d.documents_count, 0) AS procurement_documents_count,
    p.is_multi_year,
    p.start_date,
    p.end_date,
    p.closed_at
FROM investment_projects p
LEFT JOIN (
    SELECT project_id, SUM(amount) AS movements_total
    FROM project_movements
    GROUP BY project_id
) m ON m.project_id = p.id
LEFT JOIN (
    SELECT
        investment_project_id AS project_id,
        COUNT(*) AS procurement_links_count,
        COUNT(*) FILTER (WHERE status = 'formalized') AS formalized_commitments_count,
        SUM(committed_amount) FILTER (WHERE status = 'formalized') AS formalized_amount
    FROM financial_commitments
    GROUP BY investment_project_id
) c ON c.project_id = p.id
LEFT JOIN (
    SELECT investment_project_id AS project_id, COUNT(*) AS documents_count
    FROM procurement_documents
    GROUP BY investment_project_id
) d ON d.project_id = p.id;
```

```sql
CREATE VIEW vw_project_closure_candidates AS
SELECT *
FROM vw_project_financial_analysis
WHERE committed_amount > 0
  AND current_amount > 0
  AND (remaining_balance / current_amount) < 0.20
  AND status NOT IN ('closed', 'cancelled');
```

```sql
CREATE VIEW vw_projects_without_procurement_id AS
SELECT *
FROM vw_project_financial_analysis
WHERE procurement_links_count = 0
  AND status NOT IN ('closed', 'cancelled');
```

```sql
CREATE VIEW vw_projects_linked_not_formalized AS
SELECT *
FROM vw_project_financial_analysis
WHERE procurement_links_count > 0
  AND formalized_commitments_count = 0
  AND status NOT IN ('closed', 'cancelled');
```

---

## 13. Servicio de dominio recomendado

```text
ProjectAnalysisService
├── getPortfolioSummary(filters)
├── getProjectFinancialAnalysis(projectId)
├── getClosureCandidates(filters)
├── getPendingBalances(filters)
├── getProjectsWithoutProcurementId(filters)
├── getProjectsLinkedNotFormalized(filters)
├── getRiskLevel(projectId)
├── getTrafficLight(projectId)
├── getProcurementAnalysis(projectId)
├── getProcurementDocuments(projectId)
└── exportAnalysis(filters, format)
```

```text
ProcurementLinkService
├── linkInvestmentProject(procurementReferenceId, investmentProjectId)
├── createProcurementReference(investmentProjectId, payload)
├── uploadProcurementDocument(investmentProjectId, payload)
├── formalizeReference(referenceId)
└── syncPortfolioStatus(investmentProjectId)
```

---

## 14. Reglas de negocio

| Regla | Descripción |
|---|---|
| No cargar documentos en cartera | La cartera solo consulta documentos vinculados desde Proyecto Adquisitivo. |
| Plantilla solo crea proyectos | La carga Excel/CSV crea proyectos nuevos, no documentos. |
| ID en adquisiciones compromete cartera | Capturar el ID del proyecto de inversión en Proyecto Adquisitivo cambia el estado de cartera a `committed`. |
| Formalización actualiza cartera | Formalizar una requisición/contrato/pedido cambia cartera a `formalized`. |
| Solo formalizados afectan monto comprometido | Referencias en borrador o revisión no suman a `committed_amount`. |
| No modificar datos desde análisis | Las pantallas de análisis no deben editar montos ni estados financieros. |
| Usar cálculos oficiales | El análisis debe usar current_amount, committed_amount y remaining_balance del motor financiero. |
| No cerrar desde dashboard sin validación | El dashboard puede sugerir cierre, pero el cierre debe pasar por el flujo formal. |
| Mantener trazabilidad | Toda acción debe registrarse en timeline y auditoría. |
| Evitar duplicidad | No duplicar expedientes documentales entre cartera y adquisiciones. |

---

## 15. Criterios de aceptación

| ID | Criterio |
|---|---|
| CA-01 | El usuario puede crear un proyecto en cartera sin ver campos de documentos. |
| CA-02 | El usuario puede importar proyectos por plantilla Excel/CSV. |
| CA-03 | La plantilla de cartera no solicita documentos. |
| CA-04 | El usuario puede capturar el ID de inversión en Proyecto Adquisitivo. |
| CA-05 | Al capturar el ID en Proyecto Adquisitivo, cartera muestra el proyecto como ID vinculado/comprometido. |
| CA-06 | El usuario puede cargar documentos únicamente en Proyecto Adquisitivo. |
| CA-07 | Cartera muestra documentos vinculados en modo consulta. |
| CA-08 | Al formalizar en Proyecto Adquisitivo, cartera cambia a Formalizado. |
| CA-09 | Solo montos formalizados se suman a `committed_amount`. |
| CA-10 | El usuario puede visualizar análisis financiero individual por proyecto. |
| CA-11 | La cartera puede filtrarse por estado, semáforo y área. |
| CA-12 | El sistema identifica automáticamente proyectos candidatos a cierre. |
| CA-13 | El sistema identifica proyectos con remanente pendiente. |
| CA-14 | Las capturas principales se abren en modales, no como formularios incrustados. |
| CA-15 | Los KPIs se actualizan con base en la información vigente del módulo. |
| CA-16 | Cada acción relevante genera timeline y auditoría mock. |

---

## 16. Pruebas BDD sugeridas

```gherkin
Feature: Flujo Cartera - Proyecto Adquisitivo

Scenario: Crear proyecto sin documentos en cartera
  Given el usuario está en Captura de cartera
  When abre el modal Crear proyecto
  Then el formulario no debe mostrar campos de documentos
  And al guardar debe crear el proyecto con estado fiscal_year_authorized

Scenario: Carga masiva por plantilla
  Given el usuario está en Captura de cartera
  When abre el modal Carga masiva Excel/CSV
  And importa una plantilla con dos filas válidas
  Then el sistema debe crear dos proyectos
  And ninguno debe tener documentos cargados desde cartera

Scenario: Vincular ID en Proyecto Adquisitivo
  Given existe el proyecto CART-0001-2026 en cartera
  When el usuario captura CART-0001-2026 en Proyecto Adquisitivo
  And guarda una requisición en revisión
  Then el proyecto en cartera debe quedar con estado committed
  And committedAmount no debe aumentar todavía

Scenario: Formalizar adquisición
  Given existe una requisición vinculada a CART-0001-2026
  And la requisición está en revisión
  When el usuario formaliza la requisición
  Then el proyecto en cartera debe quedar con estado formalized
  And committedAmount debe incluir el monto de la requisición

Scenario: Cargar documento en Proyecto Adquisitivo
  Given existe el proyecto CART-0001-2026 en cartera
  When el usuario carga un documento en Proyecto Adquisitivo para ese ID
  Then el documento debe quedar asociado al Proyecto Adquisitivo
  And el detalle de cartera debe mostrarlo solo como consulta

Scenario: Identificar proyecto candidato a cierre
  Given existe un proyecto con monto vigente de 100000
  And tiene monto comprometido formalizado de 85000
  And tiene remanente de 15000
  When el usuario consulta el análisis de cartera
  Then el sistema debe clasificarlo como candidato a cierre

Scenario: Bloquear interpretación de cierre cuando no hay formalización
  Given existe un proyecto con monto vigente de 100000
  And tiene una referencia adquisitiva en revisión por 85000
  When el usuario consulta candidatos a cierre
  Then el proyecto no debe aparecer como candidato a cierre

Scenario: Mostrar riesgo por compromiso mayor al vigente
  Given existe un proyecto con monto vigente de 100000
  And tiene monto comprometido formalizado de 120000
  When el sistema genera alertas
  Then debe crear alerta de procedimiento que excede monto vigente
```

---

## 17. Entregables de desarrollo

| Entregable | Descripción |
|---|---|
| ProjectAnalysisService | Servicio central de cálculos analíticos. |
| ProcurementLinkService | Servicio para vincular ID, documentos y formalización con cartera. |
| Livewire InvestmentPortfolioDashboard | Panel ejecutivo de análisis. |
| Livewire InvestmentProjectTable | Tabla filtrable de cartera. |
| Livewire InvestmentProjectCaptureModal | Modal de alta individual. |
| Livewire BulkInvestmentProjectImportModal | Modal de carga masiva Excel/CSV. |
| Livewire ProcurementProjectModal | Modal de captura de ID y referencia adquisitiva. |
| Livewire ProcurementDocumentModal | Modal de carga documental en Proyecto Adquisitivo. |
| Livewire ProjectFinancialSummary | Resumen financiero por proyecto. |
| Livewire ProjectClosureAnalysis | Panel de cierre/candidatos. |
| Vistas SQL analíticas | Vistas opcionales para consultas limpias. |
| ExportAnalysisAction | Acción para exportar Excel/PDF. |
| Tests BDD/TDD | Pruebas de flujo, clasificación, semáforo y filtros. |

---

## 18. Recomendación final

El análisis de proyectos debe desarrollarse como una capa de lectura e interpretación sobre el motor financiero y el flujo adquisitivo. Primero se asegura que proyectos, movimientos, referencias adquisitivas, formalizaciones y remanentes estén correctos. Después se construyen análisis, semáforos, alertas, dashboard y exportaciones.

La secuencia recomendada es:

1. Validar datos base del proyecto en cartera.
2. Validar carga masiva por plantilla.
3. Validar vinculación por ID en Proyecto Adquisitivo.
4. Validar carga documental exclusivamente en Proyecto Adquisitivo.
5. Validar formalización y sincronización de estado hacia cartera.
6. Validar cálculos financieros.
7. Crear vistas o queries de análisis.
8. Crear servicios de dominio.
9. Crear componentes Livewire con modales.
10. Agregar filtros y semáforos.
11. Agregar exportaciones.
12. Integrar al Dashboard Ejecutivo.
