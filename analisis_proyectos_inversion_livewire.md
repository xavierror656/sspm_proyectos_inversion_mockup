# Análisis de Proyectos de Inversión SSPM

**Documento:** Addendum funcional y técnico  
**Módulo:** Submódulo de Cartera y Seguimiento de Proyectos de Inversión SSPM  
**Clave:** MOD-Presupuesto-Cartera-Inversión  
**Arquitectura UI/UX:** Laravel Blade + Livewire sobre la arquitectura existente SSPM  
**Base de datos:** PostgreSQL, usando nombres de tablas y campos en inglés  

## 1. Propósito del análisis de proyectos

El análisis de proyectos permite convertir la cartera de inversión en información accionable para Presupuesto, Dirección Administrativa, Auditoría y Dashboard Ejecutivo. No reemplaza el registro operativo del proyecto; lo complementa con lectura financiera, avance administrativo, riesgo, remanente, compromiso, alertas y cierre.

El análisis responde preguntas como:

- ¿Qué proyectos tienen recurso autorizado pero no han iniciado procedimiento adquisitivo?
- ¿Qué proyectos ya tienen contratos, pedidos o requisiciones formalizadas?
- ¿Cuánto recurso está comprometido y cuánto queda como remanente?
- ¿Qué proyectos son candidatos a cierre?
- ¿Qué proyectos requieren redistribución, reducción o cancelación de remanente?
- ¿Qué proyectos representan riesgo administrativo o de auditoría?

## 2. Alcance del análisis

El análisis se construye sobre información ya registrada en el módulo. No debe permitir editar montos ni reemplazar los movimientos formales. Su función es consultar, calcular, clasificar, alertar y facilitar toma de decisiones.

### Incluye

| Elemento | Descripción |
|---|---|
| Análisis financiero | Vigente, comprometido, remanente, porcentaje ejercido y porcentaje pendiente. |
| Análisis de estado | Clasificación por ciclo de vida: autorizado, en procedimiento, comprometido, con remanente, concluido. |
| Análisis de cierre | Identificación de proyectos candidatos a cierre o bloqueados por remanente. |
| Análisis de alertas | Semáforos por remanente alto, falta de autorización de ejercicio, plurianualidad y múltiples contrataciones. |
| Análisis de integración con Compras | Revisión de requisiciones, contratos y pedidos vinculados. |
| Análisis de auditoría | Revisión de trazabilidad, movimientos, timeline y bitácora. |
| Análisis ejecutivo | KPIs para Dashboard y reportes institucionales. |

### No incluye

| Exclusión | Motivo |
|---|---|
| Devengo y pago | El módulo solo controla compromiso, no pagos efectivos. |
| Cierre contable | Corresponde a procesos financieros posteriores. |
| Integración automática con SAF | Fuera del alcance documentado. |
| Edición directa de monto vigente | El monto vigente solo cambia mediante movimientos. |
| Liberación automática de remanente | El remanente requiere movimiento formal. |

## 3. Dimensiones de análisis

| Dimensión | Campos fuente | Resultado esperado |
|---|---|---|
| Identificación | internal_folio, municipal_folio, name, fiscal_year | Ubicar proyecto y ejercicio fiscal. |
| Financiera | initial_authorized_amount, current_amount, committed_amount, remaining_balance | Conocer salud financiera del proyecto. |
| Procedimiento adquisitivo | financial_commitments, reference_type, reference_id, status | Saber si el proyecto ya está vinculado a Compras. |
| Estado | status | Interpretar etapa actual del ciclo de vida. |
| Remanente | remaining_balance, current_amount | Detectar saldos pendientes de definición. |
| Cierre | closed_at, status, remaining_balance | Identificar si puede cerrarse o si requiere acción previa. |
| Riesgo | alerts, multiple commitments, due dates | Priorizar atención operativa. |
| Auditoría | project_timeline_events, external_audit_log | Revisar trazabilidad y evidencia. |

## 4. Fórmulas de análisis

| Indicador | Fórmula | Interpretación |
|---|---|---|
| Monto vigente | initial_authorized_amount + suma de movimientos financieros | Recurso real disponible después de ampliaciones/reducciones. |
| Monto comprometido | suma de financial_commitments formalizados | Recurso ya asociado a contrato, pedido o requisición formalizada. |
| Remanente | current_amount - committed_amount | Saldo pendiente de definir. |
| Porcentaje comprometido | committed_amount / current_amount * 100 | Nivel de avance financiero. |
| Porcentaje remanente | remaining_balance / current_amount * 100 | Recurso pendiente. |
| Variación sobre inicial | current_amount - initial_authorized_amount | Crecimiento o reducción del proyecto. |
| Número de movimientos | count(project_movements) | Nivel de modificación administrativa/financiera. |
| Número de compromisos | count(financial_commitments) | Cantidad de compras vinculadas. |

## 5. Semáforo de análisis

| Color funcional | Condición | Acción sugerida |
|---|---|---|
| Verde | committed_amount > 0 y remaining_balance < 20% del current_amount | Revisar si es candidato a cierre. |
| Amarillo | remaining_balance entre 20% y 50% del current_amount | Definir si continuará, se redistribuirá o se reducirá. |
| Rojo | remaining_balance > 50% del current_amount o sin procedimiento adquisitivo | Revisión prioritaria por Presupuesto. |
| Azul | is_multi_year = true y fecha de término próxima | Dar seguimiento por vigencia plurianual. |
| Gris | status = concluded o canceled | Solo lectura y consulta histórica. |

## 6. Clasificación analítica de proyectos

| Clasificación | Criterio | Uso operativo |
|---|---|---|
| Sin ejercicio | Proyecto autorizado sin requisición, contrato o pedido vinculado | Detectar proyectos sin arranque. |
| En proceso de compra | Proyecto con referencia de Compras vinculada pero no formalizada | Seguimiento con Compras. |
| Comprometido | Proyecto con compromiso formalizado | Seguimiento financiero. |
| Con remanente pendiente | remaining_balance > 0 y status != concluded | Definir destino del saldo. |
| Candidato a cierre | committed_amount > 0 y remaining_balance < 20% | Preparar cierre formal. |
| Plurianual activo | is_multi_year = true y status != concluded | Seguimiento entre ejercicios. |
| Riesgo de exceso | committed_amount > current_amount | Bloqueo o advertencia. |
| Alta variabilidad | Múltiples movimientos financieros | Revisión administrativa. |

## 7. Requerimientos funcionales del análisis de proyectos

| ID | Requerimiento | Prioridad | Criterio de aceptación |
|---|---|---|---|
| AP-01 | Mostrar resumen financiero por proyecto | Alta | El usuario visualiza autorizado inicial, vigente, comprometido, remanente y porcentajes. |
| AP-02 | Clasificar automáticamente proyectos por estado analítico | Alta | El sistema etiqueta proyectos como sin ejercicio, comprometido, candidato a cierre, etc. |
| AP-03 | Mostrar semáforo por proyecto | Alta | El color se calcula con reglas de remanente, compromiso, estado y plurianualidad. |
| AP-04 | Filtrar cartera por ejercicio, estado, semáforo, área, remanente y plurianualidad | Alta | Livewire actualiza la tabla sin recargar página completa. |
| AP-05 | Mostrar detalle de compromisos vinculados | Alta | El proyecto muestra requisiciones, contratos y pedidos asociados. |
| AP-06 | Mostrar línea de tiempo analítica | Media | El usuario ve eventos relevantes y movimientos ordenados por fecha. |
| AP-07 | Detectar candidatos a cierre | Alta | El sistema lista proyectos con compromiso mayor a cero y remanente menor a 20%. |
| AP-08 | Detectar remanentes pendientes | Alta | El sistema lista proyectos con saldo pendiente de definición. |
| AP-09 | Exportar análisis a Excel y PDF | Media | El reporte incluye filtros aplicados, fecha de generación y usuario. |
| AP-10 | Alimentar Dashboard Ejecutivo | Alta | Los KPIs agregados están disponibles para tablero institucional. |

## 8. Diseño spec-driven por componente Livewire

### 8.1 ProjectAnalysisDashboard

**Responsabilidad:** Mostrar KPIs globales de cartera, semáforos, proyectos críticos y distribución por estado.

**Entradas:** fiscal_year, status, area, traffic_light, is_multi_year.  
**Lecturas:** investment_projects, financial_commitments, project_alerts.  
**Salidas:** tarjetas KPI, gráfica/resumen por estado, lista de proyectos críticos.  
**Reglas:** No edita datos. Solo consume agregados.

### 8.2 ProjectAnalysisTable

**Responsabilidad:** Tabla principal de análisis con filtros interactivos.

**Columnas mínimas:** internal_folio, name, fiscal_year, status, current_amount, committed_amount, remaining_balance, committed_percentage, remaining_percentage, traffic_light, actions.

**Acciones:** ver detalle, exportar, abrir timeline, revisar compromisos.

### 8.3 ProjectFinancialSummary

**Responsabilidad:** Resumen financiero dentro del detalle del proyecto.

**Debe mostrar:** monto inicial, movimientos netos, monto vigente, compromiso, remanente, porcentaje ejercido, porcentaje pendiente.

### 8.4 ProjectClosureAnalysis

**Responsabilidad:** Determinar si un proyecto puede cerrarse.

**Reglas:**

- Si remaining_balance > 0, no se puede cerrar sin definir destino.
- Si committed_amount = 0, no debe marcarse automáticamente como candidato a cierre.
- Si remaining_balance < 20% y committed_amount > 0, sugerir revisión de cierre.

### 8.5 ProjectProcurementAnalysis

**Responsabilidad:** Analizar la relación del proyecto con Compras.

**Debe mostrar:** requisiciones, contratos, pedidos, montos, estado de formalización, fecha y folio.

### 8.6 ProjectRiskPanel

**Responsabilidad:** Mostrar alertas y riesgos.

**Riesgos mínimos:** sin ejercicio, remanente alto, candidato a cierre, plurianual próximo a vencer, múltiples contrataciones, compromiso mayor al vigente.

## 9. Vistas SQL recomendadas

Las vistas no son obligatorias, pero ayudan a separar cálculos analíticos de la interfaz Livewire.

```sql
CREATE VIEW vw_project_financial_analysis AS
SELECT
    p.id,
    p.internal_folio,
    p.name,
    p.fiscal_year,
    p.status,
    p.initial_authorized_amount,
    p.current_amount,
    p.committed_amount,
    p.remaining_balance,
    CASE
        WHEN p.current_amount > 0 THEN ROUND((p.committed_amount / p.current_amount) * 100, 2)
        ELSE 0
    END AS committed_percentage,
    CASE
        WHEN p.current_amount > 0 THEN ROUND((p.remaining_balance / p.current_amount) * 100, 2)
        ELSE 0
    END AS remaining_percentage,
    p.is_multi_year,
    p.start_date,
    p.end_date,
    p.closed_at
FROM investment_projects p;
```

```sql
CREATE VIEW vw_project_closure_candidates AS
SELECT *
FROM vw_project_financial_analysis
WHERE committed_amount > 0
  AND current_amount > 0
  AND remaining_percentage < 20
  AND status NOT IN ('concluded', 'canceled');
```

```sql
CREATE VIEW vw_project_pending_balances AS
SELECT *
FROM vw_project_financial_analysis
WHERE remaining_balance > 0
  AND status NOT IN ('concluded', 'canceled');
```

## 10. Servicio de dominio recomendado

```text
ProjectAnalysisService
├── getPortfolioSummary(filters)
├── getProjectFinancialAnalysis(projectId)
├── getClosureCandidates(filters)
├── getPendingBalances(filters)
├── getRiskLevel(projectId)
├── getTrafficLight(projectId)
├── getProcurementAnalysis(projectId)
└── exportAnalysis(filters, format)
```

## 11. Reglas de negocio para análisis

| Regla | Descripción |
|---|---|
| No modificar datos desde análisis | Las pantallas de análisis no deben editar montos ni estados financieros. |
| Usar cálculos oficiales | El análisis debe usar current_amount, committed_amount y remaining_balance del motor financiero. |
| No cerrar desde dashboard sin validación | El dashboard puede sugerir cierre, pero el cierre debe pasar por el flujo formal. |
| Respetar permisos | Auxiliar consulta y exporta básico; Jefatura puede accionar; Dirección valida cierres/cancelaciones. |
| Mantener trazabilidad | Toda exportación o acción debe registrarse en bitácora o sistema de reportes. |
| Evitar duplicidad | Si ya existe dashboard o reportería institucional, conectar mediante servicios o vistas. |

## 12. Criterios de aceptación

| ID | Criterio |
|---|---|
| CA-AP-01 | El usuario puede visualizar análisis financiero individual por proyecto. |
| CA-AP-02 | La cartera puede filtrarse por año fiscal, estado, semáforo, área y plurianualidad. |
| CA-AP-03 | El sistema identifica automáticamente proyectos candidatos a cierre. |
| CA-AP-04 | El sistema identifica proyectos con remanente pendiente. |
| CA-AP-05 | El sistema muestra compromisos vinculados desde Compras. |
| CA-AP-06 | El sistema muestra alertas activas por proyecto. |
| CA-AP-07 | El análisis puede exportarse a Excel y PDF. |
| CA-AP-08 | El análisis no permite edición directa de montos financieros. |
| CA-AP-09 | Los KPIs se actualizan con base en la información vigente del módulo. |
| CA-AP-10 | Las consultas respetan permisos de rol. |

## 13. Pruebas BDD sugeridas

```gherkin
Feature: Análisis de proyectos de inversión

Scenario: Identificar proyecto candidato a cierre
  Given existe un proyecto con monto vigente de 100000
  And tiene monto comprometido de 85000
  And tiene remanente de 15000
  When el usuario consulta el análisis de cartera
  Then el sistema debe clasificarlo como candidato a cierre

Scenario: Bloquear interpretación de cierre cuando no hay compromiso
  Given existe un proyecto con monto vigente de 100000
  And tiene monto comprometido de 0
  And tiene remanente de 100000
  When el usuario consulta candidatos a cierre
  Then el proyecto no debe aparecer como candidato a cierre

Scenario: Mostrar remanente pendiente
  Given existe un proyecto activo con remanente mayor a 0
  When el usuario consulta proyectos con remanente pendiente
  Then el sistema debe mostrar el proyecto en el listado

Scenario: Mostrar riesgo por compromiso mayor al vigente
  Given existe un proyecto con monto vigente de 100000
  And tiene monto comprometido de 120000
  When el sistema genera alertas
  Then debe crear alerta de procedimiento que excede monto vigente
```

## 14. Entregables de desarrollo

| Entregable | Descripción |
|---|---|
| ProjectAnalysisService | Servicio central de cálculos analíticos. |
| Livewire ProjectAnalysisDashboard | Panel ejecutivo de análisis. |
| Livewire ProjectAnalysisTable | Tabla filtrable de cartera. |
| Livewire ProjectFinancialSummary | Resumen financiero por proyecto. |
| Livewire ProjectClosureAnalysis | Panel de cierre/candidatos. |
| Vistas SQL analíticas | Vistas opcionales para consultas limpias. |
| ExportAnalysisAction | Acción para exportar Excel/PDF. |
| Tests BDD/TDD | Pruebas de clasificación, semáforo y filtros. |

## 15. Recomendación final

El análisis de proyectos debe desarrollarse como una capa de lectura e interpretación sobre el motor financiero. Primero se asegura que proyectos, movimientos, compromisos y remanentes estén correctos. Después se construye análisis, semáforos, alertas, dashboard y exportaciones.

La secuencia recomendada es:

1. Validar datos base del proyecto.
2. Validar cálculos financieros.
3. Crear vistas o queries de análisis.
4. Crear ProjectAnalysisService.
5. Crear componentes Livewire de análisis.
6. Agregar filtros y semáforos.
7. Agregar exportaciones.
8. Integrar al Dashboard Ejecutivo.
