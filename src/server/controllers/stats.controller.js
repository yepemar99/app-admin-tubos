import { obtenerEstadisticasService } from '../services/stats.service';

const statsController = {
  async getTubosStats(_, payload) {
    try {
      const result = await obtenerEstadisticasService(payload);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error en statsController.getTubosStats:', error);
      return { success: false, error: error.message };
    }
  },
};

export default statsController;
