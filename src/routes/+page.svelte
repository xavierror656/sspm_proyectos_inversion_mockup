<script>
  import { base } from '$app/paths';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import KpiCard from '$lib/components/KpiCard.svelte';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import TrafficBadge from '$lib/components/TrafficBadge.svelte';
  import { summaryStore } from '$lib/projectStore.js';
  import { formatCurrency, formatPercent } from '$lib/formatters.js';

  $: summary = $summaryStore;
  $: critical = summary.analyzed.filter((project) => project.trafficLight === 'red' || project.exceedsAvailableAmount || project.pendingBalance).slice(0, 5);
</script>

<PageHeader
  title="Dashboard Ejecutivo"
  subtitle="Vista mock de KPIs de cartera, remanentes, compromisos y riesgos administrativos."
/>

<section class="grid kpis">
  <KpiCard label="Proyectos" value={summary.projects} note="Cartera mock 2026" />
  <KpiCard label="Monto vigente" value={formatCurrency(summary.totals.current)} note={`Inicial: ${formatCurrency(summary.totals.initial)}`} />
  <KpiCard label="Comprometido" value={formatCurrency(summary.totals.committed)} note={`${formatPercent(summary.totals.executionPercentage)} de avance global`} />
  <KpiCard label="Remanente" value={formatCurrency(summary.totals.remaining)} note={`${summary.pendingBalances} proyectos con remanente > 20%`} />
</section>

<section class="grid two" style="margin-top:16px">
  <div class="card">
    <h3>Distribución por semáforo</h3>
    <div class="grid" style="gap:12px">
      {#each [
        ['green', 'Verde', summary.green],
        ['yellow', 'Amarillo', summary.yellow],
        ['red', 'Rojo', summary.red],
        ['blue', 'Azul', summary.blue],
        ['gray', 'Gris', summary.gray]
      ] as item}
        <div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <TrafficBadge color={item[0]} label={item[1]} />
            <strong>{item[2]}</strong>
          </div>
          <ProgressBar value={(item[2] / summary.projects) * 100} tone={item[0]} />
        </div>
      {/each}
    </div>
  </div>

  <div class="card">
    <h3>Clasificación por estado</h3>
    <ul class="list">
      {#each summary.byStatus as row}
        <li style="display:flex;justify-content:space-between;align-items:center">
          <span>{row.label}</span>
          <span class="badge blue">{row.count}</span>
        </li>
      {/each}
    </ul>
  </div>
</section>

<section class="grid two" style="margin-top:16px">
  <div class="card">
    <h3>Proyectos críticos o pendientes</h3>
    <p class="sub">Priorización para Presupuesto, Compras y Dirección Administrativa.</p>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Folio</th><th>Proyecto</th><th>Remanente</th><th>Semáforo</th><th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {#each critical as project}
            <tr>
              <td><strong>{project.internalFolio}</strong></td>
              <td>{project.name}<br><span class="small muted">{project.area}</span></td>
              <td class="amount">{formatCurrency(project.remainingBalance)}</td>
              <td><TrafficBadge color={project.trafficLight} label={project.trafficLabel} reason={project.trafficReason} /></td>
              <td><a class="btn ghost" href={`${base}/projects/${project.id}`}>Ver detalle</a></td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  <div class="card">
    <h3>Reglas activas en la demo</h3>
    <div class="rule-box">
      <strong>currentAmount</strong> = initialAuthorizedAmount + sum(movements). No se edita directamente.
    </div>
    <ul class="list" style="margin-top:12px">
      <li>Solo compromisos <strong>formalizados</strong> afectan committedAmount.</li>
      <li>Redistribución no puede exceder remainingBalance.</li>
      <li>Cierre requiere definir destino del remanente.</li>
      <li>Cada acción simulada genera timeline y auditoría mock.</li>
    </ul>
  </div>
</section>
