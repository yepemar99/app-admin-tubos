import {
  exportarDatos,
  importarDatosDesdeExcel,
  leerImagenDeRed,
  seleccionarArchivo,
  seleccionarDirectorio,
} from '../services/actions.service';

const actionsController = {
  async selectDirectory() {
    try {
      const path = await seleccionarDirectorio();
      return { success: true, path: path };
    } catch (error) {
      console.error('Error en actionsController.selectDirectory:', error);
      return { success: false, error: error.message };
    }
  },
  async selectFile() {
    try {
      const filePath = await seleccionarArchivo();
      return { success: true, filePath: filePath };
    } catch (error) {
      console.error('Error en actionsController.selectFile:', error);
      return { success: false, error: error.message };
    }
  },
  async exportData(_, payload) {
    try {
      const result = await exportarDatos(payload);
      return {
        success: true,
        path: result?.filePath || '-',
        total: result?.total || 0,
      };
    } catch (error) {
      console.error('Error en actionsController.selectDirectory:', error);
      return { success: false, error: error.message };
    }
  },
  async importData(_, payload) {
    try {
      const result = await importarDatosDesdeExcel(payload);
      return {
        success: true,
        message: result?.message || '',
        totalRows: result?.totalRows || 0,
      };
    } catch (error) {
      console.error('Error en actionsController.selectDirectory:', error);
      return { success: false, error: error.message };
    }
  },
  async getImage(_, payload) {
    try {
      const result = await leerImagenDeRed(payload);
      return {
        success: true,
        image: result,
      };
    } catch (error) {
      console.error('Error en actionsController.getImage:', error);
      return { success: false, error: error.message };
    }
  },
};

export default actionsController;
