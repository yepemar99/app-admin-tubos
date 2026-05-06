import {
  actualizarFlejeService,
  crearFlejeService,
  eliminarFlejeService,
  informeFlejes,
  listarFlejesPorCortesService,
  listarFlejesService,
  listarTodosFlejesService,
} from '../services/flejes.service';

const flejesController = {
  async getAllForSelects(_, payload) {
    try {
      const { data, total } = await listarTodosFlejesService(payload);
      return { success: true, data: data, total: total };
    } catch (error) {
      console.error('Error en flejesController.getAll:', error);
      return { success: false, error: error.message };
    }
  },

  async getAllPlanesCorte(_, payload) {
    try {
      const { data, total } = await listarFlejesPorCortesService(payload);
      return {
        success: true,
        data: data,
        total: total,
      };
    } catch (error) {
      console.error('Error en flejesController.getAllPlanesCorte:', error);
      return { success: false, error: error.message };
    }
  },

  async listarFlejes(_, payload) {
    try {
      const { page, pageSize, orderBy, orderDir, calidad_id, activo } = payload;
      const result = await listarFlejesService({
        page: Number(page) || 1,
        pageSize: Number(pageSize) || 20,
        searchTerm: payload.searchTerm || '',
        orderBy: orderBy || 'creado',
        orderDir: orderDir || 'DESC',
        calidad_id: calidad_id ? Number(calidad_id) : undefined,
        activo:
          activo !== undefined
            ? activo === 'true' || activo === '1'
            : undefined,
      });
      return { success: true, data: result.data, total: result.total };
    } catch (error) {
      console.error('Error en flejesController.listarFlejes:', error);
      return { success: false, error: error.message };
    }
  },

  async crearFleje(_, payload) {
    try {
      const result = await crearFlejeService(payload);
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error en flejesController.crearFleje:', error);
      return { success: false, error: error.message };
    }
  },

  async actualizarFleje(_, payload) {
    try {
      console.log('Payload en actualizarFleje:', payload);
      const result = await actualizarFlejeService(payload);
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error en flejesController.actualizarFleje:', error);
      return { success: false, error: error.message };
    }
  },

  async eliminarFleje(_, payload) {
    try {
      const result = await eliminarFlejeService(payload);
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error en flejesController.eliminarFleje:', error);
      return { success: false, error: error.message };
    }
  },

  async report(_, payload) {
    try {
      const result = await informeFlejes(payload);
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error en flejesController.report:', error);
      return { success: false, error: error.message };
    }
  },
};

export default flejesController;
