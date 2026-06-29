<script>
  import PageHeader from '$lib/components/PageHeader.svelte';
  import KpiCard from '$lib/components/KpiCard.svelte';
  import { projectsStore, summaryStore } from '$lib/projectStore.js';
  import { formatCurrency } from '$lib/formatters.js';

  let reportType = 'portfolio';
  let message = null;

  $: summary = $summaryStore;

  function generate(format) {
    message = projectsStore.addMockReportEvent(format);
  }
</script>

<PageHeader
  title="Reports / Reportes Mock"
  subtitle="Botones simulados para Excel, PDF e impresión; no descargan archivos reales."
/>

<section class="grid kpis">
  <KpiCard label="Proyectos incluidos" value={summary.projects} note="Según datos mock locales" />
  <KpiCard label="Vigente cartera" value={formatCurrency(summary.totals.current)} note="Incluye movimientos" />
  <KpiCard label="Comprometido" value={formatCurrency(summary.totals.committed)} note="Solo formalizados" />
  <KpiCard label="Alertas rojas" value={summary.red} note="Semáforo crítico" />
</section>

<section class="grid two" style="margin-top:16px">
  <div class="card">
    <h3>Generar reporte simulado</h3>
    <div class="field">
      <label for="reports-type">Tipo de reporte</label>
      <select id="reports-type" class="select" bind:value={reportType}>
        <option value="portfolio">Cartera general</option>
        <option value="closure">Candidatos a cierre</option>
        <option value="pending">Remanentes pendientes</option>
        <option value="audit">Auditoría y trazabilidad</option>
      </select>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px">
      <button class="btn" on:click={() => generate('Excel')}>Exportar Excel mock</button>
      <button class="btn" on:click={() => generate('PDF')}>Exportar PDF mock</button>
      <button class="btn secondary" on:click={() => generate('Print')}>Imprimir mock</button>
    </div>
    {#if message}<p class="notice ok">{message.message}</p>{/if}
  </div>

  <div class="card">
    <h3>Contenido esperado</h3>
    <ul class="list">
      <li>Filtros aplicados y fecha de generación.</li>
      <li>Usuario demo que genera el reporte.</li>
      <li>KPIs agregados de cartera.</li>
      <li>Listado de proyectos con semáforo y clasificación.</li>
      <li>Detalle financiero: vigente, comprometido y remanente.</li>
      <li>Evento en auditoría mock por cada generación.</li>
    </ul>
  </div>
</section>

<section class="card" style="margin-top:16px">
  <h3>Vista previa de reporte: {reportType}</h3>
  <div class="table-wrap">
    <table>
      <thead><tr><th>Folio</th><th>Proyecto</th><th>Estado</th><th>Vigente</th><th>Comprometido</th><th>Remanente</th><th>Semáforo</th></tr></thead>
      <tbody>
        {#each summary.analyzed as project}
          <tr>
            <td><strong>{project.internalFolio}</strong></td>
            <td>{project.name}</td>
            <td>{project.statusLabel}</td>
            <td class="amount">{formatCurrency(project.currentAmount)}</td>
            <td class="amount">{formatCurrency(project.committedAmount)}</td>
            <td class="amount">{formatCurrency(project.remainingBalance)}</td>
            <td>{project.trafficLabel}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>
