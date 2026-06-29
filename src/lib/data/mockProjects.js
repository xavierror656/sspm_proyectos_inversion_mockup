export const mockProjects = [
  {
    id: 'project-0001',
    internalFolio: 'CART-0001-2026',
    municipalFolio: 'MUN-SSPM-026-001',
    name: 'Renovación de radiocomunicación operativa',
    fiscalYear: 2026,
    status: 'committed',
    area: 'Tecnologías SSPM',
    manager: 'Dir. Tecnologías',
    location: 'Comandancia Norte',
    objective: 'Modernizar equipos de radiocomunicación para operación policial y coordinación de emergencias.',
    initialAuthorizedAmount: 2800000,
    isMultiYear: false,
    startDate: '2026-01-15',
    endDate: '2026-10-30',
    movements: [
      { id: 'mov-0001-a', date: '2026-02-03', type: 'increase', amount: 250000, concept: 'Ampliación por actualización de terminales', user: 'Presupuesto' },
      { id: 'mov-0001-b', date: '2026-04-12', type: 'decrease', amount: -100000, concept: 'Reducción por economía en antenas', user: 'Jefatura Administrativa' }
    ],
    commitments: [
      { id: 'com-0001-a', date: '2026-03-18', type: 'requisition', folio: 'REQ-2026-0148', supplier: 'Radio Sistemas del Norte', amount: 450000, status: 'formalized' },
      { id: 'com-0001-b', date: '2026-05-08', type: 'contract', folio: 'CON-SSPM-2026-033', supplier: 'Radio Sistemas del Norte', amount: 2260000, status: 'formalized' }
    ],
    documents: [
      { id: 'doc-0001-a', name: 'Oficio de autorización presupuestal', type: 'PDF', status: 'Cargado' },
      { id: 'doc-0001-b', name: 'Dictamen técnico de radiocomunicación', type: 'PDF', status: 'Validado' }
    ],
    alerts: [
      { id: 'alert-0001-a', severity: 'info', status: 'open', title: 'Proyecto candidato a cierre', message: 'El remanente es menor al 20% del monto vigente.', date: '2026-06-21' }
    ],
    timeline: [
      { id: 'tl-0001-a', date: '2026-01-15', type: 'created', title: 'Proyecto registrado', description: 'Alta inicial en cartera de inversión.', user: 'Auxiliar Presupuesto' },
      { id: 'tl-0001-b', date: '2026-03-18', type: 'commitment', title: 'Requisición formalizada', description: 'REQ-2026-0148 asociada al proyecto.', user: 'Compras' },
      { id: 'tl-0001-c', date: '2026-05-08', type: 'commitment', title: 'Contrato formalizado', description: 'Contrato CON-SSPM-2026-033 formalizado.', user: 'Compras' }
    ],
    audit: [
      { id: 'aud-0001-a', date: '2026-01-15 09:20', action: 'project.created', user: 'Auxiliar Presupuesto', detail: 'Creó proyecto CART-0001-2026' },
      { id: 'aud-0001-b', date: '2026-05-08 11:44', action: 'commitment.formalized', user: 'Compras', detail: 'Formalizó contrato CON-SSPM-2026-033' }
    ]
  },
  {
    id: 'project-0002',
    internalFolio: 'CART-0002-2026',
    municipalFolio: 'MUN-SSPM-026-002',
    name: 'Adquisición de patrullas preventivas',
    fiscalYear: 2026,
    status: 'procurement',
    area: 'Operación Policial',
    manager: 'Dir. Operativa',
    location: 'Distrito Centro',
    objective: 'Renovar parque vehicular para mejorar tiempos de respuesta en cuadrantes prioritarios.',
    initialAuthorizedAmount: 12500000,
    isMultiYear: false,
    startDate: '2026-02-01',
    endDate: '2026-12-15',
    movements: [
      { id: 'mov-0002-a', date: '2026-03-20', type: 'increase', amount: 850000, concept: 'Ampliación por equipamiento táctico', user: 'Dirección Administrativa' }
    ],
    commitments: [
      { id: 'com-0002-a', date: '2026-04-02', type: 'requisition', folio: 'REQ-2026-0221', supplier: 'Vehículos Especiales Frontera', amount: 9300000, status: 'in_review' },
      { id: 'com-0002-b', date: '2026-05-14', type: 'purchase_order', folio: 'PED-2026-0090', supplier: 'Equipamiento Policial MX', amount: 1400000, status: 'draft' }
    ],
    documents: [
      { id: 'doc-0002-a', name: 'Justificación operativa de patrullas', type: 'DOCX', status: 'Cargado' },
      { id: 'doc-0002-b', name: 'Cotizaciones comparativas', type: 'XLSX', status: 'Pendiente de validación' }
    ],
    alerts: [
      { id: 'alert-0002-a', severity: 'critical', status: 'open', title: 'Sin compromiso formalizado', message: 'Existe procedimiento de compra, pero ningún compromiso formalizado afecta presupuesto.', date: '2026-06-18' },
      { id: 'alert-0002-b', severity: 'warning', status: 'open', title: 'Remanente alto', message: 'Más del 50% del recurso vigente sigue sin compromiso formal.', date: '2026-06-19' }
    ],
    timeline: [
      { id: 'tl-0002-a', date: '2026-02-01', type: 'created', title: 'Proyecto autorizado', description: 'Alta inicial para adquisición vehicular.', user: 'Presupuesto' },
      { id: 'tl-0002-b', date: '2026-04-02', type: 'procurement', title: 'Requisición enviada a revisión', description: 'Compras revisa especificaciones.', user: 'Compras' }
    ],
    audit: [
      { id: 'aud-0002-a', date: '2026-02-01 10:00', action: 'project.created', user: 'Presupuesto', detail: 'Creó proyecto CART-0002-2026' },
      { id: 'aud-0002-b', date: '2026-04-02 15:32', action: 'requisition.review', user: 'Compras', detail: 'Registró REQ-2026-0221 en revisión' }
    ]
  },
  {
    id: 'project-0003',
    internalFolio: 'CART-0003-2026',
    municipalFolio: 'MUN-SSPM-026-003',
    name: 'Sistema de videovigilancia para cruces estratégicos',
    fiscalYear: 2026,
    status: 'committed',
    area: 'C5 / Inteligencia',
    manager: 'Coordinación C5',
    location: 'Corredores viales prioritarios',
    objective: 'Instalar cámaras y nodos de comunicación en cruces con mayor incidencia.',
    initialAuthorizedAmount: 7600000,
    isMultiYear: true,
    startDate: '2026-01-10',
    endDate: '2026-09-30',
    movements: [
      { id: 'mov-0003-a', date: '2026-02-11', type: 'increase', amount: 600000, concept: 'Integración de analítica de video', user: 'Dirección Administrativa' },
      { id: 'mov-0003-b', date: '2026-05-01', type: 'adjustment', amount: 0, concept: 'Cambio de calendario de instalación', user: 'Jefatura Administrativa' }
    ],
    commitments: [
      { id: 'com-0003-a', date: '2026-03-09', type: 'contract', folio: 'CON-SSPM-2026-020', supplier: 'Visión Urbana Segura', amount: 4200000, status: 'formalized' },
      { id: 'com-0003-b', date: '2026-06-02', type: 'purchase_order', folio: 'PED-2026-0157', supplier: 'Visión Urbana Segura', amount: 2200000, status: 'formalized' }
    ],
    documents: [
      { id: 'doc-0003-a', name: 'Proyecto ejecutivo de cámaras', type: 'PDF', status: 'Validado' },
      { id: 'doc-0003-b', name: 'Anexo técnico de almacenamiento', type: 'PDF', status: 'Cargado' }
    ],
    alerts: [
      { id: 'alert-0003-a', severity: 'warning', status: 'open', title: 'Plurianual próximo a vencer', message: 'Proyecto plurianual con fecha de término cercana.', date: '2026-06-20' }
    ],
    timeline: [
      { id: 'tl-0003-a', date: '2026-01-10', type: 'created', title: 'Proyecto plurianual activo', description: 'Alta en cartera con ejecución 2026.', user: 'Presupuesto' },
      { id: 'tl-0003-b', date: '2026-03-09', type: 'commitment', title: 'Contrato de instalación', description: 'Contrato principal formalizado.', user: 'Compras' },
      { id: 'tl-0003-c', date: '2026-06-02', type: 'commitment', title: 'Pedido de nodos', description: 'Pedido adicional formalizado.', user: 'Compras' }
    ],
    audit: [
      { id: 'aud-0003-a', date: '2026-01-10 08:40', action: 'project.created', user: 'Presupuesto', detail: 'Creó proyecto CART-0003-2026' },
      { id: 'aud-0003-b', date: '2026-06-02 09:15', action: 'purchase_order.formalized', user: 'Compras', detail: 'Formalizó PED-2026-0157' }
    ]
  },
  {
    id: 'project-0004',
    internalFolio: 'CART-0004-2026',
    municipalFolio: 'MUN-SSPM-026-004',
    name: 'Rehabilitación de casetas de vigilancia',
    fiscalYear: 2026,
    status: 'authorized',
    area: 'Infraestructura',
    manager: 'Servicios Generales',
    location: 'Colonias Oriente',
    objective: 'Mejorar puntos fijos de vigilancia comunitaria.',
    initialAuthorizedAmount: 1850000,
    isMultiYear: false,
    startDate: '2026-03-01',
    endDate: '2026-08-30',
    movements: [],
    commitments: [],
    documents: [
      { id: 'doc-0004-a', name: 'Diagnóstico de casetas', type: 'PDF', status: 'Cargado' }
    ],
    alerts: [
      { id: 'alert-0004-a', severity: 'critical', status: 'open', title: 'Sin procedimiento adquisitivo', message: 'Proyecto autorizado sin requisición, contrato o pedido vinculado.', date: '2026-06-17' }
    ],
    timeline: [
      { id: 'tl-0004-a', date: '2026-03-01', type: 'created', title: 'Proyecto autorizado', description: 'Pendiente iniciar procedimiento.', user: 'Presupuesto' }
    ],
    audit: [
      { id: 'aud-0004-a', date: '2026-03-01 13:10', action: 'project.created', user: 'Presupuesto', detail: 'Creó proyecto CART-0004-2026' }
    ]
  },
  {
    id: 'project-0005',
    internalFolio: 'CART-0005-2026',
    municipalFolio: 'MUN-SSPM-026-005',
    name: 'Equipamiento de protección para elementos',
    fiscalYear: 2026,
    status: 'committed',
    area: 'Recursos Materiales',
    manager: 'Jefatura de Equipamiento',
    location: 'Almacén General SSPM',
    objective: 'Suministrar equipo de protección personal conforme a prioridades operativas.',
    initialAuthorizedAmount: 4300000,
    isMultiYear: false,
    startDate: '2026-01-22',
    endDate: '2026-07-31',
    movements: [
      { id: 'mov-0005-a', date: '2026-02-17', type: 'increase', amount: 300000, concept: 'Ampliación por chalecos adicionales', user: 'Dirección Administrativa' },
      { id: 'mov-0005-b', date: '2026-03-27', type: 'decrease', amount: -120000, concept: 'Reducción por cambio de especificación', user: 'Presupuesto' },
      { id: 'mov-0005-c', date: '2026-05-30', type: 'increase', amount: 90000, concept: 'Ajuste de tallas especiales', user: 'Presupuesto' }
    ],
    commitments: [
      { id: 'com-0005-a', date: '2026-03-04', type: 'contract', folio: 'CON-SSPM-2026-018', supplier: 'Seguridad Industrial del Norte', amount: 2650000, status: 'formalized' },
      { id: 'com-0005-b', date: '2026-06-03', type: 'purchase_order', folio: 'PED-2026-0164', supplier: 'Protección Balística MX', amount: 930000, status: 'formalized' }
    ],
    documents: [
      { id: 'doc-0005-a', name: 'Especificaciones técnicas de equipo', type: 'PDF', status: 'Validado' },
      { id: 'doc-0005-b', name: 'Contrato de suministro', type: 'PDF', status: 'Cargado' }
    ],
    alerts: [
      { id: 'alert-0005-a', severity: 'info', status: 'open', title: 'Alta variabilidad', message: 'Proyecto con tres movimientos financieros registrados.', date: '2026-06-10' }
    ],
    timeline: [
      { id: 'tl-0005-a', date: '2026-01-22', type: 'created', title: 'Alta de proyecto', description: 'Equipamiento autorizado.', user: 'Presupuesto' },
      { id: 'tl-0005-b', date: '2026-03-04', type: 'commitment', title: 'Contrato formalizado', description: 'Contrato de equipo de protección.', user: 'Compras' },
      { id: 'tl-0005-c', date: '2026-05-30', type: 'movement', title: 'Ampliación menor', description: 'Ajuste por tallas especiales.', user: 'Presupuesto' }
    ],
    audit: [
      { id: 'aud-0005-a', date: '2026-01-22 12:01', action: 'project.created', user: 'Presupuesto', detail: 'Creó proyecto CART-0005-2026' },
      { id: 'aud-0005-b', date: '2026-05-30 16:18', action: 'movement.created', user: 'Presupuesto', detail: 'Registró ampliación por $90,000' }
    ]
  },
  {
    id: 'project-0006',
    internalFolio: 'CART-0006-2026',
    municipalFolio: 'MUN-SSPM-026-006',
    name: 'Modernización de centro de capacitación policial',
    fiscalYear: 2026,
    status: 'redistributing',
    area: 'Academia SSPM',
    manager: 'Coordinación de Formación',
    location: 'Academia Municipal',
    objective: 'Actualizar aulas, simuladores y mobiliario para capacitación continua.',
    initialAuthorizedAmount: 3900000,
    isMultiYear: true,
    startDate: '2026-02-15',
    endDate: '2027-03-31',
    movements: [
      { id: 'mov-0006-a', date: '2026-04-10', type: 'decrease', amount: -250000, concept: 'Reducción inicial para priorización operativa', user: 'Dirección Administrativa' }
    ],
    commitments: [
      { id: 'com-0006-a', date: '2026-05-04', type: 'requisition', folio: 'REQ-2026-0310', supplier: 'Aulas Inteligentes MX', amount: 1200000, status: 'formalized' },
      { id: 'com-0006-b', date: '2026-06-11', type: 'contract', folio: 'CON-SSPM-2026-045', supplier: 'Simulación Táctica Integral', amount: 890000, status: 'in_review' }
    ],
    documents: [
      { id: 'doc-0006-a', name: 'Programa anual de capacitación', type: 'PDF', status: 'Validado' },
      { id: 'doc-0006-b', name: 'Solicitud de redistribución', type: 'PDF', status: 'Cargado' }
    ],
    alerts: [
      { id: 'alert-0006-a', severity: 'warning', status: 'open', title: 'Remanente pendiente', message: 'Existe saldo mayor al 20% pendiente de definición.', date: '2026-06-22' }
    ],
    timeline: [
      { id: 'tl-0006-a', date: '2026-02-15', type: 'created', title: 'Proyecto plurianual autorizado', description: 'Inicio de modernización académica.', user: 'Presupuesto' },
      { id: 'tl-0006-b', date: '2026-04-10', type: 'movement', title: 'Reducción registrada', description: 'Reducción para reorientación interna.', user: 'Dirección Administrativa' },
      { id: 'tl-0006-c', date: '2026-06-22', type: 'analysis', title: 'Marcado para redistribución', description: 'Remanente sujeto a definición.', user: 'Jefatura Administrativa' }
    ],
    audit: [
      { id: 'aud-0006-a', date: '2026-02-15 08:55', action: 'project.created', user: 'Presupuesto', detail: 'Creó proyecto CART-0006-2026' },
      { id: 'aud-0006-b', date: '2026-06-22 10:31', action: 'analysis.redistribution_flag', user: 'Jefatura Administrativa', detail: 'Marcó proyecto con remanente pendiente' }
    ]
  },
  {
    id: 'project-0007',
    internalFolio: 'CART-0007-2026',
    municipalFolio: 'MUN-SSPM-026-007',
    name: 'Licencias de analítica delictiva',
    fiscalYear: 2026,
    status: 'committed',
    area: 'Inteligencia Policial',
    manager: 'Unidad de Análisis',
    location: 'Centro de Inteligencia',
    objective: 'Contratar licenciamiento de software para análisis y priorización de incidencias.',
    initialAuthorizedAmount: 2100000,
    isMultiYear: false,
    startDate: '2026-01-05',
    endDate: '2026-12-31',
    movements: [
      { id: 'mov-0007-a', date: '2026-02-01', type: 'decrease', amount: -150000, concept: 'Ajuste por negociación de licencias', user: 'Presupuesto' }
    ],
    commitments: [
      { id: 'com-0007-a', date: '2026-02-25', type: 'contract', folio: 'CON-SSPM-2026-012', supplier: 'DataPol Analytics', amount: 2300000, status: 'formalized' }
    ],
    documents: [
      { id: 'doc-0007-a', name: 'Contrato de licenciamiento', type: 'PDF', status: 'Cargado' },
      { id: 'doc-0007-b', name: 'Opinión técnica de seguridad informática', type: 'PDF', status: 'Validado' }
    ],
    alerts: [
      { id: 'alert-0007-a', severity: 'critical', status: 'open', title: 'Compromiso excede monto vigente', message: 'El compromiso formalizado es mayor al monto vigente; requiere bloqueo o ajuste.', date: '2026-06-12' }
    ],
    timeline: [
      { id: 'tl-0007-a', date: '2026-01-05', type: 'created', title: 'Alta de proyecto', description: 'Licencias de analítica autorizadas.', user: 'Presupuesto' },
      { id: 'tl-0007-b', date: '2026-02-25', type: 'commitment', title: 'Contrato formalizado', description: 'Contrato excede monto vigente disponible.', user: 'Compras' },
      { id: 'tl-0007-c', date: '2026-06-12', type: 'alert', title: 'Alerta crítica', description: 'Detectado compromiso mayor al vigente.', user: 'Sistema demo' }
    ],
    audit: [
      { id: 'aud-0007-a', date: '2026-01-05 09:03', action: 'project.created', user: 'Presupuesto', detail: 'Creó proyecto CART-0007-2026' },
      { id: 'aud-0007-b', date: '2026-06-12 07:45', action: 'alert.created', user: 'Sistema demo', detail: 'Generó alerta por exceso de compromiso' }
    ]
  },
  {
    id: 'project-0008',
    internalFolio: 'CART-0008-2026',
    municipalFolio: 'MUN-SSPM-026-008',
    name: 'Construcción de arco lector vehicular',
    fiscalYear: 2026,
    status: 'concluded',
    area: 'Infraestructura Tecnológica',
    manager: 'Dir. Tecnologías',
    location: 'Acceso Sur',
    objective: 'Implementar arco de lectura vehicular para monitoreo de accesos estratégicos.',
    initialAuthorizedAmount: 5200000,
    isMultiYear: false,
    startDate: '2026-01-18',
    endDate: '2026-06-15',
    closedAt: '2026-06-20',
    movements: [
      { id: 'mov-0008-a', date: '2026-02-22', type: 'increase', amount: 200000, concept: 'Obra civil complementaria', user: 'Dirección Administrativa' },
      { id: 'mov-0008-b', date: '2026-06-10', type: 'decrease', amount: -50000, concept: 'Reducción por economía final', user: 'Presupuesto' }
    ],
    commitments: [
      { id: 'com-0008-a', date: '2026-03-03', type: 'contract', folio: 'CON-SSPM-2026-019', supplier: 'InfraTech Seguridad', amount: 5350000, status: 'formalized' }
    ],
    documents: [
      { id: 'doc-0008-a', name: 'Acta de entrega recepción', type: 'PDF', status: 'Validado' },
      { id: 'doc-0008-b', name: 'Cierre administrativo', type: 'PDF', status: 'Validado' }
    ],
    alerts: [
      { id: 'alert-0008-a', severity: 'success', status: 'resolved', title: 'Proyecto concluido', message: 'Proyecto cerrado con documentación completa.', date: '2026-06-20' }
    ],
    timeline: [
      { id: 'tl-0008-a', date: '2026-01-18', type: 'created', title: 'Proyecto iniciado', description: 'Alta en cartera.', user: 'Presupuesto' },
      { id: 'tl-0008-b', date: '2026-03-03', type: 'commitment', title: 'Contrato formalizado', description: 'Obra y tecnología contratadas.', user: 'Compras' },
      { id: 'tl-0008-c', date: '2026-06-20', type: 'closed', title: 'Proyecto concluido', description: 'Cierre administrativo validado.', user: 'Dirección Administrativa' }
    ],
    audit: [
      { id: 'aud-0008-a', date: '2026-01-18 14:22', action: 'project.created', user: 'Presupuesto', detail: 'Creó proyecto CART-0008-2026' },
      { id: 'aud-0008-b', date: '2026-06-20 13:12', action: 'project.closed', user: 'Dirección Administrativa', detail: 'Cerró proyecto con acta validada' }
    ]
  }
];
