<script>
  import PageHeader from '$lib/components/PageHeader.svelte';
  import { allAuditEvents, allTimelineEvents } from '$lib/projectStore.js';
  import { formatDate } from '$lib/formatters.js';

  let mode = 'timeline';
  $: timeline = $allTimelineEvents;
  $: audit = $allAuditEvents;
</script>

<PageHeader
  title="Audit / Timeline"
  subtitle="Trazabilidad simulada de acciones, reportes, movimientos, alertas y compromisos."
/>

<div class="card">
  <div class="toolbar">
    <button class="btn {mode === 'timeline' ? '' : 'secondary'}" on:click={() => mode = 'timeline'}>Timeline</button>
    <button class="btn {mode === 'audit' ? '' : 'secondary'}" on:click={() => mode = 'audit'}>Auditoría</button>
  </div>

  {#if mode === 'timeline'}
    <div class="timeline">
      {#each timeline as event}
        <div class="timeline-item">
          <div class="timeline-date">{formatDate(event.date)}</div>
          <div>
            <strong>{event.title}</strong>
            <br><span class="small muted">{event.projectFolio} · {event.projectName}</span>
            <p>{event.description}</p>
            <span class="badge gray">{event.user}</span>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="table-wrap">
      <table>
        <thead><tr><th>Fecha</th><th>Proyecto</th><th>Acción</th><th>Usuario</th><th>Detalle</th></tr></thead>
        <tbody>
          {#each audit as event}
            <tr>
              <td>{event.date}</td>
              <td><strong>{event.projectFolio}</strong><br><span class="small muted">{event.projectName}</span></td>
              <td><code>{event.action}</code></td>
              <td>{event.user}</td>
              <td>{event.detail}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
