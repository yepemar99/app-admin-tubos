import { ipcMain } from 'electron';
import flejesController from '../controllers/flejes.controller';

export default function flejesRoutes() {
  ipcMain.handle('flejes:getAllForSelects', flejesController.getAllForSelects);
  ipcMain.handle(
    'flejes:getAllPlanesCorte',
    flejesController.getAllPlanesCorte,
  );
  ipcMain.handle('flejes:getAll', flejesController.listarFlejes);
  ipcMain.handle('flejes:create', flejesController.crearFleje);
  ipcMain.handle('flejes:update', flejesController.actualizarFleje);
  ipcMain.handle('flejes:delete', flejesController.eliminarFleje);
  ipcMain.handle('flejes:report', flejesController.report);
}
