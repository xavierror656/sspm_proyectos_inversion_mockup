<script>
  import { base } from '$app/paths';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import { analyzedProjects, projectsStore } from '$lib/projectStore.js';
  import { formatCurrency, formatDate } from '$lib/formatters.js';
  import { COMMITMENT_LABELS, COMMITMENT_STATUS_LABELS } from '$lib/finance.js';

  let projectId = '';
  let message = null;
  let form = { type: 'requisition', folio: '', supplier: '', amount: 500000, status: 'draft' };

  $: projects = $analyzedProjects;
  $: if (!projectId && projects.length) projectId = projects[0].id;
  $: project = projects.find((item) => item.id === projectId);
  $: rows = projects.flatMap((item) => item.commitments.map((commitment) => ({ ...commitment, project: item })));

  function formalize(row) {
    message = projectsStore.formalizeCommitment(row.project.id, row.id);
  }

  function addCommitment() {
    message = projectsStore.addMockCommitment(projectId, { ...form });
    if (message.ok) form = { type: 'requisition', folio: '', supplier: '', amount: 500000, status: 'draft' };
  }
</script>

<PageHeader
  title="Financial Commitments / Compromisos de Compras"
  subtitle="Requisiciones, contratos y pedidos mock. Solo estado formalizado afecta committedAmount."
/>

<section class="grid two">
  <div class="card">
    <h3>Simulación de compromiso</h3>
    <div class="field">
      <label for="commitments-project">Proyecto</label>
      <select id="commitments-project" class="select" bind:value={projectId}>
        {#each projects as item}<option value={item.id}>{item.internalFolio} · {item.name}</option>{/each}
      </select>
    </div>
    <div class="grid two" style="margin-top:12px">
      <div class="field">
        <label for="commitment-type">Tipo</label>
        <select id="commitment-type" class="select" bind:value={form.type}>
          <option value="requisition">Requisición</option>
          <option value="contract">Contrato</option>
          <option value="purchase_order">Pedido</option>
        </select>
      </div>
      <div class="field">
        <label for="commitment-folio">Folio</label>
        <input id="commitment-folio" class="input" bind:value={form.folio} placeholder="Ej. REQ-2026-0500" />
      </div>
      <div class="field">
        <label for="commitment-supplier">Proveedor</label>
        <input id="commitment-supplier" class="input" bind:value={form.supplier} placeholder="Nombre del proveedor" />
      </div>
      <div class="field">
        <label for="commitment-amount">Monto</label>
        <input id="commitment-amount" class="input" type="number" min="1" bind:value={form.amount} />
      </div>
      <div class="field">
        <label for="commitment-status">Estado inicial</label>
        <select id="commitment-status" class="select" bind:value={form.status}>
          <option value="draft">Borrador</option>
          <option value="in_review">En revisión</option>
          <option value="formalized">Formalizado</option>
        </select>
      </div>
    </div>
    <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn" on:click={addCommitment}>Agregar compromiso</button>
    </div>
    {#if message}<p class="notice {message.ok ? 'ok' : 'error'}">{message.message}</p>{/if}
    <p class="rule-box">Regla: un compromiso en borrador o revisión <strong>no afecta</strong> committedAmount hasta ser formalizado.</p>
  </div>
  {#if project}
    <div class="card">
      <h3>Impacto financiero</h3>
      <ul class="list">
        <li>Monto vigente: <strong>{formatCurrency(project.currentAmount)}</strong></li>
        <li>Comprometido formalizado: <strong>{formatCurrency(project.committedAmount)}</strong></li>
        <li>Remanente: <strong>{formatCurrency(project.remainingBalance)}</strong></li>
        <li>Referencias compra: <strong>{project.procurementReferences}</strong></li>
      </ul>
    </div>
  {/if}
</section>

<section class="card" style="margin-top:16px">
  <h3>Listado de requisiciones, contratos y pedidos</h3>
  <div class="table-wrap">
    <table>
      <thead><tr><th>Proyecto</th><th>Tipo</th><th>Folio</th><th>Proveedor</th><th>Monto</th><th>Estado</th><th>Fecha</th><th>Acción</th></tr></thead>
      <tbody>
        {#each rows as row}
          <tr>
            <td><a href={`${base}/projects/${row.project.id}`}><strong>{row.project.internalFolio}</strong></a><br><span class="small muted">{row.project.name}</span></td>
            <td>{COMMITMENT_LABELS[row.type] || row.type}</td>
            <td><strong>{row.folio}</strong></td>
            <td>{row.supplier}</td>
            <td class="amount">{formatCurrency(row.amount)}</td>
            <td><span class="badge {row.status === 'formalized' ? 'green' : row.status === 'canceled' ? 'gray' : 'yellow'}">{COMMITMENT_STATUS_LABELS[row.status]}</span></td>
            <td>{formatDate(row.date)}</td>
            <td>
              {#if row.status !== 'formalized'}
                <button class="btn secondary" on:click={() => formalize(row)}>Formalizar</button>
              {:else}
                <span class="muted">Afecta cálculo</span>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>
