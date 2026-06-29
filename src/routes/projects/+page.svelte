<script>
  import { base } from '$app/paths';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import TrafficBadge from '$lib/components/TrafficBadge.svelte';
  import { analyzedProjects } from '$lib/projectStore.js';
  import { formatCurrency, formatPercent } from '$lib/formatters.js';
  import { STATUS_LABELS } from '$lib/finance.js';

  let search = '';
  let status = 'all';
  let traffic = 'all';
  let area = 'all';

  $: projects = $analyzedProjects;
  $: areas = [...new Set(projects.map((project) => project.area))];
  $: filtered = projects.filter((project) => {
    const text = `${project.internalFolio} ${project.name} ${project.area}`.toLowerCase();
    return (!search || text.includes(search.toLowerCase()))
      && (status === 'all' || project.status === status)
      && (traffic === 'all' || project.trafficLight === traffic)
      && (area === 'all' || project.area === area);
  });
</script>

<PageHeader
  title="Investment Projects / Cartera de Proyectos"
  subtitle="Tabla filtrable de proyectos de inversión con cálculos financieros derivados de datos mock locales."
/>

<div class="card">
  <div class="toolbar">
    <div class="field">
      <label for="projects-search">Buscar</label>
      <input id="projects-search" class="input" bind:value={search} placeholder="Folio, proyecto o área" />
    </div>
    <div class="field">
      <label for="projects-status">Estado</label>
      <select id="projects-status" class="select" bind:value={status}>
        <option value="all">Todos</option>
        {#each Object.entries(STATUS_LABELS) as [key, label]}
          <option value={key}>{label}</option>
        {/each}
      </select>
    </div>
    <div class="field">
      <label for="projects-traffic">Semáforo</label>
      <select id="projects-traffic" class="select" bind:value={traffic}>
        <option value="all">Todos</option>
        <option value="green">Verde</option>
        <option value="yellow">Amarillo</option>
        <option value="red">Rojo</option>
        <option value="blue">Azul</option>
        <option value="gray">Gris</option>
      </select>
    </div>
    <div class="field">
      <label for="projects-area">Área</label>
      <select id="projects-area" class="select" bind:value={area}>
        <option value="all">Todas</option>
        {#each areas as item}<option value={item}>{item}</option>{/each}
      </select>
    </div>
  </div>

  <div class="notice">Mostrando {filtered.length} de {projects.length} proyectos. Los montos vigentes se recalculan con movimientos; no son editables directamente.</div>

  <div class="table-wrap" style="margin-top:14px">
    <table>
      <thead>
        <tr>
          <th>Folio</th>
          <th>Proyecto</th>
          <th>Estado</th>
          <th>Vigente</th>
          <th>Comprometido</th>
          <th>Remanente</th>
          <th>Avance</th>
          <th>Semáforo / badges</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {#each filtered as project}
          <tr>
            <td><strong>{project.internalFolio}</strong><br><span class="small muted">{project.municipalFolio}</span></td>
            <td>{project.name}<br><span class="small muted">{project.area}</span></td>
            <td><span class="badge gray">{project.statusLabel}</span></td>
            <td class="amount">{formatCurrency(project.currentAmount)}</td>
            <td class="amount">{formatCurrency(project.committedAmount)}</td>
            <td class="amount">{formatCurrency(project.remainingBalance)}</td>
            <td style="min-width:140px"><strong>{formatPercent(project.executionPercentage)}</strong><ProgressBar value={project.executionPercentage} tone={project.trafficLight} /></td>
            <td>
              <div class="badges">
                <TrafficBadge color={project.trafficLight} label={project.trafficLabel} reason={project.trafficReason} />
                {#each project.analyticTags.slice(0, 3) as tag}
                  <span class="badge {tag.tone}">{tag.label}</span>
                {/each}
              </div>
            </td>
            <td><a class="btn ghost" href={`${base}/projects/${project.id}`}>Detalle</a></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
