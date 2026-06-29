import { derived, get, writable } from 'svelte/store';
import { browser } from '$app/environment';
import { mockProjects } from '$lib/data/mockProjects.js';
import { calculateProject, portfolioSummary } from '$lib/finance.js';

const STORAGE_KEY = 'sspm-investment-portfolio:v1';

function today() {
  return '2026-06-29';
}

function nowStamp() {
  return '2026-06-29 12:00';
}

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}

function clone(value) {
  return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

function loadInitial() {
  if (!browser) return clone(mockProjects);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return clone(mockProjects);
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) return parsed;
    return clone(mockProjects);
  } catch (error) {
    console.warn('No se pudo leer la base local; se usa la semilla mock.', error);
    return clone(mockProjects);
  }
}

function persist(projects) {
  if (!browser) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.warn('No se pudo guardar en la base local.', error);
  }
}

function createProjectStore() {
  const { subscribe, update, set } = writable(loadInitial());

  subscribe((projects) => persist(projects));

  function appendEvent(project, { type, title, description, action, user = 'Usuario demo' }) {
    const timelineEvent = {
      id: uid('tl'),
      date: today(),
      type,
      title,
      description,
      user
    };
    const auditEvent = {
      id: uid('aud'),
      date: nowStamp(),
      action,
      user,
      detail: description
    };
    return {
      ...project,
      timeline: [timelineEvent, ...(project.timeline || [])],
      audit: [auditEvent, ...(project.audit || [])]
    };
  }

  return {
    subscribe,
    reset: () => set(clone(mockProjects)),
    resetSeed() {
      set(clone(mockProjects));
      return { ok: true, message: 'Base local restablecida a los datos semilla.' };
    },
    clearAll() {
      set([]);
      return { ok: true, message: 'Base local vaciada. Cree proyectos desde el formulario.' };
    },
    createProject(payload) {
      const name = (payload.name || '').trim();
      const initialAuthorizedAmount = Number(payload.initialAuthorizedAmount || 0);
      if (!name) return { ok: false, message: 'El nombre del proyecto es obligatorio.' };
      if (!Number.isFinite(initialAuthorizedAmount) || initialAuthorizedAmount <= 0) {
        return { ok: false, message: 'El monto autorizado inicial debe ser mayor a cero.' };
      }
      let createdId = null;
      update((projects) => {
        const fiscalYear = Number(payload.fiscalYear) || 2026;
        const existing = projects
          .map((project) => Number(String(project.internalFolio || '').match(/CART-(\d+)-/)?.[1] || 0))
          .filter((value) => Number.isFinite(value));
        const nextSeq = (existing.length ? Math.max(...existing) : 0) + 1;
        const folioNumber = String(nextSeq).padStart(4, '0');
        const internalFolio = `CART-${folioNumber}-${fiscalYear}`;
        createdId = uid('project');
        const base = {
          id: createdId,
          internalFolio,
          municipalFolio: payload.municipalFolio?.trim() || `MUN-SSPM-${String(fiscalYear).slice(-2)}-${folioNumber}`,
          name,
          fiscalYear,
          status: payload.status || 'authorized',
          area: payload.area?.trim() || 'Sin área asignada',
          manager: payload.manager?.trim() || 'Sin responsable',
          location: payload.location?.trim() || 'Sin ubicación',
          objective: payload.objective?.trim() || 'Objetivo pendiente de captura.',
          initialAuthorizedAmount,
          isMultiYear: Boolean(payload.isMultiYear),
          startDate: payload.startDate || today(),
          endDate: payload.endDate || '',
          movements: [],
          commitments: [],
          documents: [],
          alerts: [],
          timeline: [],
          audit: []
        };
        const created = appendEvent(base, {
          type: 'created',
          title: 'Proyecto registrado',
          description: `Alta de ${internalFolio} desde formulario; monto autorizado inicial ${initialAuthorizedAmount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}.`,
          action: 'project.created',
          user: payload.user || 'Usuario demo'
        });
        return [created, ...projects];
      });
      return { ok: true, message: 'Proyecto creado en la base local.', id: createdId };
    },
    updateProject(projectId, payload) {
      const name = (payload.name || '').trim();
      const initialAuthorizedAmount = Number(payload.initialAuthorizedAmount || 0);
      if (!name) return { ok: false, message: 'El nombre del proyecto es obligatorio.' };
      if (!Number.isFinite(initialAuthorizedAmount) || initialAuthorizedAmount <= 0) {
        return { ok: false, message: 'El monto autorizado inicial debe ser mayor a cero.' };
      }
      if ('currentAmount' in payload) {
        return { ok: false, message: 'Regla: no se puede editar currentAmount directamente. Use movimientos.' };
      }
      let result = { ok: false, message: 'No se encontró el proyecto.' };
      update((projects) =>
        projects.map((project) => {
          if (project.id !== projectId) return project;
          const updatedBase = {
            ...project,
            municipalFolio: payload.municipalFolio?.trim() || project.municipalFolio,
            name,
            fiscalYear: Number(payload.fiscalYear) || project.fiscalYear,
            status: payload.status || project.status,
            area: payload.area?.trim() || 'Sin área asignada',
            manager: payload.manager?.trim() || 'Sin responsable',
            location: payload.location?.trim() || 'Sin ubicación',
            objective: payload.objective?.trim() || 'Objetivo pendiente de captura.',
            initialAuthorizedAmount,
            isMultiYear: Boolean(payload.isMultiYear),
            startDate: payload.startDate || project.startDate,
            endDate: payload.endDate || project.endDate
          };
          result = { ok: true, message: 'Proyecto actualizado en la base local.' };
          return appendEvent(updatedBase, {
            type: 'updated',
            title: 'Proyecto actualizado',
            description: `Se actualizaron datos generales de ${project.internalFolio}. El monto vigente sigue derivado de inicial + movimientos.`,
            action: 'project.updated',
            user: payload.user || 'Usuario demo'
          });
        })
      );
      return result;
    },
    deleteProject(projectId) {
      let removed = null;
      update((projects) => {
        removed = projects.find((project) => project.id === projectId);
        return projects.filter((project) => project.id !== projectId);
      });
      if (!removed) return { ok: false, message: 'No se encontró el proyecto.' };
      return { ok: true, message: `Proyecto ${removed.internalFolio} eliminado de la base local.` };
    },
    replaceAll(importedProjects) {
      if (!Array.isArray(importedProjects)) return { ok: false, message: 'El JSON debe contener un arreglo de proyectos.' };
      const normalized = importedProjects.map((project, index) => ({
        id: project.id || uid('project'),
        internalFolio: project.internalFolio || `CART-${String(index + 1).padStart(4, '0')}-${project.fiscalYear || 2026}`,
        municipalFolio: project.municipalFolio || '',
        name: project.name || `Proyecto importado ${index + 1}`,
        fiscalYear: Number(project.fiscalYear) || 2026,
        status: project.status || 'authorized',
        area: project.area || 'Sin área asignada',
        manager: project.manager || 'Sin responsable',
        location: project.location || 'Sin ubicación',
        objective: project.objective || 'Objetivo pendiente de captura.',
        initialAuthorizedAmount: Number(project.initialAuthorizedAmount || 0),
        isMultiYear: Boolean(project.isMultiYear),
        startDate: project.startDate || today(),
        endDate: project.endDate || '',
        closedAt: project.closedAt,
        movements: Array.isArray(project.movements) ? project.movements : [],
        commitments: Array.isArray(project.commitments) ? project.commitments : [],
        documents: Array.isArray(project.documents) ? project.documents : [],
        alerts: Array.isArray(project.alerts) ? project.alerts : [],
        timeline: Array.isArray(project.timeline) ? project.timeline : [],
        audit: Array.isArray(project.audit) ? project.audit : []
      }));
      set(normalized);
      return { ok: true, message: `Base local reemplazada con ${normalized.length} proyectos importados.` };
    },
    addMovement(projectId, payload) {
      let result = { ok: false, message: 'No se encontró el proyecto.' };
      update((projects) =>
        projects.map((project) => {
          if (project.id !== projectId) return project;
          if (payload.field === 'currentAmount') {
            result = { ok: false, message: 'Regla: no se puede editar el monto vigente directamente. Use movimientos.' };
            return project;
          }
          const amount = Number(payload.amount || 0);
          if (!Number.isFinite(amount) || amount === 0) {
            result = { ok: false, message: 'El monto del movimiento debe ser distinto de cero.' };
            return project;
          }
          const movement = {
            id: uid('mov'),
            date: today(),
            type: payload.type || (amount > 0 ? 'increase' : 'decrease'),
            amount,
            concept: payload.concept || 'Movimiento simulado',
            user: payload.user || 'Usuario demo'
          };
          const updated = appendEvent(
            { ...project, movements: [movement, ...(project.movements || [])] },
            {
              type: 'movement',
              title: amount > 0 ? 'Ampliación simulada' : 'Reducción simulada',
              description: `${movement.concept} por ${amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`,
              action: 'movement.created',
              user: movement.user
            }
          );
          result = { ok: true, message: 'Movimiento registrado en timeline y auditoría mock.' };
          return updated;
        })
      );
      return result;
    },
    formalizeCommitment(projectId, commitmentId) {
      let result = { ok: false, message: 'No se encontró el compromiso.' };
      update((projects) =>
        projects.map((project) => {
          if (project.id !== projectId) return project;
          let changed = false;
          const commitments = (project.commitments || []).map((commitment) => {
            if (commitment.id !== commitmentId) return commitment;
            changed = true;
            return { ...commitment, status: 'formalized', date: today() };
          });
          if (!changed) return project;
          const commitment = commitments.find((item) => item.id === commitmentId);
          const updated = appendEvent(
            { ...project, commitments, status: 'committed' },
            {
              type: 'commitment',
              title: 'Compromiso formalizado',
              description: `${commitment.folio} formalizado; ahora afecta el monto comprometido.`,
              action: 'commitment.formalized',
              user: 'Compras demo'
            }
          );
          result = { ok: true, message: 'Compromiso formalizado. Solo ahora afecta committedAmount.' };
          return updated;
        })
      );
      return result;
    },
    addMockCommitment(projectId, payload) {
      let result = { ok: false, message: 'No se encontró el proyecto.' };
      update((projects) =>
        projects.map((project) => {
          if (project.id !== projectId) return project;
          const amount = Number(payload.amount || 0);
          if (!Number.isFinite(amount) || amount <= 0) {
            result = { ok: false, message: 'El monto del compromiso debe ser mayor a cero.' };
            return project;
          }
          const commitment = {
            id: uid('com'),
            date: today(),
            type: payload.type || 'requisition',
            folio: payload.folio || `REQ-2026-${Math.floor(Math.random() * 900 + 100)}`,
            supplier: payload.supplier || 'Proveedor demo',
            amount,
            status: payload.status || 'draft'
          };
          const updated = appendEvent(
            { ...project, commitments: [commitment, ...(project.commitments || [])], status: 'procurement' },
            {
              type: 'procurement',
              title: 'Compromiso mock agregado',
              description: `${commitment.folio} agregado con estado ${commitment.status}; solo formalizado afecta el cálculo.`,
              action: 'commitment.created',
              user: 'Compras demo'
            }
          );
          result = { ok: true, message: 'Compromiso mock agregado.' };
          return updated;
        })
      );
      return result;
    },
    addDocument(projectId, payload) {
      let result = { ok: false, message: 'No se encontró el proyecto.' };
      update((projects) =>
        projects.map((project) => {
          if (project.id !== projectId) return project;
          const name = (payload.name || '').trim();
          if (!name) {
            result = { ok: false, message: 'El nombre del documento es obligatorio.' };
            return project;
          }
          const document = {
            id: uid('doc'),
            name,
            type: payload.type || 'PDF',
            status: payload.status || 'Cargado'
          };
          const updated = appendEvent(
            { ...project, documents: [document, ...(project.documents || [])] },
            {
              type: 'document',
              title: 'Documento agregado',
              description: `Se agregó documento ${document.name} (${document.type}) con estado ${document.status}.`,
              action: 'document.created',
              user: payload.user || 'Usuario demo'
            }
          );
          result = { ok: true, message: 'Documento agregado a la base local.' };
          return updated;
        })
      );
      return result;
    },
    addAlert(projectId, payload) {
      let result = { ok: false, message: 'No se encontró el proyecto.' };
      update((projects) =>
        projects.map((project) => {
          if (project.id !== projectId) return project;
          const title = (payload.title || '').trim();
          if (!title) {
            result = { ok: false, message: 'El título de la alerta es obligatorio.' };
            return project;
          }
          const alert = {
            id: uid('alert'),
            severity: payload.severity || 'warning',
            status: payload.status || 'open',
            title,
            message: payload.message?.trim() || 'Alerta capturada manualmente en la demo.',
            date: today()
          };
          const updated = appendEvent(
            { ...project, alerts: [alert, ...(project.alerts || [])] },
            {
              type: 'alert',
              title: 'Alerta registrada',
              description: `Se registró alerta ${alert.title} con severidad ${alert.severity}.`,
              action: 'alert.created',
              user: payload.user || 'Usuario demo'
            }
          );
          result = { ok: true, message: 'Alerta agregada a la base local.' };
          return updated;
        })
      );
      return result;
    },
    addTimelineEvent(projectId, payload) {
      let result = { ok: false, message: 'No se encontró el proyecto.' };
      update((projects) =>
        projects.map((project) => {
          if (project.id !== projectId) return project;
          const title = (payload.title || '').trim();
          if (!title) {
            result = { ok: false, message: 'El título del evento es obligatorio.' };
            return project;
          }
          const updated = appendEvent(project, {
            type: payload.type || 'manual',
            title,
            description: payload.description?.trim() || 'Evento capturado manualmente.',
            action: 'timeline.manual_event',
            user: payload.user || 'Usuario demo'
          });
          result = { ok: true, message: 'Evento agregado al timeline y auditoría.' };
          return updated;
        })
      );
      return result;
    },
    deleteProjectItem(projectId, collection, itemId) {
      const allowed = {
        movements: 'movement.deleted',
        commitments: 'commitment.deleted',
        documents: 'document.deleted',
        alerts: 'alert.deleted',
        timeline: 'timeline.deleted'
      };
      if (!allowed[collection]) return { ok: false, message: 'Tipo de elemento no permitido.' };
      let result = { ok: false, message: 'No se encontró el elemento.' };
      update((projects) =>
        projects.map((project) => {
          if (project.id !== projectId) return project;
          const list = Array.isArray(project[collection]) ? project[collection] : [];
          const item = list.find((entry) => entry.id === itemId);
          if (!item) return project;
          const nextProject = {
            ...project,
            [collection]: list.filter((entry) => entry.id !== itemId)
          };
          result = { ok: true, message: 'Elemento eliminado de la base local.' };
          if (collection === 'timeline') {
            return {
              ...nextProject,
              audit: [
                {
                  id: uid('aud'),
                  date: nowStamp(),
                  action: allowed[collection],
                  user: 'Usuario demo',
                  detail: `Se eliminó evento de timeline: ${item.title || item.id}.`
                },
                ...(nextProject.audit || [])
              ]
            };
          }
          return appendEvent(nextProject, {
            type: 'deleted',
            title: 'Elemento eliminado',
            description: `Se eliminó elemento de ${collection}: ${item.folio || item.name || item.title || item.concept || item.id}.`,
            action: allowed[collection],
            user: 'Usuario demo'
          });
        })
      );
      return result;
    },
    redistribute(sourceId, destinationId, amount, concept = 'Redistribución simulada') {
      const projects = get(projectsStore).map(calculateProject);
      const source = projects.find((project) => project.id === sourceId);
      const destination = projects.find((project) => project.id === destinationId);
      const value = Number(amount || 0);
      if (!source || !destination) return { ok: false, message: 'Seleccione proyecto origen y destino válidos.' };
      if (source.id === destination.id) return { ok: false, message: 'El origen y destino deben ser diferentes.' };
      if (!Number.isFinite(value) || value <= 0) return { ok: false, message: 'El monto a redistribuir debe ser mayor a cero.' };
      if (value > source.remainingBalance) {
        return { ok: false, message: 'Regla: la redistribución no puede exceder el remanente disponible del proyecto origen.' };
      }

      update((items) =>
        items.map((project) => {
          if (project.id === sourceId) {
            const movement = { id: uid('mov'), date: today(), type: 'transfer_out', amount: -value, concept: `${concept} hacia ${destination.internalFolio}`, user: 'Usuario demo' };
            return appendEvent(
              { ...project, movements: [movement, ...(project.movements || [])], status: 'redistributing' },
              {
                type: 'redistribution',
                title: 'Redistribución enviada',
                description: `Se envió remanente por ${value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} hacia ${destination.internalFolio}.`,
                action: 'redistribution.transfer_out',
                user: 'Usuario demo'
              }
            );
          }
          if (project.id === destinationId) {
            const movement = { id: uid('mov'), date: today(), type: 'transfer_in', amount: value, concept: `${concept} desde ${source.internalFolio}`, user: 'Usuario demo' };
            return appendEvent(
              { ...project, movements: [movement, ...(project.movements || [])] },
              {
                type: 'redistribution',
                title: 'Redistribución recibida',
                description: `Se recibió ampliación por ${value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} desde ${source.internalFolio}.`,
                action: 'redistribution.transfer_in',
                user: 'Usuario demo'
              }
            );
          }
          return project;
        })
      );
      return { ok: true, message: 'Redistribución simulada aplicada y registrada en timeline/auditoría.' };
    },
    resolveAlert(projectId, alertId) {
      let result = { ok: false, message: 'No se encontró la alerta.' };
      update((projects) =>
        projects.map((project) => {
          if (project.id !== projectId) return project;
          let changed = false;
          const alerts = (project.alerts || []).map((alert) => {
            if (alert.id !== alertId) return alert;
            changed = true;
            return { ...alert, status: 'resolved', severity: 'success' };
          });
          if (!changed) return project;
          const alert = alerts.find((item) => item.id === alertId);
          const updated = appendEvent(
            { ...project, alerts },
            {
              type: 'alert',
              title: 'Alerta atendida',
              description: `Se marcó como atendida la alerta: ${alert.title}.`,
              action: 'alert.resolved',
              user: 'Usuario demo'
            }
          );
          result = { ok: true, message: 'Alerta marcada como atendida en la demo.' };
          return updated;
        })
      );
      return result;
    },
    addMockReportEvent(format) {
      update((projects) =>
        projects.map((project, index) => {
          if (index !== 0) return project;
          return appendEvent(project, {
            type: 'report',
            title: `Reporte ${format} generado`,
            description: `Se simuló la generación de reporte ${format} con filtros actuales.`,
            action: 'report.generated',
            user: 'Usuario demo'
          });
        })
      );
      return { ok: true, message: `Reporte ${format} simulado; evento agregado a auditoría.` };
    }
  };
}

export const projectsStore = createProjectStore();
export const analyzedProjects = derived(projectsStore, ($projects) => $projects.map(calculateProject));
export const summaryStore = derived(projectsStore, ($projects) => portfolioSummary($projects));
export const allAuditEvents = derived(projectsStore, ($projects) =>
  $projects
    .flatMap((project) => (project.audit || []).map((event) => ({ ...event, projectId: project.id, projectFolio: project.internalFolio, projectName: project.name })))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
);
export const allTimelineEvents = derived(projectsStore, ($projects) =>
  $projects
    .flatMap((project) => (project.timeline || []).map((event) => ({ ...event, projectId: project.id, projectFolio: project.internalFolio, projectName: project.name })))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
);
