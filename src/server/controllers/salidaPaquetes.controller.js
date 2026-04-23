import {
  actualizarSalidaPaquetes,
  crearSalidaPaquetes,
  eliminarSalidaPaquetes,
  listarSalidaPaquetes,
} from "../services/salidaPaquetes.service";

const salidaPaquetesController = {
  getAll: async (_, payload) => {
    try {
      const result = await listarSalidaPaquetes(payload);
      return { success: true, data: result.data, total: result.total };
    } catch (error) {
      console.error("Error en salidaPaquetesController.getAll:", error);
      return { success: false, error: error.message };
    }
  },

  create: async (_, payload) => {
    try {
      const result = await crearSalidaPaquetes(payload);
      return { success: true, data: result.data };
    } catch (error) {
      console.error("Error en salidaPaquetesController.create:", error);
      return { success: false, error: error.message };
    }
  },

  update: async (_, payload) => {
    try {
      const result = await actualizarSalidaPaquetes(payload);
      return { success: true, data: result.data };
    } catch (error) {
      console.error("Error en salidaPaquetesController.update:", error);
      return { success: false, error: error.message };
    }
  },

  delete: async (_, payload) => {
    try {
      const result = await eliminarSalidaPaquetes(payload.id);
      return { success: true, data: result.data };
    } catch (error) {
      console.error("Error en salidaPaquetesController.delete:", error);
      return { success: false, error: error.message };
    }
  },
};

export default salidaPaquetesController;
