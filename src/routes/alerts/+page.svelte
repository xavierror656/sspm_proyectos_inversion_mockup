<script>
  import { base } from '$app/paths';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import { analyzedProjects, projectsStore } from '$lib/projectStore.js';
  import { formatDate } from '$lib/formatters.js';
  import { SEVERITY_LABELS } from '$lib/finance.js';

  let severity = 'all';
  let message = null;

  $: projects = $analyzedProjects;
  $: alerts = projects.flatMap((project) => (project.alerts || []).map((alert) => ({ ...alert, project })));
  $: filtered = alerts.filter((alert) => severity === 'all' || alert.severity === severity);

  function resolve(alert) {
    message = projectsStore.resolveAlert(alert.project.id, alert.id);
  }
</script>

<PageHeader
  title="Alerts / Alertas"
  subtitle="Riesgos mock por remanente alto, falta de formalización, exceso de compromiso y plurianualidad."
/>

<div class="card">
  <div class="toolbar">
    <div class="field">
      <label for="alerts-severity">Severidad</label>
      <select id="alerts-severity" class="select" bind:value={severity}>
        <option value="all">Todas</option>
        <option value="critical">Crítica</option>
        <option value="warning">Advertencia</option>
        <option value="info">Informativa</option>
        <option value="success">Atendida</option>
      </select>
    </div>
  </div>
  {#if message}<p class="notice {message.ok ? 'ok' : 'error'}">{message.message}</p>{/if}

  <div class="table-wrap">
    <table>
      <thead><tr><th>Proyecto</th><th>Severidad</th><th>Alerta</th><th>Mensaje</th><th>Fecha</th><th>Estado</th><th>Acción</th></tr></thead>
      <tbody>
        {#each filtered as alert}
          <tr>
            <td><a href={`${base}/projects/${alert.project.id}`}><strong>{alert.project.internalFolio}</strong></a><br><span class="small muted">{alert.project.name}</span></td>
            <td><span class="badge {alert.severity}">{SEVERITY_LABELS[alert.severity] || alert.severity}</span></td>
            <td><strong>{alert.title}</strong></td>
            <td>{alert.message}</td>
            <td>{formatDate(alert.date)}</td>
            <td>{alert.status === 'resolved' ? 'Atendida' : 'Abierta'}</td>
            <td>
              {#if alert.status !== 'resolved'}
                <button class="btn secondary" on:click={() => resolve(alert)}>Atender</button>
              {:else}
                <span class="muted">Sin acción</span>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
