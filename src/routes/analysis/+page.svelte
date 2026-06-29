<script>
  import PageHeader from '$lib/components/PageHeader.svelte';
  import FinancialSummary from '$lib/components/FinancialSummary.svelte';
  import TrafficBadge from '$lib/components/TrafficBadge.svelte';
  import { analyzedProjects } from '$lib/projectStore.js';
  import { formatCurrency, formatPercent } from '$lib/formatters.js';

  let selectedId = '';
  let filter = 'all';

  $: projects = $analyzedProjects;
  $: if (!selectedId && projects.length) selectedId = projects[0].id;
  $: selected = projects.find((project) => project.id === selectedId);
  $: filtered = projects.filter((project) => filter === 'all' || project.trafficLight === filter);
</script>

<PageHeader
  title="Project Analysis / Análisis Financiero"
  subtitle="Semáforo financiero y clasificación analítica calculada desde movimientos y compromisos formalizados."
/>

<section class="grid two">
  <div class="card">
    <h3>Semáforo de cartera</h3>
    <div class="toolbar">
      <div class="field">
        <label for="analysis-filter">Filtrar semáforo</label>
        <select id="analysis-filter" class="select" bind:value={filter}>
          <option value="all">Todos</option>
          <option value="green">Verde</option>
          <option value="yellow">Amarillo</option>
          <option value="red">Rojo</option>
          <option value="blue">Azul</option>
          <option value="gray">Gris</option>
        </select>
      </div>
    </div>
    <ul class="list">
      {#each filtered as project}
        <li style="display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center">
          <button class="btn ghost" style="justify-content:flex-start" on:click={() => selectedId = project.id}>
            {project.internalFolio} · {project.name}
          </button>
          <TrafficBadge color={project.trafficLight} label={project.trafficLabel} reason={project.trafficReason} />
        </li>
      {/each}
    </ul>
  </div>

  <div class="card">
    <h3>Reglas de cálculo</h3>
    <ul class="list">
      <li><strong>currentAmount</strong> = initialAuthorizedAmount + sum(movements)</li>
      <li><strong>committedAmount</strong> = sum(formalized commitments)</li>
      <li><strong>remainingBalance</strong> = currentAmount - committedAmount</li>
      <li><strong>closureCandidate</strong> = committedAmount &gt; 0 && remainingBalance &lt; currentAmount * 0.20</li>
      <li><strong>pendingBalance</strong> = remainingBalance &gt; currentAmount * 0.20</li>
      <li><strong>exceedsAvailableAmount</strong> = committedAmount &gt; currentAmount</li>
    </ul>
  </div>
</section>

{#if selected}
  <section style="margin-top:16px">
    <FinancialSummary project={selected} />
  </section>

  <section class="grid three" style="margin-top:16px">
    <div class="card">
      <h3>Resultado analítico</h3>
      <p><TrafficBadge color={selected.trafficLight} label={selected.trafficLabel} reason={selected.trafficReason} /></p>
      <p>{selected.trafficReason}</p>
      <div class="badges">
        {#each selected.analyticTags as tag}<span class="badge {tag.tone}">{tag.label}</span>{/each}
      </div>
    </div>
    <div class="card">
      <h3>Cierre</h3>
      {#if selected.closureCandidate}
        <div class="notice ok">Candidato a cierre: tiene compromiso y remanente menor al 20%.</div>
      {:else}
        <div class="notice">No se sugiere cierre automático. El cierre formal requiere validar remanente y documentación.</div>
      {/if}
      <p class="small muted">Remanente: {formatCurrency(selected.remainingBalance)} ({formatPercent(selected.remainingPercentage)})</p>
    </div>
    <div class="card">
      <h3>Riesgos</h3>
      <ul class="list">
        <li>Remanente pendiente: <strong>{selected.pendingBalance ? 'Sí' : 'No'}</strong></li>
        <li>Excede vigente: <strong>{selected.exceedsAvailableAmount ? 'Sí' : 'No'}</strong></li>
        <li>Compromisos formalizados: <strong>{selected.formalizedCommitments}</strong></li>
        <li>Referencias de compra: <strong>{selected.procurementReferences}</strong></li>
      </ul>
    </div>
  </section>
{/if}
