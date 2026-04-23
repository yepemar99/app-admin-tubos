import {
  actualizarPlanCorte,
  crearPlanCorte,
  eliminarPlanCorte,
  listarFlejesPorCortes,
  listarPlanesCorteService,
} from "../services/planesCorte.service";

const planesController = {
  async getAll(_, payload) {
    try {
      const { data, total } = await listarPlanesCorteService(payload);
      return { success: true, data: data, total: total };
    } catch (error) {
      console.error("Error en planesController.getAll:", error);
      return { success: false, error: error.message };
    }
  },
  async getFlejesPorCortes(_, payload) {
    try {
      const { data } = await listarFlejesPorCortes(payload);
      return { success: true, data: data };
    } catch (error) {
      console.error("Error en planesController.getFlejesPorCortes:", error);
      return { success: false, error: error.message };
    }
  },
  async delete(_, payload) {
    try {
      await eliminarPlanCorte(payload.id);
      return { success: true };
    } catch (error) {
      console.error("Error en planesController.delete:", error);
      return { success: false, error: error.message };
    }
  },
  async create(_, payload) {
    try {
      const result = await crearPlanCorte(payload);
      return { success: true, data: result };
    } catch (error) {
      console.error("Error en planesController.create:", error);
      return { success: false, error: error.message };
    }
  },
  async update(_, payload) {
    try {
      const result = await actualizarPlanCorte(payload);
      return { success: true, data: result };
    } catch (error) {
      console.error("Error en planesController.update:", error);
      return { success: false, error: error.message };
    }
  },
};

export default planesController;
