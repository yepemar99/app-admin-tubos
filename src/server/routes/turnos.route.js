import { ipcMain } from "electron";
import turnosController from "../controllers/turnos.controller";

export default function turnosRoutes() {
  ipcMain.handle("turnos:getAll", turnosController.getAll);
  ipcMain.handle("turnos:create", turnosController.create);
  ipcMain.handle("turnos:update", turnosController.update);
  ipcMain.handle("turnos:delete", turnosController.delete);
}
