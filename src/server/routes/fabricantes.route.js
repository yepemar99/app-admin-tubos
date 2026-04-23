import { ipcMain } from "electron";
import fabricantesController from "../controllers/fabricantes.controller";

export default function fabricantesRoutes() {
  ipcMain.handle("fabricantes:getAll", fabricantesController.getAll);
}
