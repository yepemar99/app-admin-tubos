import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('versions', {
  chrome: process.versions['chrome'],
  node: process.versions['node'],
  electron: process.versions['electron'],
});

contextBridge.exposeInMainWorld('api', {
  planes: {
    getAll: (payload) => ipcRenderer.invoke('planes:getAll', payload),
    getFlejesPorCortes: (id) =>
      ipcRenderer.invoke('planes:getFlejesPorCortes', id),
    create: (payload) => ipcRenderer.invoke('planes:create', payload),
    update: (payload) => ipcRenderer.invoke('planes:update', payload),
    delete: (payload) => ipcRenderer.invoke('planes:delete', payload),
  },
  fabricantes: {
    getAll: () => ipcRenderer.invoke('fabricantes:getAll'),
  },
  flejes: {
    getAll: (payload) => ipcRenderer.invoke('flejes:getAll', payload),
    getAllForSelects: (payload) =>
      ipcRenderer.invoke('flejes:getAllForSelects', payload),
    getAllPlanesCorte: (payload) =>
      ipcRenderer.invoke('flejes:getAllPlanesCorte', payload),
    create: (payload) => ipcRenderer.invoke('flejes:create', payload),
    update: (payload) => ipcRenderer.invoke('flejes:update', payload),
    delete: (payload) => ipcRenderer.invoke('flejes:delete', payload),
    report: (payload) => ipcRenderer.invoke('flejes:report', payload),
  },
  bobinas: {
    getAll: (payload) => ipcRenderer.invoke('bobinas:getAll', payload),
    getAllCortadas: (payload) =>
      ipcRenderer.invoke('bobinas:getAllCortadas', payload),
    report: (payload) => ipcRenderer.invoke('bobinas:report', payload),
    create: (payload) => ipcRenderer.invoke('bobinas:create', payload),
    update: (payload) => ipcRenderer.invoke('bobinas:update', payload),
    delete: (payload) => ipcRenderer.invoke('bobinas:delete', payload),
  },
  tubos: {
    getAll: (payload) => ipcRenderer.invoke('tubos:getAll', payload),
    getAllForSelects: (payload) =>
      ipcRenderer.invoke('tubos:getAllForSelects', payload),
    getTiposTubos: () => ipcRenderer.invoke('tubos:getTiposTubos'),
    report: (payload) => ipcRenderer.invoke('tubos:report', payload),
    create: (payload) => ipcRenderer.invoke('tubos:create', payload),
    update: (payload) => ipcRenderer.invoke('tubos:update', payload),
    delete: (payload) => ipcRenderer.invoke('tubos:delete', payload),
  },
  tiposCalidad: {
    getAll: () => ipcRenderer.invoke('tiposCalidad:getAll'),
  },
  maquinas: {
    getAll: () => ipcRenderer.invoke('maquinas:getAll'),
  },
  salidasPaqs: {
    getAll: (payload) => ipcRenderer.invoke('salidasPaqs:getAll', payload),
    create: (payload) => ipcRenderer.invoke('salidasPaqs:create', payload),
    update: (payload) => ipcRenderer.invoke('salidasPaqs:update', payload),
    delete: (payload) => ipcRenderer.invoke('salidasPaqs:delete', payload),
    report: (payload) => ipcRenderer.invoke('salidasPaqs:report', payload),
  },
  operarios: {
    getAll: () => ipcRenderer.invoke('operarios:getAll'),
  },
  stats: {
    getTubosStats: (payload) =>
      ipcRenderer.invoke('stats:getTubosStats', payload),
  },
  actions: {
    selectDirectory: () => ipcRenderer.invoke('select:directory'),
  },
});
