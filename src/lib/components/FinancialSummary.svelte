<script>
  import { formatCurrency, formatPercent } from '$lib/formatters.js';
  import ProgressBar from './ProgressBar.svelte';
  import TrafficBadge from './TrafficBadge.svelte';
  export let project;
</script>

<div class="grid three">
  <div class="card">
    <h3>Resumen financiero</h3>
    <ul class="list">
      <li><strong>Autorizado inicial:</strong> <span class="amount">{formatCurrency(project.initialAuthorizedAmount)}</span></li>
      <li><strong>Movimientos netos:</strong> <span class="amount">{formatCurrency(project.movementsTotal)}</span></li>
      <li><strong>Monto vigente:</strong> <span class="amount">{formatCurrency(project.currentAmount)}</span></li>
      <li><strong>Comprometido formalizado:</strong> <span class="amount">{formatCurrency(project.committedAmount)}</span></li>
      <li><strong>Remanente:</strong> <span class="amount">{formatCurrency(project.remainingBalance)}</span></li>
    </ul>
  </div>
  <div class="card">
    <h3>Avance financiero</h3>
    <p class="muted">Solo compromisos formalizados alimentan el monto comprometido.</p>
    <div style="display:grid;gap:10px">
      <div><strong>{formatPercent(project.executionPercentage)}</strong> comprometido</div>
      <ProgressBar value={project.executionPercentage} tone={project.trafficLight} />
      <div class="small muted">Remanente: {formatPercent(project.remainingPercentage)}</div>
    </div>
  </div>
  <div class="card">
    <h3>Semáforo</h3>
    <p><TrafficBadge color={project.trafficLight} label={project.trafficLabel} reason={project.trafficReason} /></p>
    <p>{project.trafficReason}</p>
    <div class="badges">
      {#each project.analyticTags as tag}
        <span class="badge {tag.tone}">{tag.label}</span>
      {/each}
    </div>
  </div>
</div>
