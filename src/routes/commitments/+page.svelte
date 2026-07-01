<script>
  import { base } from '$app/paths';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import { analyzedProjects, projectsStore } from '$lib/projectStore.js';
  import { formatCurrency, formatDate } from '$lib/formatters.js';
  import { COMMITMENT_LABELS, COMMITMENT_STATUS_LABELS } from '$lib/finance.js';

  let projectId = '';
  let investmentId = '';
  let message = null;
  let activeModal = '';
  let form = { type: 'requisition', folio: '', supplier: '', amount: 500000, status: 'linked' };
  let docForm = { name: '', fileType: 'PDF', documentType: 'other', status: 'Cargado' };

  $: projects = $analyzedProjects;
  $: if (!projectId && projects.length) {
    projectId = projects[0].id;
    investmentId = projects[0].internalFolio;
  }
  $: project = projects.find((item) => item.id === projectId);
  $: rows = projects.flatMap((item) => item.commitments.map((commitment) => ({ ...commitment, project: item })));
  $: projectDocuments = project?.documents || [];
  $: pendingRows = rows.filter((row) => row.status !== 'formalized').length;
  $: formalizedRows = rows.filter((row) => row.status === 'formalized').length;

  function openModal(name) {
    activeModal = name;
  }

  function closeModal() {
    activeModal = '';
  }

  function findProjectByInvestmentId(value) {
    const needle = String(value || '').trim().toLowerCase();
    return projects.find((item) =>
      item.id.toLowerCase() === needle
      || item.internalFolio.toLowerCase() === needle
      || String(item.municipalFolio || '').toLowerCase() === needle
    );
  }

  function syncInvestmentIdFromSelect() {
    const selected = projects.find((item) => item.id === projectId);
    if (selected) investmentId = selected.internalFolio;
  }

  function applyInvestmentId() {
    const found = findProjectByInvestmentId(investmentId);
    if (!found) {
      message = { ok: false, message: 'No se encontró el ID de proyecto de inversión. Use un folio tipo CART-0001-2026.' };
      return null;
    }
    projectId = found.id;
    investmentId = found.internalFolio;
    return found;
  }

  function formalize(row) {
    message = projectsStore.formalizeCommitment(row.project.id, row.id);
  }

  function addCommitment() {
    const target = applyInvestmentId();
    if (!target) return;
    message = projectsStore.addMockCommitment(target.id, { ...form });
    if (message.ok) {
      form = { type: 'requisition', folio: '', supplier: '', amount: 500000, status: 'linked' };
      closeModal();
    }
  }

  function addProcurementDocument() {
    const target = applyInvestmentId();
    if (!target) return;
    const procurementFolio = form.folio || target.commitments?.[0]?.folio || '';
    message = projectsStore.addDocument(target.id, {
      ...docForm,
      scope: 'procurement',
      procurementFolio,
      uploadedIn: 'Proyecto adquisitivo',
      user: 'Compras demo'
    });
    if (message.ok) {
      docForm = { name: '', fileType: 'PDF', documentType: 'other', status: 'Cargado' };
      closeModal();
    }
  }

  function inferTypeFromFile(file) {
    const extension = file.name.split('.').pop()?.toUpperCase() || 'PDF';
    if (['PDF', 'DOCX', 'XLSX', 'PNG', 'JPG', 'JPEG'].includes(extension)) return extension === 'JPEG' ? 'JPG' : extension;
    return 'PDF';
  }

  function onDocumentFile(event) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    docForm = { ...docForm, name: file.name, fileType: inferTypeFromFile(file) };
  }
</script>

<PageHeader
  title="Proyecto adquisitivo / Formalización"
  subtitle="Acciones en modales: vincular ID de inversión, cargar documentos y formalizar para actualizar cartera."
/>

<section class="card flow-card">
  <h3>Flujo correcto entre módulos</h3>
  <div class="workflow-steps">
    <div class="workflow-step"><span>1</span><strong>Crear proyecto en cartera</strong><p>Sin documentos. Alta manual o plantilla masiva.</p></div>
    <div class="workflow-step active"><span>2</span><strong>Capturar ID aquí</strong><p>Al guardar el ID, cartera queda comprometida.</p></div>
    <div class="workflow-step"><span>3</span><strong>Formalizar adquisición</strong><p>Al formalizar, cartera pasa a Formalizado e impacta committedAmount.</p></div>
  </div>
</section>

<section class="grid two" style="margin-top:16px">
  <div class="card">
    <div class="split-header">
      <div>
        <h3>Acciones rápidas</h3>
        <p class="muted">El usuario abre solo la captura que necesita; no se muestran formularios incrustados.</p>
      </div>
    </div>
    {#if message}<p class="notice {message.ok ? 'ok' : 'error'}">{message.message}</p>{/if}
    <div class="action-grid" style="margin-top:12px">
      <button class="action-card" type="button" on:click={() => openModal('procurement')}><strong>Vincular ID / Alta adquisición</strong><span>Captura el ID de inversión y el folio adquisitivo.</span></button>
      <button class="action-card" type="button" on:click={() => openModal('document')}><strong>Cargar documento</strong><span>Archivo del Proyecto adquisitivo, no de cartera.</span></button>
      <button class="action-card" type="button" on:click={() => openModal('select')}><strong>Cambiar ID activo</strong><span>Consulta impacto y documentos de otro proyecto.</span></button>
    </div>
    <p class="rule-box" style="margin-top:12px">Regla solicitada: cuando metes el ID aquí, cartera se compromete; cuando formalizas aquí, cartera se formaliza.</p>
  </div>

  <div class="card">
    <h3>Impacto visible en cartera</h3>
    {#if project}
      <ul class="list">
        <li>Proyecto: <strong>{project.internalFolio}</strong><br><span class="small muted">{project.name}</span></li>
        <li>Estado cartera: <span class="badge {project.status === 'formalized' ? 'green' : project.status === 'committed' ? 'yellow' : 'gray'}">{project.statusLabel}</span></li>
        <li>Monto vigente: <strong>{formatCurrency(project.currentAmount)}</strong></li>
        <li>Comprometido formalizado: <strong>{formatCurrency(project.committedAmount)}</strong></li>
        <li>Referencias adquisitivas: <strong>{project.procurementReferences}</strong> · Formalizadas: <strong>{project.formalizedCommitments}</strong></li>
      </ul>
    {:else}
      <p class="notice">No hay proyecto seleccionado.</p>
    {/if}
  </div>
</section>

<section class="grid two" style="margin-top:16px">
  <div class="card">
    <h3>Documentos vinculados al ID activo</h3>
    {#if projectDocuments.length}
      <ul class="list">
        {#each projectDocuments as doc}
          <li><strong>{doc.name}</strong><br><span class="small muted">{doc.documentType || 'other'} · {doc.type} · {doc.status} · {doc.uploadedIn || 'Proyecto adquisitivo'}{doc.procurementFolio ? ` · ${doc.procurementFolio}` : ''}</span></li>
        {/each}
      </ul>
    {:else}
      <p class="notice">Todavía no hay documentos cargados en el Proyecto adquisitivo para este ID.</p>
    {/if}
  </div>

  <div class="card">
    <h3>Resumen de adquisiciones</h3>
    <ul class="list">
      <li>Total referencias adquisitivas: <strong>{rows.length}</strong></li>
      <li>Pendientes de formalizar: <strong>{pendingRows}</strong></li>
      <li>Formalizadas: <strong>{formalizedRows}</strong></li>
    </ul>
  </div>
</section>

<section class="card" style="margin-top:16px">
  <h3>Listado de proyectos adquisitivos</h3>
  <div class="table-wrap">
    <table>
      <thead><tr><th>ID inversión</th><th>Estado cartera</th><th>Tipo</th><th>Folio adquisitivo</th><th>Proveedor</th><th>Monto</th><th>Estado adquisición</th><th>Fecha</th><th>Acción</th></tr></thead>
      <tbody>
        {#each rows as row}
          <tr>
            <td><a href={`${base}/projects/${row.project.id}`}><strong>{row.project.internalFolio}</strong></a><br><span class="small muted">{row.project.name}</span></td>
            <td><span class="badge {row.project.status === 'formalized' ? 'green' : row.project.status === 'committed' ? 'yellow' : 'gray'}">{row.project.statusLabel}</span></td>
            <td>{COMMITMENT_LABELS[row.type] || row.type}</td>
            <td><strong>{row.folio}</strong></td>
            <td>{row.supplier}</td>
            <td class="amount">{formatCurrency(row.amount)}</td>
            <td><span class="badge {row.status === 'formalized' ? 'green' : ['cancelled', 'canceled'].includes(row.status) ? 'gray' : 'yellow'}">{COMMITMENT_STATUS_LABELS[row.status]}</span></td>
            <td>{formatDate(row.date)}</td>
            <td>{#if row.status !== 'formalized'}<button class="btn secondary" on:click={() => formalize(row)}>Formalizar</button>{:else}<span class="muted">Afecta cartera</span>{/if}</td>
          </tr>
        {:else}
          <tr><td colspan="9" class="muted">Sin proyectos adquisitivos vinculados.</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>

<Modal open={activeModal === 'procurement'} title="Vincular ID y guardar adquisición" subtitle="Captura el ID de inversión dentro del Proyecto adquisitivo." size="lg" on:close={closeModal}>
  <div class="grid two">
    <div class="field"><label for="investment-id">ID proyecto de inversión</label><input id="investment-id" class="input" bind:value={investmentId} placeholder="CART-0001-2026" /></div>
    <div class="field"><label for="commitments-project">Seleccionar desde cartera</label><select id="commitments-project" class="select" bind:value={projectId} on:change={syncInvestmentIdFromSelect}>{#each projects as item}<option value={item.id}>{item.internalFolio} · {item.name}</option>{/each}</select></div>
    <div class="field"><label for="commitment-type">Tipo de adquisición</label><select id="commitment-type" class="select" bind:value={form.type}><option value="requisition">Requisición</option><option value="contract">Contrato</option><option value="purchase_order">Pedido</option></select></div>
    <div class="field"><label for="commitment-folio">Folio adquisitivo</label><input id="commitment-folio" class="input" bind:value={form.folio} placeholder="Ej. REQ-2026-0500" /></div>
    <div class="field"><label for="commitment-supplier">Proveedor</label><input id="commitment-supplier" class="input" bind:value={form.supplier} placeholder="Nombre del proveedor" /></div>
    <div class="field"><label for="commitment-amount">Monto</label><input id="commitment-amount" class="input" type="number" min="1" bind:value={form.amount} /></div>
    <div class="field"><label for="commitment-status">Estado inicial</label><select id="commitment-status" class="select" bind:value={form.status}><option value="linked">Vinculado</option><option value="formalized">Formalizado</option><option value="modified">Modificado</option><option value="cancelled">Cancelado</option></select></div>
  </div>
  <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap"><button class="btn" on:click={addCommitment}>Vincular ID y guardar</button><button class="btn secondary" on:click={applyInvestmentId}>Validar ID</button></div>
</Modal>

<Modal open={activeModal === 'document'} title="Cargar documento en Proyecto adquisitivo" subtitle="La documentación se registra aquí y solo se consulta desde cartera." size="lg" on:close={closeModal}>
  <div class="field" style="margin-bottom:12px"><label for="doc-investment-id">ID proyecto de inversión</label><input id="doc-investment-id" class="input" bind:value={investmentId} placeholder="CART-0001-2026" /></div>
  <div class="grid three">
    <div class="field"><label for="doc-file">Archivo</label><input id="doc-file" class="input" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" on:change={onDocumentFile} /></div>
    <div class="field"><label for="doc-name">Nombre documento</label><input id="doc-name" class="input" bind:value={docForm.name} placeholder="Ej. Oficio de adjudicación" /></div>
    <div class="field"><label for="doc-document-type">Tipo documental</label><select id="doc-document-type" class="select" bind:value={docForm.documentType}><option value="official_letter">Oficio</option><option value="agreement">Acuerdo</option><option value="contract">Contrato</option><option value="requisition">Requisición</option><option value="purchase_order">Pedido</option><option value="closure_evidence">Evidencia cierre</option><option value="other">Otro</option></select></div>
    <div class="field"><label for="doc-type">Formato archivo</label><select id="doc-type" class="select" bind:value={docForm.fileType}><option>PDF</option><option>DOCX</option><option>XLSX</option><option>PNG</option><option>JPG</option></select></div>
    <div class="field"><label for="doc-status">Estado</label><select id="doc-status" class="select" bind:value={docForm.status}><option>Cargado</option><option>Validado</option><option>Pendiente de validación</option></select></div>
  </div>
  <div style="margin-top:12px"><button class="btn" on:click={addProcurementDocument}>Registrar documento</button></div>
</Modal>

<Modal open={activeModal === 'select'} title="Cambiar ID activo" subtitle="Selecciona el proyecto de inversión que quieres consultar." size="md" on:close={closeModal}>
  <div class="field"><label for="active-project-select">Proyecto</label><select id="active-project-select" class="select" bind:value={projectId} on:change={syncInvestmentIdFromSelect}>{#each projects as item}<option value={item.id}>{item.internalFolio} · {item.name}</option>{/each}</select></div>
  <div style="margin-top:12px"><button class="btn" on:click={closeModal}>Aplicar</button></div>
</Modal>
