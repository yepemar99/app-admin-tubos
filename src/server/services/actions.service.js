import { dialog } from "electron";
import database from "../../db/database";
import * as XLSX from "xlsx";
import fs from "fs";
import fse from "fs-extra";
import pathModule from "path";
import {
  columnMapping,
  dataQueries,
  tableMapping,
  unicodeColumns,
} from "../utils/constants";
import { toSqlServerUnicode } from "../utils/functions";
import { storagePath } from "../../utils/constants";

export async function seleccionarDirectorio() {
  try {
    const result = await dialog.showOpenDialog({
      title: "Selecciona una carpeta",
      properties: ["openDirectory"],
    });

    if (result.canceled) {
      return null;
    }

    return result.filePaths[0];
  } catch (err) {
    console.error("Error eliminando malla:", err.message);
    throw err;
  }
}

export async function seleccionarArchivo() {
  try {
    const result = await dialog.showOpenDialog({
      title: "Selecciona un archivo Excel",
      buttonLabel: "Seleccionar",
      filters: [{ name: "Excel Files", extensions: ["xlsx"] }],
      properties: ["openFile"],
    });
    if (result.canceled) return null;
    return result.filePaths[0];
  } catch (err) {
    console.error("Error eliminando malla:", err.message);
    throw err;
  }
}

export async function exportarDatos(data = { path: "", all: false }) {
  try {
    const conn = database.getConnection();
    const basePath = data?.path || "";

    if (!basePath) {
      throw new Error("Ruta inválida para exportar datos");
    }

    // 1. Crear la carpeta de exportación si no existe
    // Si data.all es true, quizás quieras una subcarpeta específica
    const folderName = data?.all ? "Exportacion_Completa" : "Exportacion_Excel";
    const exportPath = pathModule.join(basePath, folderName);

    if (!fs.existsSync(exportPath)) {
      fs.mkdirSync(exportPath, { recursive: true });
    }

    const copyDataQueries = !data?.all ? [dataQueries[0]] : dataQueries;

    const workbook = XLSX.utils.book_new();
    let totalRows = 0;

    for (const dataTable of copyDataQueries) {
      const result = await conn.query(dataTable.query);

      if (Array.isArray(result) && result.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(result);
        XLSX.utils.book_append_sheet(workbook, worksheet, dataTable.hoja);
        totalRows += result.length;
      }
    }

    if (workbook.SheetNames.length === 0) {
      throw new Error("No hay datos disponibles para exportar");
    }

    const excelFileName = !data?.all ? "mallas.xlsx" : "base_de_datos.xlsx";
    const excelPath = pathModule.join(exportPath, excelFileName);

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    fs.writeFileSync(excelPath, buffer);

    if (data?.all) {
      const rutaOrigenImagenes = pathModule.join(storagePath);
      const rutaDestinoImagenes = pathModule.join(exportPath, "imagenes");

      if (fs.existsSync(rutaOrigenImagenes)) {
        await fse.copy(rutaOrigenImagenes, rutaDestinoImagenes);
        console.log("Imágenes copiadas con éxito");
      } else {
        console.warn(
          "La carpeta de imágenes original no existe, saltando copia..."
        );
      }
    }

    return {
      success: true,
      folderPath: exportPath,
      excelFile: excelPath,
      rows: totalRows,
      imagesCopied: !!data?.all,
    };
  } catch (error) {
    console.error("Error exportando datos:", error.message);
    throw error;
  }
}

export async function importarDatosDesdeExcel(data = { filePath: "" }) {
  try {
    const conn = database.getConnection();
    const filePath = data?.filePath || "";
    if (!fs.existsSync(filePath)) throw new Error("El archivo no existe.");

    console.log("Desactivando restricciones de llaves foráneas...");
    await conn.query(
      "EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL'"
    );

    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });

    const tablesToClear = Object.values(tableMapping);
    for (const tableName of tablesToClear) {
      await conn.query(`DELETE FROM ${tableName}`);
      try {
        await conn.query(`DBCC CHECKIDENT ('${tableName}', RESEED, 0)`);
      } catch (e) {}
    }

    let totalImported = 0;

    for (const sheetName of workbook.SheetNames) {
      const tableName = tableMapping[sheetName];
      const mapping = columnMapping[sheetName];
      if (!tableName || !mapping) continue;

      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet);

      let identitySet = false;
      try {
        await conn.query(`SET IDENTITY_INSERT ${tableName} ON`);
        identitySet = true;
      } catch (e) {}

      for (const row of rows) {
        try {
          const dbRow = {};
          Object.keys(row).forEach((excelKey) => {
            const dbKey = mapping[excelKey];
            if (dbKey) {
              let value = row[excelKey];
              if (unicodeColumns.includes(dbKey) && typeof value === "string") {
                value = toSqlServerUnicode(value);
              }
              dbRow[dbKey] = value;
            }
          });

          if (Object.keys(dbRow).length === 0) continue;

          const columns = Object.keys(dbRow);
          const placeholders = columns.map(() => "?").join(", ");
          const sqlInsert = `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${placeholders})`;

          await conn.query(sqlInsert, Object.values(dbRow));
          totalImported++;
        } catch (err) {
          console.error(`Error en fila de ${tableName}:`, err.message);
        }
      }

      if (identitySet) {
        await conn.query(`SET IDENTITY_INSERT ${tableName} OFF`);
      }
    }

    console.log("Reactivando restricciones...");
    await conn.query(
      "EXEC sp_MSforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL'"
    );

    return { success: true, totalRows: totalImported };
  } catch (error) {
    // IMPORTANTE: Si algo falla, intentar reactivar las restricciones
    try {
      const conn = database.getConnection();
      await conn.query(
        "EXEC sp_MSforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL'"
      );
    } catch (e) {}

    console.error("Error crítico:", error);
    throw error;
  }
}

// Esta función debe estar expuesta a través de tu preload/IPC
export async function leerImagenDeRed(nombreImagen) {
  try {
    const rutaRed = pathModule.join(
      "\\\\DESKTOP-38CS798\\Users\\Wincc\\Documents\\Imagenes\\certificados",
      nombreImagen
    );

    if (fs.existsSync(rutaRed)) {
      const bitmap = fs.readFileSync(rutaRed);
      const extension = pathModule.extname(rutaRed).replace(".", "");
      return `data:image/${extension};base64,${Buffer.from(bitmap).toString("base64")}`;
    }
    return null;
  } catch (error) {
    console.error("Error leyendo de la red:", error);
    return null;
  }
}
