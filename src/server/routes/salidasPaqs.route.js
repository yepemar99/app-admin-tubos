import { ipcMain } from "electron";
import salidaPaquetesController from "../controllers/salidaPaquetes.controller";

export default function salidasPaqsRoutes() {
  ipcMain.handle("salidasPaqs:getAll", salidaPaquetesController.getAll);
  ipcMain.handle("salidasPaqs:create", salidaPaquetesController.create);
  ipcMain.handle("salidasPaqs:update", salidaPaquetesController.update);
  ipcMain.handle("salidasPaqs:delete", salidaPaquetesController.delete);
}
