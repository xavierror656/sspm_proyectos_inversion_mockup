<script>
  import PageHeader from '$lib/components/PageHeader.svelte';
  import { analyzedProjects, projectsStore } from '$lib/projectStore.js';
  import { formatCurrency } from '$lib/formatters.js';

  let sourceId = '';
  let destinationId = '';
  let amount = 250000;
  let concept = 'Reasignación mock de remanente disponible';
  let message = null;

  $: projects = $analyzedProjects;
  $: if (!sourceId && projects.length) sourceId = projects[0].id;
  $: if (!destinationId && projects.length > 1) destinationId = projects[1].id;
  $: source = projects.find((project) => project.id === sourceId);
  $: destination = projects.find((project) => project.id === destinationId);

  function submit() {
    message = projectsStore.redistribute(sourceId, destinationId, amount, concept);
  }

  function exceed() {
    if (source) amount = Math.max(1, Math.round(source.remainingBalance + 100000));
    message = null;
  }
</script>

<PageHeader
  title="Redistributions / Redistribuciones"
  subtitle="Validación mock para definir destino de remanentes sin exceder saldo disponible."
/>

<section class="grid two">
  <div class="card">
    <h3>Crear redistribución simulada</h3>
    <div class="toolbar">
      <div class="field" style="min-width:100%">
        <label for="redistribution-source">Proyecto origen</label>
        <select id="redistribution-source" class="select" bind:value={sourceId}>
          {#each projects as project}<option value={project.id}>{project.internalFolio} · Remanente {formatCurrency(project.remainingBalance)}</option>{/each}
        </select>
      </div>
      <div class="field" style="min-width:100%">
        <label for="redistribution-destination">Proyecto destino</label>
        <select id="redistribution-destination" class="select" bind:value={destinationId}>
          {#each projects as project}<option value={project.id}>{project.internalFolio} · {project.name}</option>{/each}
        </select>
      </div>
      <div class="field">
        <label for="redistribution-amount">Monto a redistribuir</label>
        <input id="redistribution-amount" class="input" type="number" min="1" bind:value={amount} />
      </div>
      <div class="field" style="min-width:100%">
        <label for="redistribution-concept">Concepto</label>
        <textarea id="redistribution-concept" class="textarea" bind:value={concept}></textarea>
      </div>
    </div>
    <button class="btn" on:click={submit}>Aplicar redistribución demo</button>
    <button class="btn warning" on:click={exceed}>Probar monto excedido</button>
    {#if message}<p class="notice {message.ok ? 'ok' : 'error'}">{message.message}</p>{/if}
    <p class="rule-box">Regla: la redistribución <strong>no puede exceder remainingBalance</strong>. Se registra como reducción en origen y ampliación en destino.</p>
  </div>

  <div class="card">
    <h3>Validación de remanente</h3>
    {#if source}
      <ul class="list">
        <li>Origen: <strong>{source.internalFolio}</strong></li>
        <li>Monto vigente: <strong>{formatCurrency(source.currentAmount)}</strong></li>
        <li>Comprometido: <strong>{formatCurrency(source.committedAmount)}</strong></li>
        <li>Remanente disponible: <strong>{formatCurrency(source.remainingBalance)}</strong></li>
        <li>Monto capturado: <strong>{formatCurrency(amount)}</strong></li>
      </ul>
      {#if Number(amount) > source.remainingBalance}
        <p class="notice error">El monto capturado excede el remanente. La acción será rechazada.</p>
      {:else}
        <p class="notice ok">El monto está dentro del remanente disponible.</p>
      {/if}
    {/if}
  </div>
</section>

<section class="card" style="margin-top:16px">
  <h3>Proyectos con remanente pendiente</h3>
  <div class="table-wrap">
    <table>
      <thead><tr><th>Folio</th><th>Proyecto</th><th>Vigente</th><th>Comprometido</th><th>Remanente</th><th>Estado analítico</th></tr></thead>
      <tbody>
        {#each projects.filter((project) => project.remainingBalance > 0) as project}
          <tr>
            <td><strong>{project.internalFolio}</strong></td>
            <td>{project.name}</td>
            <td class="amount">{formatCurrency(project.currentAmount)}</td>
            <td class="amount">{formatCurrency(project.committedAmount)}</td>
            <td class="amount">{formatCurrency(project.remainingBalance)}</td>
            <td>{project.pendingBalance ? 'Requiere definición' : 'Remanente menor'}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>
