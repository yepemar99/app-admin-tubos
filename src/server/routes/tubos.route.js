import { ipcMain } from 'electron';
import tubosController from '../controllers/tubos.controller';

export default function tubosRoutes() {
  ipcMain.handle('tubos:getAll', tubosController.listarTubos);
  ipcMain.handle('tubos:getAllForSelects', tubosController.getAllForSelects);
  ipcMain.handle('tubos:getTiposTubos', tubosController.listarTiposTubos);
  ipcMain.handle('tubos:create', tubosController.crearTubo);
  ipcMain.handle('tubos:update', tubosController.actualizarTubo);
  ipcMain.handle('tubos:delete', tubosController.eliminarTubo);
  ipcMain.handle('tubos:report', tubosController.report);
}
