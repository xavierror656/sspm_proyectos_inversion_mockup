<script>
  import { base } from '$app/paths';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import { analyzedProjects, projectsStore } from '$lib/projectStore.js';
  import { formatCurrency, formatDate } from '$lib/formatters.js';
  import { MOVEMENT_LABELS } from '$lib/finance.js';

  let projectId = '';
  let movementType = 'increase';
  let amount = 100000;
  let concept = 'Movimiento simulado para revisión de lógica';
  let message = null;

  $: projects = $analyzedProjects;
  $: if (!projectId && projects.length) projectId = projects[0].id;
  $: project = projects.find((item) => item.id === projectId);
  $: signedAmount = movementType === 'decrease' || movementType === 'transfer_out' ? -Math.abs(Number(amount || 0)) : Math.abs(Number(amount || 0));

  function submit() {
    message = projectsStore.addMovement(projectId, { type: movementType, amount: signedAmount, concept });
  }

  function blockedDirectEdit() {
    message = projectsStore.addMovement(projectId, { field: 'currentAmount', amount: 1, concept: 'Intento bloqueado' });
  }
</script>

<PageHeader
  title="Movements / Movimientos"
  subtitle="Simulación de ampliaciones, reducciones y cambios administrativos. El monto vigente se deriva de movimientos."
/>

<section class="grid two">
  <div class="card">
    <h3>Registrar movimiento mock</h3>
    <div class="toolbar">
      <div class="field" style="min-width:100%">
        <label for="movements-project">Proyecto</label>
        <select id="movements-project" class="select" bind:value={projectId}>
          {#each projects as item}<option value={item.id}>{item.internalFolio} · {item.name}</option>{/each}
        </select>
      </div>
      <div class="field">
        <label for="movements-type">Tipo</label>
        <select id="movements-type" class="select" bind:value={movementType}>
          <option value="increase">Ampliación</option>
          <option value="decrease">Reducción</option>
          <option value="adjustment">Ajuste administrativo</option>
        </select>
      </div>
      <div class="field">
        <label for="movements-amount">Monto</label>
        <input id="movements-amount" class="input" type="number" min="1" bind:value={amount} />
      </div>
      <div class="field" style="min-width:100%">
        <label for="movements-concept">Concepto</label>
        <textarea id="movements-concept" class="textarea" bind:value={concept}></textarea>
      </div>
    </div>
    <button class="btn" on:click={submit}>Guardar movimiento demo</button>
    <button class="btn danger" on:click={blockedDirectEdit}>Intentar editar currentAmount</button>
    {#if message}<p class="notice {message.ok ? 'ok' : 'error'}">{message.message}</p>{/if}
    <p class="rule-box">Regla: <strong>currentAmount no se edita directamente</strong>; se recalcula como inicial + movimientos.</p>
  </div>

  {#if project}
    <div class="card">
      <h3>{project.internalFolio}</h3>
      <ul class="list">
        <li>Autorizado inicial: <strong>{formatCurrency(project.initialAuthorizedAmount)}</strong></li>
        <li>Movimientos netos: <strong>{formatCurrency(project.movementsTotal)}</strong></li>
        <li>Monto vigente calculado: <strong>{formatCurrency(project.currentAmount)}</strong></li>
        <li>Comprometido formalizado: <strong>{formatCurrency(project.committedAmount)}</strong></li>
        <li>Remanente: <strong>{formatCurrency(project.remainingBalance)}</strong></li>
      </ul>
    </div>
  {/if}
</section>

<section class="card" style="margin-top:16px">
  <h3>Historial de movimientos</h3>
  <div class="table-wrap">
    <table>
      <thead><tr><th>Proyecto</th><th>Fecha</th><th>Tipo</th><th>Concepto</th><th>Monto</th><th>Usuario</th></tr></thead>
      <tbody>
        {#each projects.flatMap((item) => item.movements.map((movement) => ({ ...movement, project: item }))) as row}
          <tr>
            <td><a href={`${base}/projects/${row.project.id}`}><strong>{row.project.internalFolio}</strong></a></td>
            <td>{formatDate(row.date)}</td>
            <td>{MOVEMENT_LABELS[row.type] || row.type}</td>
            <td>{row.concept}</td>
            <td class="amount">{formatCurrency(row.amount)}</td>
            <td>{row.user}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>
