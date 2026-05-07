import {
  actualizarTuboService,
  crearTuboService,
  eliminarTuboService,
  informeTubos,
  listarTiposTubosService,
  listarTodosTubosService,
  listarTubosService,
} from '../services/tubos.service';

const tubosController = {
  async listarTubos(_, payload) {
    try {
      const {
        page,
        pageSize,
        orderBy,
        orderDir,
        calidad_id,
        tipo_id,
        maquina_id,
        tubo_id,
        activo,
        searchTerm,
      } = payload;
      const result = await listarTubosService({
        page: Number(page) || 1,
        pageSize: Number(pageSize) || 20,
        orderBy: orderBy || '',
        orderDir: orderDir || '',
        calidad_id: calidad_id ? Number(calidad_id) : undefined,
        tipo_id: tipo_id ? Number(tipo_id) : undefined,
        maquina_id: maquina_id ? Number(maquina_id) : undefined,
        tubo_id: tubo_id ? Number(tubo_id) : undefined,
        searchTerm: searchTerm || '',
        activo:
          activo !== undefined
            ? activo === 'true' || activo === '1'
            : undefined,
      });
      return { success: true, data: result.data, total: result.total };
    } catch (error) {
      console.error('Error en tubosController.listarTubos:', error);
      return { success: false, error: error.message };
    }
  },

  async getAllForSelects(_, payload) {
    try {
      const { data, total } = await listarTodosTubosService(payload);
      return { success: true, data: data, total: total };
    } catch (error) {
      console.error('Error en tubosController.getAll:', error);
      return { success: false, error: error.message };
    }
  },

  async listarTiposTubos() {
    try {
      const result = await listarTiposTubosService();
      return { success: true, data: result.data, total: result.total };
    } catch (error) {
      console.error('Error en tubosController.listarTiposTubos:', error);
      return { success: false, error: error.message };
    }
  },

  async crearTubo(_, payload) {
    try {
      console.log('Payload en crearTubo:', payload);
      const result = await crearTuboService(payload);
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error en tubosController.crearTubo:', error);
      return { success: false, error: error.message };
    }
  },

  async actualizarTubo(_, payload) {
    try {
      console.log('Payload en crearTubo:', payload);
      const result = await actualizarTuboService(payload);
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error en tubosController.actualizarTubo:', error);
      return { success: false, error: error.message };
    }
  },

  async eliminarTubo(_, payload) {
    try {
      const result = await eliminarTuboService(payload);
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error en tubosController.eliminarTubo:', error);
      return { success: false, error: error.message };
    }
  },

  async report(_, payload) {
    try {
      const result = await informeTubos(payload);
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error en tubosController.report:', error);
      return { success: false, error: error.message };
    }
  },
};

export default tubosController;
