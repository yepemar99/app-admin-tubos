import { ipcMain } from "electron";
import maquinasController from "../controllers/maquinas.controller";

export default function maquinasRoutes() {
  ipcMain.handle("maquinas:getAll", maquinasController.listarMaquinas);
}
