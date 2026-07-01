<script>
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import { analyzedProjects, projectsStore } from '$lib/projectStore.js';
  import { formatCurrency, formatDate } from '$lib/formatters.js';
  import { STATUS_LABELS, MOVEMENT_LABELS, COMMITMENT_LABELS, COMMITMENT_STATUS_LABELS, SEVERITY_LABELS } from '$lib/finance.js';

  let active = '';
  let message = null;

  let projectForm = {
    name: '',
    fiscalYear: 2026,
    status: 'authorized',
    area: 'Operación Policial',
    manager: '',
    location: '',
    objective: '',
    initialAuthorizedAmount: 1000000,
    isMultiYear: false,
    startDate: '2026-06-29',
    endDate: '2026-12-31'
  };

  let selectedProjectId = '';
  let editProjectId = '';
  let editForm = {};
  let alertForm = { title: '', severity: 'warning', status: 'open', message: '' };
  let eventForm = { title: '', type: 'manual', description: '' };
  let importText = '';
  let bulkText = `name,initialAuthorizedAmount,fiscalYear,area,manager,location,objective,isMultiYear,endDate
Renovación de cascos balísticos,1250000,2026,Recursos Materiales,Jefatura de Equipamiento,Almacén General,Reposición prioritaria de equipo de protección,false,2026-11-30
Mejora de red de comandancias,2750000,2026,Tecnologías SSPM,Dir. Tecnologías,Comandancias Norte y Sur,Actualización de conectividad crítica,true,2027-03-31`;

  $: projects = $analyzedProjects;
  $: if (!selectedProjectId && projects.length) selectedProjectId = projects[0].id;
  $: selectedProject = projects.find((project) => project.id === selectedProjectId);
  $: if (selectedProject && selectedProject.id !== editProjectId) loadEditForm(selectedProject);
  $: totalDocuments = projects.reduce((sum, project) => sum + (project.documents?.length || 0), 0);
  $: bulkPreviewCount = parseDelimited(bulkText).length;

  onMount(() => {
    const hash = window.location.hash.replace('#', '');
    if (['project', 'bulk', 'edit', 'alert', 'timeline', 'database'].includes(hash)) active = hash;
  });

  function closeModal() {
    active = '';
  }

  function loadEditForm(project) {
    editProjectId = project.id;
    editForm = {
      municipalFolio: project.municipalFolio || '',
      name: project.name || '',
      fiscalYear: project.fiscalYear || 2026,
      status: project.status || 'authorized',
      area: project.area || '',
      manager: project.manager || '',
      location: project.location || '',
      objective: project.objective || '',
      initialAuthorizedAmount: project.initialAuthorizedAmount || 0,
      isMultiYear: Boolean(project.isMultiYear),
      startDate: project.startDate || '2026-06-29',
      endDate: project.endDate || ''
    };
  }

  function createProject() {
    message = projectsStore.createProject(projectForm);
    if (message.ok) {
      selectedProjectId = message.id;
      active = 'edit';
      projectForm = {
        ...projectForm,
        name: '',
        manager: '',
        location: '',
        objective: '',
        initialAuthorizedAmount: 1000000
      };
    }
  }

  function updateSelectedProject() {
    if (!selectedProjectId) return;
    message = projectsStore.updateProject(selectedProjectId, editForm);
  }

  function deleteSelectedProject() {
    if (!selectedProject) return;
    if (confirm(`Eliminar ${selectedProject.internalFolio} de la base local?`)) {
      message = projectsStore.deleteProject(selectedProjectId);
      selectedProjectId = projects[0]?.id || '';
      editProjectId = '';
    }
  }

  function addAlert() {
    message = projectsStore.addAlert(selectedProjectId, alertForm);
    if (message.ok) {
      alertForm = { title: '', severity: 'warning', status: 'open', message: '' };
      closeModal();
    }
  }

  function addEvent() {
    message = projectsStore.addTimelineEvent(selectedProjectId, eventForm);
    if (message.ok) {
      eventForm = { title: '', type: 'manual', description: '' };
      closeModal();
    }
  }

  function deleteItem(collection, item) {
    if (!selectedProject) return;
    if (confirm('Eliminar este elemento de la base local?')) {
      message = projectsStore.deleteProjectItem(selectedProject.id, collection, item.id);
    }
  }

  function resetSeed() {
    if (confirm('Restablecer la base local a la semilla original?')) {
      message = projectsStore.resetSeed();
      selectedProjectId = '';
      editProjectId = '';
    }
  }

  function clearAll() {
    if (confirm('Esto vaciará la base local del navegador. ¿Continuar?')) {
      message = projectsStore.clearAll();
      selectedProjectId = '';
      editProjectId = '';
    }
  }

  function exportJson() {
    const payload = {
      exportedAt: new Date().toISOString(),
      app: 'Investment Portfolio SSPM',
      storageKey: 'sspm-investment-portfolio:v1',
      projects: get(projectsStore)
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sspm-investment-portfolio-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    message = { ok: true, message: 'Base local exportada como JSON.' };
  }

  function csvEscape(value) {
    const text = String(value ?? '');
    return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  }

  function parseDelimited(text) {
    const rows = [];
    let row = [];
    let cell = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const next = text[i + 1];
      if (char === '"' && inQuotes && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if ((char === ',' || char === '\t') && !inQuotes) {
        row.push(cell.trim());
        cell = '';
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && next === '\n') i += 1;
        row.push(cell.trim());
        if (row.some(Boolean)) rows.push(row);
        row = [];
        cell = '';
      } else {
        cell += char;
      }
    }
    row.push(cell.trim());
    if (row.some(Boolean)) rows.push(row);
    if (rows.length < 2) return [];
    const headers = rows[0].map((header) => header.trim());
    return rows.slice(1).map((values) =>
      Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']))
    );
  }

  function downloadTemplate() {
    const headers = ['name', 'initialAuthorizedAmount', 'fiscalYear', 'area', 'manager', 'location', 'objective', 'isMultiYear', 'endDate'];
    const example = ['Proyecto ejemplo', 1000000, 2026, 'Operación Policial', 'Responsable', 'Ubicación', 'Objetivo del proyecto', false, '2026-12-31'];
    const csv = `${headers.join(',')}\n${example.map(csvEscape).join(',')}\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plantilla-cartera-proyectos.csv';
    link.click();
    URL.revokeObjectURL(url);
    message = { ok: true, message: 'Plantilla CSV descargada. Se abre en Excel y respeta el flujo sin documentos en cartera.' };
  }

  function importBulkTemplate() {
    const rows = parseDelimited(bulkText);
    message = projectsStore.createProjectsFromTemplate(rows);
    if (message.ok) {
      selectedProjectId = '';
      editProjectId = '';
      active = 'edit';
    }
  }

  function importBulkFile(event) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      bulkText = String(reader.result || '');
      importBulkTemplate();
      event.currentTarget.value = '';
    };
    reader.readAsText(file);
  }

  function importFromText() {
    try {
      const parsed = JSON.parse(importText);
      const projectsToImport = Array.isArray(parsed) ? parsed : parsed.projects;
      message = projectsStore.replaceAll(projectsToImport);
      if (message.ok) {
        selectedProjectId = '';
        editProjectId = '';
        importText = '';
      }
    } catch (error) {
      message = { ok: false, message: `JSON inválido: ${error.message}` };
    }
  }

  function importFromFile(event) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      importText = String(reader.result || '');
      importFromText();
      event.currentTarget.value = '';
    };
    reader.readAsText(file);
  }
</script>

<PageHeader
  title="Cartera de proyectos / Captura local"
  subtitle="Acciones en modales: alta manual, carga masiva por plantilla y administración local sin documentos incrustados."
/>

<span id="project" class="anchor-target" aria-hidden="true"></span>
<span id="bulk" class="anchor-target" aria-hidden="true"></span>
<span id="database" class="anchor-target" aria-hidden="true"></span>

<section class="grid two">
  <div class="card flow-card">
    <h3>Regla de captura para el demo</h3>
    <p>La cartera solo administra el proyecto de inversión: datos generales, monto autorizado y seguimiento financiero. La evidencia documental vive en el flujo de <strong>Proyecto adquisitivo</strong>.</p>
    <div class="workflow-steps" style="margin-top:12px">
      <div class="workflow-step active"><span>1</span><strong>Cartera</strong><p>Alta manual o plantilla Excel/CSV. Sin adjuntar documentos.</p></div>
      <div class="workflow-step"><span>2</span><strong>Adquisiciones</strong><p>Se captura el ID de inversión y ahí se suben documentos.</p></div>
      <div class="workflow-step"><span>3</span><strong>Formalización</strong><p>Cuando se formaliza allá, cartera pasa a formalizado.</p></div>
    </div>
  </div>

  <div class="card">
    <h3>Estado de captura</h3>
    {#if message}<p class="notice {message.ok ? 'ok' : 'error'}">{message.message}</p>{/if}
    <ul class="list">
      <li>Proyectos locales: <strong>{projects.length}</strong></li>
      <li>Documentos vinculados desde adquisiciones: <strong>{totalDocuments}</strong></li>
      <li>Base local: <strong>localStorage</strong> · <code>sspm-investment-portfolio:v1</code></li>
      {#if selectedProject}
        <li>Proyecto activo: <strong>{selectedProject.internalFolio}</strong><br><span class="small muted">{selectedProject.name}</span></li>
      {:else}
        <li>No hay proyecto seleccionado.</li>
      {/if}
    </ul>
  </div>
</section>

<section class="card" style="margin-top:16px">
  <div class="split-header">
    <div>
      <h3>Acciones rápidas</h3>
      <p class="muted">Nada queda incrustado: el usuario abre solo el formulario que necesita.</p>
    </div>
  </div>
  <div class="action-grid" style="margin-top:12px">
    <button class="action-card" type="button" on:click={() => active = 'project'}><strong>Crear proyecto</strong><span>Alta manual en cartera sin documentos.</span></button>
    <button class="action-card" type="button" on:click={() => active = 'bulk'}><strong>Carga masiva Excel</strong><span>Importar plantilla CSV/Excel para nuevos proyectos.</span></button>
    <button class="action-card" type="button" on:click={() => active = 'edit'}><strong>Editar / eliminar</strong><span>Actualizar datos generales del proyecto.</span></button>
    <button class="action-card" type="button" on:click={() => active = 'alert'}><strong>Alerta</strong><span>Registrar riesgo o nota de seguimiento.</span></button>
    <button class="action-card" type="button" on:click={() => active = 'timeline'}><strong>Timeline</strong><span>Agregar evento manual al historial.</span></button>
    <button class="action-card" type="button" on:click={() => active = 'database'}><strong>Base local</strong><span>Exportar/importar JSON y limpiar datos demo.</span></button>
  </div>
  <p class="notice" style="margin-top:14px">Para subir documentos vaya a <strong>Proyecto adquisitivo</strong>, capture el ID de inversión y registre ahí los archivos.</p>
</section>

<Modal open={active === 'project'} title="Crear proyecto de inversión" subtitle="Alta manual en cartera. No se adjuntan documentos en este flujo." size="lg" on:close={closeModal}>
  <div class="grid two">
    <div class="field"><label for="project-name">Nombre del proyecto</label><input id="project-name" class="input" bind:value={projectForm.name} placeholder="Ej. Renovación de equipo táctico" /></div>
    <div class="field"><label for="project-amount">Monto autorizado inicial</label><input id="project-amount" class="input" type="number" min="1" bind:value={projectForm.initialAuthorizedAmount} /></div>
    <div class="field"><label for="project-year">Ejercicio fiscal</label><input id="project-year" class="input" type="number" bind:value={projectForm.fiscalYear} /></div>
    <div class="field"><label for="project-status">Estado</label><select id="project-status" class="select" bind:value={projectForm.status}>{#each Object.entries(STATUS_LABELS) as [key, label]}<option value={key}>{label}</option>{/each}</select></div>
    <div class="field"><label for="project-area">Área</label><input id="project-area" class="input" bind:value={projectForm.area} /></div>
    <div class="field"><label for="project-manager">Responsable</label><input id="project-manager" class="input" bind:value={projectForm.manager} /></div>
    <div class="field"><label for="project-location">Ubicación</label><input id="project-location" class="input" bind:value={projectForm.location} /></div>
    <div class="field"><label for="project-end">Fecha término</label><input id="project-end" class="input" type="date" bind:value={projectForm.endDate} /></div>
    <div class="field" style="min-width:100%"><label for="project-objective">Objetivo</label><textarea id="project-objective" class="textarea" bind:value={projectForm.objective}></textarea></div>
    <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" bind:checked={projectForm.isMultiYear} /> Proyecto plurianual</label>
  </div>
  <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap"><button class="btn" on:click={createProject}>Crear proyecto local</button><button class="btn secondary" on:click={closeModal}>Cancelar</button></div>
</Modal>

<Modal open={active === 'bulk'} title="Carga masiva Excel/CSV" subtitle="Crea nuevos proyectos por plantilla; la plantilla no contiene documentos." size="lg" on:close={closeModal}>
  <section class="grid two">
    <div>
      <h3>Plantilla de carga</h3>
      <p class="notice">Pega o importa CSV. Excel puede abrir la plantilla descargada. Filas detectadas: <strong>{bulkPreviewCount}</strong>.</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin:12px 0">
        <button class="btn secondary" on:click={downloadTemplate}>Descargar plantilla</button>
        <label class="btn secondary" for="bulk-file" style="cursor:pointer">Importar CSV</label>
        <input id="bulk-file" type="file" accept=".csv,.txt,text/csv" on:change={importBulkFile} style="display:none" />
        <button class="btn" on:click={importBulkTemplate}>Crear proyectos</button>
      </div>
      <div class="field"><label for="bulk-template">Contenido de plantilla</label><textarea id="bulk-template" class="textarea" bind:value={bulkText} style="min-height:240px"></textarea></div>
    </div>
    <div>
      <h3>Columnas esperadas</h3>
      <ul class="list">
        <li><strong>name</strong> · Nombre del proyecto de inversión.</li>
        <li><strong>initialAuthorizedAmount</strong> · Monto autorizado inicial.</li>
        <li><strong>fiscalYear</strong>, <strong>area</strong>, <strong>manager</strong>, <strong>location</strong>, <strong>objective</strong>.</li>
        <li><strong>isMultiYear</strong> y <strong>endDate</strong> para plurianualidad y vencimientos.</li>
      </ul>
      <p class="rule-box" style="margin-top:12px">Después de importar, el usuario copia el ID <code>CART-0000-2026</code> al Proyecto adquisitivo. Esa vinculación mueve la cartera a comprometido.</p>
    </div>
  </section>
</Modal>

<Modal open={active === 'edit'} title="Editar o eliminar proyecto" subtitle="Datos generales de cartera. El monto vigente se calcula por movimientos." size="lg" on:close={closeModal}>
  <div class="field" style="margin-bottom:14px">
    <label for="edit-project-select">Proyecto</label>
    <select id="edit-project-select" class="select" bind:value={selectedProjectId} disabled={!projects.length}>{#each projects as project}<option value={project.id}>{project.internalFolio} · {project.name}</option>{/each}</select>
  </div>
  {#if selectedProject}
    <div class="grid two">
      <div class="field"><label for="edit-municipal">Folio municipal</label><input id="edit-municipal" class="input" bind:value={editForm.municipalFolio} /></div>
      <div class="field"><label for="edit-name">Nombre</label><input id="edit-name" class="input" bind:value={editForm.name} /></div>
      <div class="field"><label for="edit-initial">Monto autorizado inicial</label><input id="edit-initial" class="input" type="number" min="1" bind:value={editForm.initialAuthorizedAmount} /></div>
      <div class="field"><label for="edit-status">Estado</label><select id="edit-status" class="select" bind:value={editForm.status}>{#each Object.entries(STATUS_LABELS) as [key, label]}<option value={key}>{label}</option>{/each}</select></div>
      <div class="field"><label for="edit-area">Área</label><input id="edit-area" class="input" bind:value={editForm.area} /></div>
      <div class="field"><label for="edit-manager">Responsable</label><input id="edit-manager" class="input" bind:value={editForm.manager} /></div>
      <div class="field"><label for="edit-location">Ubicación</label><input id="edit-location" class="input" bind:value={editForm.location} /></div>
      <div class="field"><label for="edit-end">Fecha término</label><input id="edit-end" class="input" type="date" bind:value={editForm.endDate} /></div>
      <div class="field" style="min-width:100%"><label for="edit-objective">Objetivo</label><textarea id="edit-objective" class="textarea" bind:value={editForm.objective}></textarea></div>
      <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" bind:checked={editForm.isMultiYear} /> Proyecto plurianual</label>
    </div>
    <div class="notice" style="margin-top:12px">Regla: no se puede editar <code>currentAmount</code>. El monto vigente se recalcula como monto inicial + movimientos.</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px"><button class="btn" on:click={updateSelectedProject}>Guardar cambios</button><button class="btn danger" on:click={deleteSelectedProject}>Eliminar proyecto</button></div>
  {:else}
    <p class="notice">No hay proyectos para editar.</p>
  {/if}
</Modal>

<Modal open={active === 'alert'} title="Registrar alerta" subtitle="Captura rápida de riesgo o aviso para un proyecto." size="md" on:close={closeModal}>
  <div class="field" style="margin-bottom:14px"><label for="alert-project">Proyecto</label><select id="alert-project" class="select" bind:value={selectedProjectId} disabled={!projects.length}>{#each projects as project}<option value={project.id}>{project.internalFolio} · {project.name}</option>{/each}</select></div>
  {#if selectedProject}
    <div class="grid two">
      <div class="field"><label for="alert-title">Título</label><input id="alert-title" class="input" bind:value={alertForm.title} placeholder="Ej. Remanente alto" /></div>
      <div class="field"><label for="alert-severity-form">Severidad</label><select id="alert-severity-form" class="select" bind:value={alertForm.severity}><option value="info">Informativa</option><option value="warning">Advertencia</option><option value="critical">Crítica</option></select></div>
      <div class="field" style="min-width:100%"><label for="alert-message">Mensaje</label><textarea id="alert-message" class="textarea" bind:value={alertForm.message}></textarea></div>
    </div>
    <div style="margin-top:14px"><button class="btn" on:click={addAlert}>Agregar alerta</button></div>
  {:else}
    <p class="notice">Primero cree o importe un proyecto.</p>
  {/if}
</Modal>

<Modal open={active === 'timeline'} title="Agregar evento al timeline" subtitle="Captura una nota de seguimiento sin salir de la pantalla." size="md" on:close={closeModal}>
  <div class="field" style="margin-bottom:14px"><label for="event-project">Proyecto</label><select id="event-project" class="select" bind:value={selectedProjectId} disabled={!projects.length}>{#each projects as project}<option value={project.id}>{project.internalFolio} · {project.name}</option>{/each}</select></div>
  {#if selectedProject}
    <div class="grid two">
      <div class="field"><label for="event-title">Título evento</label><input id="event-title" class="input" bind:value={eventForm.title} placeholder="Ej. Revisión con Dirección" /></div>
      <div class="field"><label for="event-type">Tipo</label><select id="event-type" class="select" bind:value={eventForm.type}><option value="manual">Manual</option><option value="analysis">Análisis</option><option value="meeting">Reunión</option><option value="validation">Validación</option></select></div>
      <div class="field" style="min-width:100%"><label for="event-description">Descripción</label><textarea id="event-description" class="textarea" bind:value={eventForm.description}></textarea></div>
    </div>
    <div style="margin-top:14px"><button class="btn" on:click={addEvent}>Agregar evento</button></div>
  {:else}
    <p class="notice">Primero cree o importe un proyecto.</p>
  {/if}
</Modal>

<Modal open={active === 'database'} title="Base local" subtitle="Respaldo JSON, restauración y limpieza de datos demo." size="lg" on:close={closeModal}>
  <section class="grid two">
    <div>
      <h3>Exportar / importar JSON</h3>
      <p class="notice">La exportación genera un JSON de respaldo. Puede incluir documentos históricos; la carga nueva de documentos debe hacerse desde Proyecto adquisitivo.</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin:12px 0"><button class="btn" on:click={exportJson}>Exportar JSON</button><label class="btn secondary" for="import-file" style="cursor:pointer">Importar archivo</label><input id="import-file" type="file" accept="application/json,.json" on:change={importFromFile} style="display:none" /></div>
      <div class="field"><label for="import-text">Pegar JSON</label><textarea id="import-text" class="textarea" bind:value={importText} style="min-height:180px" placeholder="Pega aquí el JSON exportado..."></textarea></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px"><button class="btn" on:click={importFromText}>Importar texto JSON</button><button class="btn secondary" on:click={resetSeed}>Restablecer semilla</button><button class="btn danger" on:click={clearAll}>Vaciar base local</button></div>
    </div>
    <div>
      <h3>Elementos del proyecto activo</h3>
      {#if selectedProject}
        <div class="field" style="margin-bottom:12px"><label for="delete-project-select">Proyecto</label><select id="delete-project-select" class="select" bind:value={selectedProjectId}>{#each projects as project}<option value={project.id}>{project.internalFolio} · {project.name}</option>{/each}</select></div>
        <ul class="list"><li>Movimientos: <strong>{selectedProject.movements.length}</strong></li><li>Compromisos: <strong>{selectedProject.commitments.length}</strong></li><li>Documentos de proyecto adquisitivo: <strong>{selectedProject.documents.length}</strong></li><li>Alertas: <strong>{selectedProject.alerts.length}</strong></li><li>Timeline: <strong>{selectedProject.timeline.length}</strong></li></ul>
      {:else}
        <p class="notice">No hay proyecto seleccionado.</p>
      {/if}
    </div>
  </section>
  {#if selectedProject}
    <div class="grid two" style="margin-top:16px">
      <div><h3>Movimientos</h3><ul class="list">{#each selectedProject.movements as item}<li><strong>{MOVEMENT_LABELS[item.type] || item.type}</strong> · {formatCurrency(item.amount)}<br /><span class="small muted">{formatDate(item.date)} · {item.concept}</span><div style="margin-top:8px"><button class="btn danger" on:click={() => deleteItem('movements', item)}>Eliminar</button></div></li>{:else}<li>Sin movimientos.</li>{/each}</ul></div>
      <div><h3>Compromisos</h3><ul class="list">{#each selectedProject.commitments as item}<li><strong>{COMMITMENT_LABELS[item.type] || item.type} {item.folio}</strong> · {formatCurrency(item.amount)}<br /><span class="small muted">{item.supplier} · {COMMITMENT_STATUS_LABELS[item.status]}</span><div style="margin-top:8px"><button class="btn danger" on:click={() => deleteItem('commitments', item)}>Eliminar</button></div></li>{:else}<li>Sin compromisos.</li>{/each}</ul></div>
      <div><h3>Documentos de proyecto adquisitivo</h3><ul class="list">{#each selectedProject.documents as item}<li><strong>{item.name}</strong><br /><span class="small muted">{item.type} · {item.status}</span><div style="margin-top:8px"><button class="btn danger" on:click={() => deleteItem('documents', item)}>Eliminar</button></div></li>{:else}<li>Sin documentos.</li>{/each}</ul></div>
      <div><h3>Alertas</h3><ul class="list">{#each selectedProject.alerts as item}<li><strong>{item.title}</strong><br /><span class="small muted">{SEVERITY_LABELS[item.severity] || item.severity} · {item.status}</span><div style="margin-top:8px"><button class="btn danger" on:click={() => deleteItem('alerts', item)}>Eliminar</button></div></li>{:else}<li>Sin alertas.</li>{/each}</ul></div>
      <div><h3>Timeline</h3><ul class="list">{#each selectedProject.timeline as item}<li><strong>{item.title}</strong><br /><span class="small muted">{formatDate(item.date)} · {item.description}</span><div style="margin-top:8px"><button class="btn danger" on:click={() => deleteItem('timeline', item)}>Eliminar</button></div></li>{:else}<li>Sin eventos.</li>{/each}</ul></div>
    </div>
  {/if}
</Modal>
