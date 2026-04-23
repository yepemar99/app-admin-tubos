import {
  actualizarTurnoService,
  crearTurnoService,
  eliminarTurnoService,
  listarTurnosService,
} from "../services/turnos.service";

const turnosController = {
  async getAll(_, payload) {
    try {
      const { data, total } = await listarTurnosService(payload);
      return { success: true, data: data, total: total };
    } catch (error) {
      console.error("Error en turnosController.getAll:", error);
      return { success: false, error: error.message };
    }
  },
  async delete(_, payload) {
    try {
      console.log("turnosController.delete called with payload:", payload);
      await eliminarTurnoService(payload.id);
      return { success: true };
    } catch (error) {
      console.error("Error en turnosController.delete:", error);
      return { success: false, error: error.message };
    }
  },
  async create(_, payload) {
    try {
      await crearTurnoService(payload);
      return { success: true };
    } catch (error) {
      console.error("Error en turnosController.create:", error);
      return { success: false, error: error.message };
    }
  },
  async update(_, payload) {
    try {
      await actualizarTurnoService(payload);
      return { success: true };
    } catch (error) {
      console.error("Error en turnosController.update:", error);
      return { success: false, error: error.message };
    }
  },
};

export default turnosController;
