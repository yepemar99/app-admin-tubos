import { ipcMain } from 'electron';
import statsController from '../controllers/stats.controller';

export default function statsRoutes() {
  ipcMain.handle('stats:getTubosStats', statsController.getTubosStats);
}
