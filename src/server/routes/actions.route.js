import { ipcMain } from "electron";
import actionsController from "../controllers/actions.controller";

export default function actionsRoute() {
  ipcMain.handle("select:directory", actionsController.selectDirectory);
  ipcMain.handle("select:file", actionsController.selectFile);
  ipcMain.handle("data:export", actionsController.exportData);
  ipcMain.handle("data:import", actionsController.importData);
  ipcMain.handle("image:read", actionsController.getImage);
}
