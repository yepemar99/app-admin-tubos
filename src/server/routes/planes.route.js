import { ipcMain } from "electron";
import planesController from "../controllers/planes.controller";

export default function planesRoutes() {
  ipcMain.handle("planes:getAll", planesController.getAll);
  ipcMain.handle(
    "planes:getFlejesPorCortes",
    planesController.getFlejesPorCortes,
  );
  ipcMain.handle("planes:create", planesController.create);
  ipcMain.handle("planes:update", planesController.update);
  ipcMain.handle("planes:delete", planesController.delete);
}
