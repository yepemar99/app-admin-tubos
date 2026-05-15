import {
  actualizarProdTuboService,
  crearProdTuboService,
  eliminarProdTuboService,
  listarProdTubosService,
} from '../services/prodTubos.service';

const prodTubosController = {
  async getAll(_, payload) {
    try {
      const result = await listarProdTubosService(payload);
      return { success: true, data: result.data, total: result.total };
    } catch (error) {
      console.error('Error en prodTubosController.getAll:', error);
      return { success: false, error: error.message };
    }
  },

  async create(_, payload) {
    try {
      const result = await crearProdTuboService(payload);
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error en prodTubosController.create:', error);
      return { success: false, error: error.message };
    }
  },

  async update(_, payload) {
    try {
      const result = await actualizarProdTuboService(payload);
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error en prodTubosController.update:', error);
      return { success: false, error: error.message };
    }
  },

  async delete(_, payload) {
    try {
      const result = await eliminarProdTuboService(payload?.id ?? payload);
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error en prodTubosController.delete:', error);
      return { success: false, error: error.message };
    }
  },
};

export default prodTubosController;
