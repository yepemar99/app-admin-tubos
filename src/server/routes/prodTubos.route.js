import { ipcMain } from 'electron';
import prodTubosController from '../controllers/prodTubos.controller';

export default function prodTubosRoutes() {
  ipcMain.handle('prodTubos:getAll', prodTubosController.getAll);
  ipcMain.handle('prodTubos:create', prodTubosController.create);
  ipcMain.handle('prodTubos:update', prodTubosController.update);
  ipcMain.handle('prodTubos:delete', prodTubosController.delete);
}
