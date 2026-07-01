<script>
  import PageHeader from '$lib/components/PageHeader.svelte';
  import FinancialSummary from '$lib/components/FinancialSummary.svelte';
  import TrafficBadge from '$lib/components/TrafficBadge.svelte';
  import { base } from '$app/paths';
  import { analyzedProjects } from '$lib/projectStore.js';
  import { formatCurrency, formatDate } from '$lib/formatters.js';
  import { MOVEMENT_LABELS, COMMITMENT_LABELS, COMMITMENT_STATUS_LABELS } from '$lib/finance.js';
  import { page } from '$app/stores';

  $: project = $analyzedProjects.find((item) => item.id === $page.params.id);
</script>

{#if project}
  <PageHeader title={project.internalFolio} subtitle={project.name} />

  <section class="card detail-header">
    <div>
      <h2>{project.name}</h2>
      <p class="muted">{project.objective}</p>
      <div class="badges">
        <TrafficBadge color={project.trafficLight} label={project.trafficLabel} reason={project.trafficReason} />
        <span class="badge gray">{project.statusLabel}</span>
        <span class="badge blue">{project.area}</span>
        {#if project.isMultiYear}<span class="badge purple">Plurianual</span>{/if}
      </div>
    </div>
    <div class="amount">{formatCurrency(project.currentAmount)}</div>
  </section>

  <section style="margin-top:16px">
    <FinancialSummary {project} />
  </section>

  <section class="card flow-card" style="margin-top:16px">
    <div class="split-header">
      <div>
        <h3>Estado del flujo adquisitivo</h3>
        <p class="muted">Los documentos y la formalización se administran fuera de cartera, en Proyecto adquisitivo.</p>
      </div>
      <a class="btn" href={`${base}/commitments`}>Abrir Proyecto adquisitivo</a>
    </div>
    <div class="workflow-steps" style="margin-top:12px">
      <div class="workflow-step {project ? 'active' : ''}">
        <span>1</span><strong>Proyecto de inversión</strong><p>{project.internalFolio} creado en cartera.</p>
      </div>
      <div class="workflow-step {project.procurementReferences ? 'active' : ''}">
        <span>2</span><strong>ID capturado</strong><p>{project.procurementReferences ? `${project.procurementReferences} referencia(s) adquisitivas vinculadas.` : 'Pendiente capturar ID en adquisiciones.'}</p>
      </div>
      <div class="workflow-step {project.formalizedCommitments ? 'active' : ''}">
        <span>3</span><strong>Formalización</strong><p>{project.formalizedCommitments ? `${project.formalizedCommitments} formalizada(s); impacta comprometido.` : 'Pendiente formalizar en adquisiciones.'}</p>
      </div>
    </div>
  </section>

  <section class="grid two" style="margin-top:16px">
    <div class="card">
      <h3>Movimientos financieros</h3>
      <ul class="list">
        {#each project.movements as movement}
          <li>
            <strong>{MOVEMENT_LABELS[movement.type] || movement.type}</strong>
            <span class="amount" style="float:right">{formatCurrency(movement.amount)}</span>
            <br><span class="small muted">{formatDate(movement.date)} · {movement.concept} · {movement.user}</span>
          </li>
        {:else}
          <li class="muted">Sin movimientos registrados.</li>
        {/each}
      </ul>
    </div>

    <div class="card">
      <h3>Compromisos de compras</h3>
      <ul class="list">
        {#each project.commitments as commitment}
          <li>
            <strong>{COMMITMENT_LABELS[commitment.type] || commitment.type} {commitment.folio}</strong>
            <span class="amount" style="float:right">{formatCurrency(commitment.amount)}</span>
            <br><span class="small muted">{commitment.supplier} · {formatDate(commitment.date)}</span>
            <div class="badges" style="margin-top:8px"><span class="badge {commitment.status === 'formalized' ? 'green' : 'yellow'}">{COMMITMENT_STATUS_LABELS[commitment.status]}</span></div>
          </li>
        {:else}
          <li class="muted">Sin compromisos vinculados.</li>
        {/each}
      </ul>
    </div>
  </section>

  <section class="grid two" style="margin-top:16px">
    <div class="card">
      <h3>Documentos del proyecto adquisitivo</h3>
      <p class="notice" style="margin-bottom:12px">Consulta solamente. La carga de documentos se realiza en Proyecto adquisitivo después de vincular el ID de inversión.</p>
      <ul class="list">
        {#each project.documents as doc}
          <li><strong>{doc.name}</strong><br><span class="small muted">{doc.type} · {doc.status} · {doc.uploadedIn || 'Proyecto adquisitivo'}{doc.procurementFolio ? ` · ${doc.procurementFolio}` : ''}</span></li>
        {:else}
          <li class="muted">Sin documentos vinculados desde Proyecto adquisitivo.</li>
        {/each}
      </ul>
    </div>

    <div class="card">
      <h3>Timeline del proyecto</h3>
      <div class="timeline">
        {#each project.timeline as event}
          <div class="timeline-item">
            <div class="timeline-date">{formatDate(event.date)}</div>
            <div><strong>{event.title}</strong><br><span class="small muted">{event.description} · {event.user}</span></div>
          </div>
        {/each}
      </div>
    </div>
  </section>
{:else}
  <PageHeader title="Proyecto no encontrado" subtitle="El folio solicitado no existe en los datos mock." />
  <a class="btn" href={`${base}/projects`}>Volver a cartera</a>
{/if}
