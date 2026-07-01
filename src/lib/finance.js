import { daysUntil } from '$lib/formatters.js';

export const STATUS_LABELS = {
  initial_registration: 'Registro inicial',
  incorporated_authorized: 'Incorporado/autorizado',
  fiscal_year_authorized: 'Autorizado ejercicio',
  in_procurement_process: 'En proceso adquisitivo',
  committed: 'ID vinculado',
  formalized: 'Formalizado',
  pending_remaining_balance: 'Remanente pendiente',
  closed: 'Cerrado',
  cancelled: 'Cancelado',
  // Alias legacy del mock para compatibilidad con datos locales previos.
  authorized: 'Autorizado',
  procurement: 'En procedimiento',
  redistributing: 'Redistribución',
  concluded: 'Concluido',
  canceled: 'Cancelado'
};

export const MOVEMENT_LABELS = {
  increase: 'Ampliación',
  decrease: 'Reducción',
  redistribution_in: 'Redistribución recibida',
  redistribution_out: 'Redistribución enviada',
  transfer_in: 'Redistribución recibida',
  transfer_out: 'Redistribución enviada',
  adjustment: 'Ajuste administrativo'
};

export const COMMITMENT_LABELS = {
  requisition: 'Requisición',
  contract: 'Contrato',
  purchase_order: 'Pedido'
};

export const COMMITMENT_STATUS_LABELS = {
  linked: 'Vinculado',
  formalized: 'Formalizado',
  modified: 'Modificado',
  cancelled: 'Cancelado',
  // Alias legacy del mock.
  draft: 'Borrador',
  in_review: 'En revisión',
  canceled: 'Cancelado'
};

export const SEVERITY_LABELS = {
  info: 'Informativa',
  warning: 'Advertencia',
  critical: 'Crítica',
  success: 'Atendida'
};

export function calculateProject(project) {
  const movementsTotal = (project.movements || []).reduce((sum, movement) => sum + Number(movement.amount || 0), 0);
  const currentAmount = Number(project.initialAuthorizedAmount || 0) + movementsTotal;
  const committedAmount = (project.commitments || [])
    .filter((commitment) => commitment.status === 'formalized')
    .reduce((sum, commitment) => sum + Number(commitment.amount || 0), 0);
  const remainingBalance = currentAmount - committedAmount;
  const executionPercentage = currentAmount > 0 ? (committedAmount / currentAmount) * 100 : 0;
  const remainingPercentage = currentAmount > 0 ? (remainingBalance / currentAmount) * 100 : 0;
  const closureCandidate = committedAmount > 0 && remainingBalance < currentAmount * 0.2;
  const pendingBalance = remainingBalance > currentAmount * 0.2;
  const exceedsAvailableAmount = committedAmount > currentAmount;
  const formalizedCommitments = (project.commitments || []).filter((commitment) => commitment.status === 'formalized').length;
  const procurementReferences = (project.commitments || []).length;
  const endDays = daysUntil(project.endDate);
  const multiYearNearEnd = Boolean(project.isMultiYear && endDays !== null && endDays <= 120 && endDays >= 0);
  const traffic = getTrafficLight({
    status: project.status,
    committedAmount,
    currentAmount,
    remainingBalance,
    remainingPercentage,
    closureCandidate,
    pendingBalance,
    exceedsAvailableAmount,
    formalizedCommitments,
    procurementReferences,
    multiYearNearEnd
  });

  return {
    ...project,
    statusLabel: STATUS_LABELS[project.status] || project.status,
    movementsTotal,
    currentAmount,
    committedAmount,
    remainingBalance,
    executionPercentage,
    remainingPercentage,
    closureCandidate,
    pendingBalance,
    exceedsAvailableAmount,
    formalizedCommitments,
    procurementReferences,
    multiYearNearEnd,
    trafficLight: traffic.color,
    trafficLabel: traffic.label,
    trafficReason: traffic.reason,
    analyticTags: getAnalyticTags({
      project,
      committedAmount,
      currentAmount,
      remainingBalance,
      closureCandidate,
      pendingBalance,
      exceedsAvailableAmount,
      formalizedCommitments,
      procurementReferences
    })
  };
}

export function getTrafficLight(input) {
  if (['closed', 'cancelled', 'concluded', 'canceled'].includes(input.status)) {
    return { color: 'gray', label: 'Gris', reason: 'Proyecto cerrado o cancelado; consulta histórica.' };
  }
  if (input.exceedsAvailableAmount) {
    return { color: 'red', label: 'Rojo', reason: 'El compromiso formalizado excede el monto vigente.' };
  }
  if (input.procurementReferences === 0 || input.remainingPercentage > 50) {
    return { color: 'red', label: 'Rojo', reason: 'Remanente alto o sin procedimiento adquisitivo vinculado.' };
  }
  if (input.multiYearNearEnd) {
    return { color: 'blue', label: 'Azul', reason: 'Proyecto plurianual próximo a vencer.' };
  }
  if (input.remainingPercentage >= 20 && input.remainingPercentage <= 50) {
    return { color: 'yellow', label: 'Amarillo', reason: 'Remanente medio pendiente de definición.' };
  }
  if (input.closureCandidate) {
    return { color: 'green', label: 'Verde', reason: 'Compromiso formalizado y remanente menor al 20%; revisar cierre.' };
  }
  return { color: 'green', label: 'Verde', reason: 'Ejecución financiera dentro de parámetros.' };
}

export function getAnalyticTags(input) {
  const tags = [];
  if (input.procurementReferences === 0) tags.push({ key: 'no_execution', label: 'Sin ejercicio', tone: 'red' });
  if (input.procurementReferences > 0 && input.formalizedCommitments === 0) tags.push({ key: 'procurement', label: 'ID en adquisiciones', tone: 'yellow' });
  if (input.formalizedCommitments > 0) tags.push({ key: 'formalized', label: 'Formalizado', tone: 'green' });
  if (input.remainingBalance > 0 && !['closed', 'cancelled', 'concluded', 'canceled'].includes(input.project.status)) tags.push({ key: 'remaining', label: 'Con remanente', tone: 'yellow' });
  if (input.closureCandidate) tags.push({ key: 'closure', label: 'Candidato a cierre', tone: 'blue' });
  if (input.project.isMultiYear && !['closed', 'cancelled', 'concluded', 'canceled'].includes(input.project.status)) tags.push({ key: 'multi_year', label: 'Plurianual activo', tone: 'blue' });
  if (input.exceedsAvailableAmount) tags.push({ key: 'exceeds', label: 'Riesgo de exceso', tone: 'red' });
  if ((input.project.movements || []).length >= 3) tags.push({ key: 'variable', label: 'Alta variabilidad', tone: 'purple' });
  return tags;
}

export function portfolioSummary(projects) {
  const analyzed = projects.map(calculateProject);
  const totals = analyzed.reduce(
    (acc, project) => {
      acc.initial += project.initialAuthorizedAmount;
      acc.current += project.currentAmount;
      acc.committed += project.committedAmount;
      acc.remaining += project.remainingBalance;
      acc.movements += project.movements.length;
      acc.commitments += project.commitments.length;
      return acc;
    },
    { initial: 0, current: 0, committed: 0, remaining: 0, movements: 0, commitments: 0 }
  );
  totals.executionPercentage = totals.current > 0 ? (totals.committed / totals.current) * 100 : 0;
  return {
    projects: analyzed.length,
    closureCandidates: analyzed.filter((project) => project.closureCandidate).length,
    pendingBalances: analyzed.filter((project) => project.pendingBalance).length,
    exceeds: analyzed.filter((project) => project.exceedsAvailableAmount).length,
    red: analyzed.filter((project) => project.trafficLight === 'red').length,
    yellow: analyzed.filter((project) => project.trafficLight === 'yellow').length,
    green: analyzed.filter((project) => project.trafficLight === 'green').length,
    blue: analyzed.filter((project) => project.trafficLight === 'blue').length,
    gray: analyzed.filter((project) => project.trafficLight === 'gray').length,
    byStatus: Object.entries(
      analyzed.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      }, {})
    ).map(([status, count]) => ({ status, label: STATUS_LABELS[status] || status, count })),
    totals,
    analyzed
  };
}
