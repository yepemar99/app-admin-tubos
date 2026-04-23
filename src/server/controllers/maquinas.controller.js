import { listarMaquinasService } from "../services/maquinas.service";

const maquinasController = {
  async listarMaquinas() {
    try {
      const { data, total } = await listarMaquinasService();
      return { success: true, data: data, total: total };
    } catch (error) {
      console.error("Error en maquinasController.getAll:", error);
      return { success: false, error: error.message };
    }
  },
};

export default maquinasController;
