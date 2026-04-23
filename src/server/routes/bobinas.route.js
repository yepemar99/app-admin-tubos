import { ipcMain } from 'electron';
import bobinasController from '../controllers/bobinas.controller';

export default function bobinasRoutes() {
  ipcMain.handle('bobinas:getAll', bobinasController.getAll);
  ipcMain.handle('bobinas:getAllCortadas', bobinasController.getAllCortadas);
  ipcMain.handle('bobinas:create', bobinasController.create);
  ipcMain.handle('bobinas:update', bobinasController.update);
  ipcMain.handle('bobinas:delete', bobinasController.delete);
  ipcMain.handle('bobinas:report', bobinasController.report);
}
