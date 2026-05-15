import database from '../../db/database';
import { app, BrowserWindow } from 'electron';
import fs from 'fs';
import pathModule from 'path';
import { ROWS_PER_PAGE_TEMPLATE } from '../utils/constants';
import { orderQuery } from '../../utils/functions';
import {
  formatFechaSQL,
  normalizeNumber,
  normalizeString,
} from '../utils/functions';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatPeso(value = 0) {
  return `${Number(value).toFixed(2)} Tn`;
}

function resolveTemplatePath() {
  const candidates = [
    pathModule.join(
      app.getAppPath(),
      'src',
      'server',
      'plantillas',
      'informe.html',
    ),
    pathModule.join(app.getAppPath(), 'server', 'plantillas', 'informe.html'),
    pathModule.join(__dirname, '..', 'plantillas', 'informe.html'),
  ];

  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    throw new Error('No se encontro la plantilla informe.html');
  }

  return found;
}

function resolveOutputFilePath(destinationPath = '') {
  const resolvedDestination = destinationPath?.trim()
    ? pathModule.resolve(destinationPath)
    : app.getAppPath();

  const extension = pathModule.extname(resolvedDestination).toLowerCase();
  if (extension === '.pdf') {
    return resolvedDestination;
  }

  const stamp = new Date().toISOString().replace(/[.:]/g, '-');
  return pathModule.join(
    resolvedDestination,
    `informe-salidas-paquetes-${stamp}.pdf`,
  );
}

async function recalcularInventarioTubos({ salida_paq_id, tubo_id, num_paqs }) {
  const conn = database.getConnection();

  if (salida_paq_id) {
    const querySelectSalida = `
      SELECT tubo_id, num_paqs
      FROM Salidas_Paqs_Tubos
      WHERE id = ?
    `;
    const resultSelectSalida = await conn.query(querySelectSalida, [
      salida_paq_id,
    ]);
    const salida = resultSelectSalida[0];
    if (!salida) {
      throw new Error(
        'Salida de paquetes no encontrada para recalculo de inventario',
      );
    }
    const paquetesSumar = Number(salida.num_paqs || 0);

    const queryUpdateInventarioViejo = `UPDATE Tubos 
     SET num_paquetes = num_paquetes + ?, unidades = (num_paquetes + ?)*num_por_paq, peso_total = peso_unitario * (num_paquetes + ?)*num_por_paq
     WHERE id = ?
    `;

    await conn.query(queryUpdateInventarioViejo, [
      paquetesSumar,
      paquetesSumar,
      paquetesSumar,
      salida.tubo_id,
    ]);
  }

  if (tubo_id && Number(num_paqs) >= 0) {
    const paquetesRestar = Number(num_paqs || 0);
    const queryUpdateInventarioNuevo = `UPDATE Tubos 
     SET num_paquetes = CASE
           WHEN num_paquetes - ? < 0 THEN 0
           ELSE num_paquetes - ?
         END,
         unidades = CASE
           WHEN num_paquetes - ? < 0 THEN 0
           ELSE (num_paquetes - ?)*num_por_paq
         END,
         peso_total = CASE
           WHEN num_paquetes - ? < 0 THEN 0
           ELSE peso_unitario * (num_paquetes - ?)*num_por_paq
         END
     WHERE id = ?
    `;

    await conn.query(queryUpdateInventarioNuevo, [
      paquetesRestar,
      paquetesRestar,
      paquetesRestar,
      paquetesRestar,
      paquetesRestar,
      paquetesRestar,
      tubo_id,
    ]);
  }
}

export const listarSalidaPaquetes = async ({
  page = 1,
  pageSize = 20,
  orderBy = 'id',
  orderDir = 'DESC',
  searchTerm = '',
  operario_id = '',
  fechaInicial = '',
  fechaFinal = '',
} = {}) => {
  try {
    const conn = database.getConnection();
    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.max(1, Number(pageSize) || 20);
    const offset = (safePage - 1) * safePageSize;

    const allowedOrderBy = {
      id: 's.id',
      operario_id: 's.operario_id',
      tubo_id: 's.tubo_id',
      num_paqs: 's.num_paqs',
      creado: 's.creado',
    };

    const safeOrderBy = allowedOrderBy[String(orderBy)] || 's.creado';
    const safeOrderDir =
      String(orderDir).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const whereClauses = ['1=1'];
    const queryParams = [];

    if (searchTerm) {
      whereClauses.push('CAST(t.medida AS VARCHAR(100)) LIKE ?');
      queryParams.push(`%${String(searchTerm).trim()}%`);
    }

    const safeOperarioId = Number(operario_id) || 0;
    if (safeOperarioId > 0) {
      whereClauses.push('s.operario_id = ?');
      queryParams.push(safeOperarioId);
    }

    const hasFechaInicial = String(fechaInicial || '').trim();
    const hasFechaFinal = String(fechaFinal || '').trim();

    if (hasFechaInicial || hasFechaFinal) {
      let startDate = hasFechaInicial;
      let endDate = hasFechaFinal;

      if (startDate && !endDate) {
        endDate = new Date().toISOString().slice(0, 10);
      }

      if (!startDate && endDate) {
        const minDateQuery = `
          SELECT MIN(CAST(creado AS date)) AS fecha_minima
          FROM Salidas_Paqs_Tubos
        `;
        const minDateResult = await conn.query(minDateQuery);
        startDate = minDateResult[0]?.fecha_minima
          ? new Date(minDateResult[0].fecha_minima).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10);
      }

      whereClauses.push('CAST(s.creado AS date) BETWEEN ? AND ?');
      queryParams.push(startDate, endDate);
    }

    const whereSQL = whereClauses.join(' AND ');

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM Salidas_Paqs_Tubos s
      LEFT JOIN Operarios o ON s.operario_id = o.id
      LEFT JOIN Tubos t ON s.tubo_id = t.id
      WHERE ${whereSQL}
    `;
    const countResult = await conn.query(countQuery, queryParams);
    const total = countResult[0]?.total ? Number(countResult[0].total) : 0;

    const selectQuery = `
      SELECT s.id, s.operario_id, s.tubo_id, s.num_paqs, s.creado, s.observacion,
             o.nombre AS operario_nombre,
             o.apellido1 AS operario_apellido1,
              o.apellido2 AS operario_apellido2,
             t.medida AS tubo_medida,
             t.art_concepto AS tubo_concepto
      FROM Salidas_Paqs_Tubos s
      LEFT JOIN Operarios o ON s.operario_id = o.id
      LEFT JOIN Tubos t ON s.tubo_id = t.id
      WHERE ${whereSQL}
      ORDER BY ${safeOrderBy} ${safeOrderDir}
      OFFSET ${offset} ROWS FETCH NEXT ${safePageSize} ROWS ONLY
    `;
    const rows = await conn.query(selectQuery, queryParams);

    return {
      data: rows.map((row) => {
        return {
          id: Number(row.id),
          operario_id: Number(row.operario_id),
          operario_nombre: row.operario_nombre || 'N/A',
          operario_apellido1: row.operario_apellido1 || '',
          operario_apellido2: row.operario_apellido2 || '',
          tubo_id: Number(row.tubo_id),
          tubo_medida: row.tubo_medida || 'N/A',
          num_paqs: Number(row.num_paqs),
          creado: row.creado,
          tubo_concepto: row.tubo_concepto || 'N/A',
          observacion: row.observacion || '',
        };
      }),
      total,
    };
  } catch (error) {
    console.error('Error listando salida de paquetes:', error.message);
    throw error;
  }
};

export const informeSalidasPaquetesReport = async ({
  path: destinationPath,
  fechaInicial = '',
  fechaFinal = '',
  tubo_ids = [],
} = {}) => {
  let reportWindow;

  try {
    // Reusar la lógica de obtención de datos
    const result = await informeSalidasPaquetes({
      fechaInicial,
      fechaFinal,
      tubo_ids,
    });
    const safeRows = result.data || [];
    const totalPaquetes = result.totalPaquetes || 0;
    const totalPeso = result.totalPeso || 0;

    const templatePath = resolveTemplatePath();
    const outputFilePath = resolveOutputFilePath(destinationPath);

    const rowsPerPage = ROWS_PER_PAGE_TEMPLATE;
    const pageBreakSlack = 2;

    // Paginar contando el peso visual de cada fila
    const pages = [];
    let currentPage = [];
    let currentWeight = 0;

    for (const row of safeRows) {
      let rowWeight = 1;
      if (row.isSubtotal) rowWeight = 3;
      if (row.isQualityHeader) rowWeight = 1;

      if (currentWeight + rowWeight > rowsPerPage && currentPage.length > 0) {
        pages.push(currentPage);
        currentPage = [];
        currentWeight = 0;
      }

      currentPage.push(row);
      currentWeight += rowWeight;
    }

    if (currentPage.length > 0) pages.push(currentPage);
    const totalPages = Math.max(1, pages.length);

    let html = fs.readFileSync(templatePath, 'utf-8');

    const fechaFooter = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const pagesHtml = pages
      .map((pageRows, pageIndex) => {
        const rowsHtml = pageRows
          .map((row) => {
            if (row.isQualityHeader) {
              return `
        <tr class="quality-header-row">
          <td colspan="3" style="font-size: 13px; font-style: italic; font-weight: 700; border-bottom: 1px solid #000080; color: #000080;">
            Calidad: ${escapeHtml(row.calidad)}
          </td>
        </tr>`;
            }

            if (row.isSubtotal) {
              return `
        <tr class="subtotal-spacer">
          <td colspan="3" style="height: 8px; padding: 0; border: none;"></td>
        </tr>
        <tr class="subtotal-row" style="font-weight:700; background:#f4f4f4;">
          <td class="text-left">Subtotal de ${escapeHtml(row.calidad)}</td>
          <td class="text-right">${row.paquetes}</td>
          <td class="text-right">${formatPeso(row.peso)}</td>
        </tr>
        <tr class="subtotal-spacer">
          <td colspan="3" style="height: 8px; padding: 0; border: none;"></td>
        </tr>`;
            }

            return `
        <tr>
          <td class="text-left">${escapeHtml(row.medida)}</td>
          <td class="text-right">${row.paquetes}</td>
          <td class="text-right">${formatPeso(row.peso)}</td>
        </tr>`;
          })
          .join('');

        const showTotals = pageIndex === totalPages - 1;
        const pageBreakStyle =
          pageIndex === totalPages - 1
            ? ''
            : 'page-break-after: always; break-after: page;';

        return `
      <section class="pdf-page" style="min-height: 100%; display: flex; flex-direction: column; ${pageBreakStyle}">
        <div class="header">
          <h1>Informe de Salidas de Paquetes</h1>
        </div>

        <table style="margin-bottom: 14px;">
          <thead>
            <tr>
              <th class="text-left" style="width: 55%">Medida</th>
              <th class="text-right" style="width: 20%">Paquetes</th>
              <th class="text-right" style="width: 25%">Peso (Tn)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

                 ${
                   showTotals
                     ? `<table>
                <tfoot>
                  <tr class="grand-total">
                    <td class="text-left" style="width: 55%">Total general</td>
                    <td class="text-right" style="width: 20%">${totalPaquetes}</td>
                    <td class="text-right"  style="width: 25%">${formatPeso(totalPeso)}</td>
                  </tr>
                </tfoot>
              </table>`
                     : ''
                 }

        <div class="footer" style="position: static; margin-top: auto;">
          <span>${escapeHtml(fechaFooter)}</span>
          <span>Pagina ${pageIndex + 1} de ${totalPages}</span>
        </div>
      </section>`;
      })
      .join('');

    html = html.replace(/<body>[\s\S]*<\/body>/, `<body>${pagesHtml}</body>`);

    reportWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        sandbox: false,
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    await reportWindow.loadURL(
      `data:text/html;charset=UTF-8,${encodeURIComponent(html)}`,
    );

    const pdfBuffer = await reportWindow.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
      displayHeaderFooter: false,
      preferCSSPageSize: true,
      margins: {
        top: 0.4,
        bottom: 0.4,
        left: 0.4,
        right: 0.4,
      },
    });

    fs.mkdirSync(pathModule.dirname(outputFilePath), { recursive: true });
    fs.writeFileSync(outputFilePath, pdfBuffer);

    return {
      data: {
        filePath: outputFilePath,
        rows: safeRows,
        totalPaquetes,
        totalPeso,
      },
    };
  } catch (error) {
    console.error('Error generando informe PDF de salidas de paquetes:', error);
    throw error;
  } finally {
    if (reportWindow && !reportWindow.isDestroyed()) reportWindow.destroy();
  }
};

export const crearSalidaPaquetes = async ({
  operario_id,
  tubo_id,
  num_paqs,
  observacion,
  fecha,
}) => {
  try {
    await recalcularInventarioTubos({
      salida_paq_id: null,
      tubo_id,
      num_paqs,
    });

    const safeCreado = formatFechaSQL(fecha) || '';

    const conn = database.getConnection();
    const insertQuery = `
      INSERT INTO Salidas_Paqs_Tubos (operario_id, tubo_id, num_paqs, creado, observacion)
      VALUES (?, ?, ?,  ${safeCreado ? `'${safeCreado}'` : 'GETDATE()'}, ?)
    `;
    const result = await conn.query(insertQuery, [
      operario_id,
      tubo_id,
      num_paqs,
      observacion,
    ]);
    return { id: result.insertId };
  } catch (error) {
    console.error('Error creando salida de paquetes:', error.message);
    throw error;
  }
};

export const eliminarSalidaPaquetes = async (id) => {
  try {
    await recalcularInventarioTubos({
      salida_paq_id: id,
      tubo_id: null,
      num_paqs: null,
    });
    const conn = database.getConnection();
    const deleteQuery = `
      DELETE FROM Salidas_Paqs_Tubos
      WHERE id = ?
    `;
    await conn.query(deleteQuery, [id]);
    return { success: true };
  } catch (error) {
    console.error('Error eliminando salida de paquetes:', error.message);
    throw error;
  }
};

export const actualizarSalidaPaquetes = async ({ id, data }) => {
  try {
    await recalcularInventarioTubos({
      salida_paq_id: id,
      tubo_id: data.tubo_id,
      num_paqs: data.num_paqs,
    });
    const conn = database.getConnection();

    const fields = [];
    const values = [];

    const safeTuboId = normalizeNumber(data.tubo_id, null);
    if (safeTuboId !== null) {
      fields.push('tubo_id = ?');
      values.push(safeTuboId);
    }

    const safeOperarioId = normalizeNumber(data.operario_id, null);
    if (safeOperarioId !== null) {
      fields.push('operario_id = ?');
      values.push(safeOperarioId);
    }

    const safeObservacion = normalizeString(data.observacion, null);
    if (safeObservacion !== null) {
      fields.push('observacion = ?');
      values.push(safeObservacion);
    }

    const safeNumPaqs = normalizeNumber(data.num_paqs, null);
    if (safeNumPaqs !== null) {
      fields.push('num_paqs = ?');
      values.push(safeNumPaqs);
    }

    const safeCreado = formatFechaSQL(data.creado);
    if (safeCreado) {
      fields.push('creado = ?');
      values.push(safeCreado);
    }

    const updateQuery = `
      UPDATE Salidas_Paqs_Tubos
      SET ${fields.join(', ')}
      WHERE id = ?
    `;
    await conn.query(updateQuery, [...values, id]);
    return { success: true };
  } catch (error) {
    console.error('Error actualizando salida de paquetes:', error.message);
    throw error;
  }
};
