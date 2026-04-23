import {
  actualizarBobinaService,
  crearBobinaService,
  eliminarBobinaService,
  informeBobinas,
  listarBobinasCortadasService,
  listarBobinasService,
} from '../services/bobinas.service';

const bobinasController = {
  async getAll(_, payload) {
    try {
      const { data, total } = await listarBobinasService(payload);
      return { success: true, data: data, total: total };
    } catch (error) {
      console.error('Error en bobinasController.getAll:', error);
      return { success: false, error: error.message };
    }
  },

  async getAllCortadas(_, payload) {
    try {
      const { data, total } = await listarBobinasCortadasService({
        ...payload,
      });
      return { success: true, data: data, total: total };
    } catch (error) {
      console.error('Error en bobinasController.getAllCortadas:', error);
      return { success: false, error: error.message };
    }
  },

  async create(_, payload) {
    try {
      const result = await crearBobinaService(payload);
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error en bobinasController.create:', error);
      return { success: false, error: error.message };
    }
  },

  async update(_, payload) {
    try {
      const result = await actualizarBobinaService(payload);
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error en bobinasController.update:', error);
      return { success: false, error: error.message };
    }
  },

  async delete(_, payload) {
    try {
      const result = await eliminarBobinaService(payload);
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error en bobinasController.delete:', error);
      return { success: false, error: error.message };
    }
  },

  async report(_, payload) {
    try {
      const result = await informeBobinas(payload);
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error en bobinasController.report:', error);
      return { success: false, error: error.message };
    }
  },
};

export default bobinasController;
