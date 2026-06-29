<script>
  import PageHeader from '$lib/components/PageHeader.svelte';
  import { analyzedProjects, projectsStore } from '$lib/projectStore.js';
  import { formatCurrency, formatDate } from '$lib/formatters.js';
  import { STATUS_LABELS, MOVEMENT_LABELS, COMMITMENT_LABELS, COMMITMENT_STATUS_LABELS, SEVERITY_LABELS } from '$lib/finance.js';
  import { get } from 'svelte/store';

  let active = 'project';
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
  let docForm = { name: '', type: 'PDF', status: 'Cargado' };
  let alertForm = { title: '', severity: 'warning', status: 'open', message: '' };
  let eventForm = { title: '', type: 'manual', description: '' };
  let importText = '';

  $: projects = $analyzedProjects;
  $: if (!selectedProjectId && projects.length) selectedProjectId = projects[0].id;
  $: selectedProject = projects.find((project) => project.id === selectedProjectId);
  $: if (selectedProject && selectedProject.id !== editProjectId) loadEditForm(selectedProject);

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

  function addDocument() {
    message = projectsStore.addDocument(selectedProjectId, docForm);
    if (message.ok) docForm = { name: '', type: 'PDF', status: 'Cargado' };
  }

  function addAlert() {
    message = projectsStore.addAlert(selectedProjectId, alertForm);
    if (message.ok) alertForm = { title: '', severity: 'warning', status: 'open', message: '' };
  }

  function addEvent() {
    message = projectsStore.addTimelineEvent(selectedProjectId, eventForm);
    if (message.ok) eventForm = { title: '', type: 'manual', description: '' };
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
  title="Captura y administración local"
  subtitle="Formularios front-only para crear, editar, eliminar, importar y exportar la base local del navegador."
/>

<section class="grid two">
  <div class="card">
    <h3>Base local recomendada</h3>
    <p>Para este mock recomiendo <strong>localStorage</strong>: persiste datos al recargar, no requiere servidor y permite validar flujos con usuarios.</p>
    <ul class="list">
      <li><strong>Uso actual:</strong> datos guardados en el navegador con llave <code>sspm-investment-portfolio:v1</code>.</li>
      <li><strong>Ventaja:</strong> rápido, simple y suficiente para demo con stakeholders.</li>
      <li><strong>Límite:</strong> no reemplaza PostgreSQL ni backend; cada navegador tiene su propia copia.</li>
      <li><strong>Escala futura:</strong> si se necesita más capacidad offline, migrar a IndexedDB/Dexie.</li>
    </ul>
  </div>

  <div class="card">
    <h3>Estado de captura</h3>
    {#if message}<p class="notice {message.ok ? 'ok' : 'error'}">{message.message}</p>{/if}
    <ul class="list">
      <li>Proyectos locales: <strong>{projects.length}</strong></li>
      {#if selectedProject}
        <li>Proyecto activo: <strong>{selectedProject.internalFolio}</strong> · {selectedProject.name}</li>
        <li>Vigente calculado: <strong>{formatCurrency(selectedProject.currentAmount)}</strong></li>
        <li>Remanente: <strong>{formatCurrency(selectedProject.remainingBalance)}</strong></li>
      {:else}
        <li>No hay proyecto seleccionado.</li>
      {/if}
    </ul>
  </div>
</section>

<section class="card" style="margin-top:16px">
  <h3>Tipo de operación</h3>
  <div class="toolbar">
    <button class="btn {active === 'project' ? '' : 'secondary'}" on:click={() => active = 'project'}>Crear proyecto</button>
    <button class="btn {active === 'edit' ? '' : 'secondary'}" on:click={() => active = 'edit'}>Editar / eliminar</button>
    <button class="btn {active === 'document' ? '' : 'secondary'}" on:click={() => active = 'document'}>Documento</button>
    <button class="btn {active === 'alert' ? '' : 'secondary'}" on:click={() => active = 'alert'}>Alerta</button>
    <button class="btn {active === 'timeline' ? '' : 'secondary'}" on:click={() => active = 'timeline'}>Timeline</button>
    <button class="btn {active === 'database' ? '' : 'secondary'}" on:click={() => active = 'database'}>Importar / exportar</button>
  </div>

  {#if active === 'project'}
    <div class="grid two">
      <div class="field">
        <label for="project-name">Nombre del proyecto</label>
        <input id="project-name" class="input" bind:value={projectForm.name} placeholder="Ej. Renovación de equipo táctico" />
      </div>
      <div class="field">
        <label for="project-amount">Monto autorizado inicial</label>
        <input id="project-amount" class="input" type="number" min="1" bind:value={projectForm.initialAuthorizedAmount} />
      </div>
      <div class="field">
        <label for="project-year">Ejercicio fiscal</label>
        <input id="project-year" class="input" type="number" bind:value={projectForm.fiscalYear} />
      </div>
      <div class="field">
        <label for="project-status">Estado</label>
        <select id="project-status" class="select" bind:value={projectForm.status}>
          {#each Object.entries(STATUS_LABELS) as [key, label]}
            <option value={key}>{label}</option>
          {/each}
        </select>
      </div>
      <div class="field">
        <label for="project-area">Área</label>
        <input id="project-area" class="input" bind:value={projectForm.area} />
      </div>
      <div class="field">
        <label for="project-manager">Responsable</label>
        <input id="project-manager" class="input" bind:value={projectForm.manager} />
      </div>
      <div class="field">
        <label for="project-location">Ubicación</label>
        <input id="project-location" class="input" bind:value={projectForm.location} />
      </div>
      <div class="field">
        <label for="project-end">Fecha término</label>
        <input id="project-end" class="input" type="date" bind:value={projectForm.endDate} />
      </div>
      <div class="field" style="min-width:100%">
        <label for="project-objective">Objetivo</label>
        <textarea id="project-objective" class="textarea" bind:value={projectForm.objective}></textarea>
      </div>
      <label style="display:flex;gap:8px;align-items:center">
        <input type="checkbox" bind:checked={projectForm.isMultiYear} /> Proyecto plurianual
      </label>
    </div>
    <div style="margin-top:14px">
      <button class="btn" on:click={createProject}>Crear proyecto local</button>
    </div>
  {:else if active === 'edit'}
    <div class="field" style="margin-bottom:14px">
      <label for="edit-project-select">Proyecto</label>
      <select id="edit-project-select" class="select" bind:value={selectedProjectId} disabled={!projects.length}>
        {#each projects as project}
          <option value={project.id}>{project.internalFolio} · {project.name}</option>
        {/each}
      </select>
    </div>

    {#if selectedProject}
      <div class="grid two">
        <div class="field">
          <label for="edit-municipal">Folio municipal</label>
          <input id="edit-municipal" class="input" bind:value={editForm.municipalFolio} />
        </div>
        <div class="field">
          <label for="edit-name">Nombre</label>
          <input id="edit-name" class="input" bind:value={editForm.name} />
        </div>
        <div class="field">
          <label for="edit-initial">Monto autorizado inicial</label>
          <input id="edit-initial" class="input" type="number" min="1" bind:value={editForm.initialAuthorizedAmount} />
        </div>
        <div class="field">
          <label for="edit-status">Estado</label>
          <select id="edit-status" class="select" bind:value={editForm.status}>
            {#each Object.entries(STATUS_LABELS) as [key, label]}
              <option value={key}>{label}</option>
            {/each}
          </select>
        </div>
        <div class="field">
          <label for="edit-area">Área</label>
          <input id="edit-area" class="input" bind:value={editForm.area} />
        </div>
        <div class="field">
          <label for="edit-manager">Responsable</label>
          <input id="edit-manager" class="input" bind:value={editForm.manager} />
        </div>
        <div class="field">
          <label for="edit-location">Ubicación</label>
          <input id="edit-location" class="input" bind:value={editForm.location} />
        </div>
        <div class="field">
          <label for="edit-end">Fecha término</label>
          <input id="edit-end" class="input" type="date" bind:value={editForm.endDate} />
        </div>
        <div class="field" style="min-width:100%">
          <label for="edit-objective">Objetivo</label>
          <textarea id="edit-objective" class="textarea" bind:value={editForm.objective}></textarea>
        </div>
        <label style="display:flex;gap:8px;align-items:center">
          <input type="checkbox" bind:checked={editForm.isMultiYear} /> Proyecto plurianual
        </label>
      </div>
      <div class="notice" style="margin-top:12px">Regla: no se puede editar <code>currentAmount</code>. El monto vigente se recalcula como monto inicial + movimientos.</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px">
        <button class="btn" on:click={updateSelectedProject}>Guardar cambios</button>
        <button class="btn danger" on:click={deleteSelectedProject}>Eliminar proyecto</button>
      </div>
    {:else}
      <p class="notice">No hay proyectos para editar.</p>
    {/if}
  {:else if active === 'database'}
    <section class="grid two">
      <div>
        <h3>Exportar / importar JSON</h3>
        <p class="notice">La exportación genera un archivo JSON con todos los proyectos, movimientos, compromisos, documentos, alertas, timeline y auditoría.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin:12px 0">
          <button class="btn" on:click={exportJson}>Exportar JSON</button>
          <label class="btn secondary" for="import-file" style="cursor:pointer">Importar archivo</label>
          <input id="import-file" type="file" accept="application/json,.json" on:change={importFromFile} style="display:none" />
        </div>
        <div class="field">
          <label for="import-text">Pegar JSON</label>
          <textarea id="import-text" class="textarea" bind:value={importText} style="min-height:180px" placeholder="Pega aquí el JSON exportado..."></textarea>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px">
          <button class="btn" on:click={importFromText}>Importar texto JSON</button>
          <button class="btn secondary" on:click={resetSeed}>Restablecer semilla</button>
          <button class="btn danger" on:click={clearAll}>Vaciar base local</button>
        </div>
      </div>

      <div>
        <h3>Eliminar elementos del proyecto</h3>
        {#if selectedProject}
          <div class="field" style="margin-bottom:12px">
            <label for="delete-project-select">Proyecto</label>
            <select id="delete-project-select" class="select" bind:value={selectedProjectId}>
              {#each projects as project}
                <option value={project.id}>{project.internalFolio} · {project.name}</option>
              {/each}
            </select>
          </div>
          <ul class="list">
            <li>Movimientos: <strong>{selectedProject.movements.length}</strong></li>
            <li>Compromisos: <strong>{selectedProject.commitments.length}</strong></li>
            <li>Documentos: <strong>{selectedProject.documents.length}</strong></li>
            <li>Alertas: <strong>{selectedProject.alerts.length}</strong></li>
            <li>Timeline: <strong>{selectedProject.timeline.length}</strong></li>
          </ul>
        {:else}
          <p class="notice">No hay proyecto seleccionado.</p>
        {/if}
      </div>
    </section>

    {#if selectedProject}
      <div class="grid two" style="margin-top:16px">
        <div>
          <h3>Movimientos</h3>
          <ul class="list">
            {#each selectedProject.movements as item}
              <li>
                <strong>{MOVEMENT_LABELS[item.type] || item.type}</strong> · {formatCurrency(item.amount)}<br />
                <span class="small muted">{formatDate(item.date)} · {item.concept}</span>
                <div style="margin-top:8px"><button class="btn danger" on:click={() => deleteItem('movements', item)}>Eliminar</button></div>
              </li>
            {:else}<li>Sin movimientos.</li>{/each}
          </ul>
        </div>
        <div>
          <h3>Compromisos</h3>
          <ul class="list">
            {#each selectedProject.commitments as item}
              <li>
                <strong>{COMMITMENT_LABELS[item.type] || item.type} {item.folio}</strong> · {formatCurrency(item.amount)}<br />
                <span class="small muted">{item.supplier} · {COMMITMENT_STATUS_LABELS[item.status]}</span>
                <div style="margin-top:8px"><button class="btn danger" on:click={() => deleteItem('commitments', item)}>Eliminar</button></div>
              </li>
            {:else}<li>Sin compromisos.</li>{/each}
          </ul>
        </div>
        <div>
          <h3>Documentos</h3>
          <ul class="list">
            {#each selectedProject.documents as item}
              <li>
                <strong>{item.name}</strong><br />
                <span class="small muted">{item.type} · {item.status}</span>
                <div style="margin-top:8px"><button class="btn danger" on:click={() => deleteItem('documents', item)}>Eliminar</button></div>
              </li>
            {:else}<li>Sin documentos.</li>{/each}
          </ul>
        </div>
        <div>
          <h3>Alertas</h3>
          <ul class="list">
            {#each selectedProject.alerts as item}
              <li>
                <strong>{item.title}</strong><br />
                <span class="small muted">{SEVERITY_LABELS[item.severity] || item.severity} · {item.status}</span>
                <div style="margin-top:8px"><button class="btn danger" on:click={() => deleteItem('alerts', item)}>Eliminar</button></div>
              </li>
            {:else}<li>Sin alertas.</li>{/each}
          </ul>
        </div>
        <div>
          <h3>Timeline</h3>
          <ul class="list">
            {#each selectedProject.timeline as item}
              <li>
                <strong>{item.title}</strong><br />
                <span class="small muted">{formatDate(item.date)} · {item.description}</span>
                <div style="margin-top:8px"><button class="btn danger" on:click={() => deleteItem('timeline', item)}>Eliminar</button></div>
              </li>
            {:else}<li>Sin eventos.</li>{/each}
          </ul>
        </div>
      </div>
    {/if}
  {:else}
    <div class="field" style="margin-bottom:14px">
      <label for="target-project">Proyecto</label>
      <select id="target-project" class="select" bind:value={selectedProjectId} disabled={!projects.length}>
        {#each projects as project}
          <option value={project.id}>{project.internalFolio} · {project.name}</option>
        {/each}
      </select>
    </div>

    {#if !selectedProject}
      <p class="notice">Primero cree o importe un proyecto.</p>
    {:else if active === 'document'}
      <div class="grid three">
        <div class="field">
          <label for="doc-name">Nombre documento</label>
          <input id="doc-name" class="input" bind:value={docForm.name} placeholder="Ej. Oficio de autorización" />
        </div>
        <div class="field">
          <label for="doc-type">Tipo</label>
          <select id="doc-type" class="select" bind:value={docForm.type}>
            <option>PDF</option><option>DOCX</option><option>XLSX</option><option>IMG</option>
          </select>
        </div>
        <div class="field">
          <label for="doc-status">Estado</label>
          <select id="doc-status" class="select" bind:value={docForm.status}>
            <option>Cargado</option><option>Validado</option><option>Pendiente de validación</option>
          </select>
        </div>
      </div>
      <div style="margin-top:14px"><button class="btn" on:click={addDocument}>Agregar documento</button></div>
    {:else if active === 'alert'}
      <div class="grid two">
        <div class="field">
          <label for="alert-title">Título</label>
          <input id="alert-title" class="input" bind:value={alertForm.title} placeholder="Ej. Remanente alto" />
        </div>
        <div class="field">
          <label for="alert-severity-form">Severidad</label>
          <select id="alert-severity-form" class="select" bind:value={alertForm.severity}>
            <option value="info">Informativa</option>
            <option value="warning">Advertencia</option>
            <option value="critical">Crítica</option>
          </select>
        </div>
        <div class="field" style="min-width:100%">
          <label for="alert-message">Mensaje</label>
          <textarea id="alert-message" class="textarea" bind:value={alertForm.message}></textarea>
        </div>
      </div>
      <div style="margin-top:14px"><button class="btn" on:click={addAlert}>Agregar alerta</button></div>
    {:else if active === 'timeline'}
      <div class="grid two">
        <div class="field">
          <label for="event-title">Título evento</label>
          <input id="event-title" class="input" bind:value={eventForm.title} placeholder="Ej. Revisión con Dirección" />
        </div>
        <div class="field">
          <label for="event-type">Tipo</label>
          <select id="event-type" class="select" bind:value={eventForm.type}>
            <option value="manual">Manual</option>
            <option value="analysis">Análisis</option>
            <option value="meeting">Reunión</option>
            <option value="validation">Validación</option>
          </select>
        </div>
        <div class="field" style="min-width:100%">
          <label for="event-description">Descripción</label>
          <textarea id="event-description" class="textarea" bind:value={eventForm.description}></textarea>
        </div>
      </div>
      <div style="margin-top:14px"><button class="btn" on:click={addEvent}>Agregar evento</button></div>
    {/if}
  {/if}
</section>
