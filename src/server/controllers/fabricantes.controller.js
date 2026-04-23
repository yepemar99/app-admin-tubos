import { listarTodosFabricantesService } from "../services/fabricantes.service";

const fabricantesController = {
  async getAll(_) {
    try {
      const { data, total } = await listarTodosFabricantesService();
      return { success: true, data: data, total: total };
    } catch (error) {
      console.error("Error en fabricantesController.getAll:", error);
      return { success: false, error: error.message };
    }
  },
};

export default fabricantesController;
