import database from '../../db/database';
import { app, BrowserWindow } from 'electron';
import fs from 'fs';
import pathModule from 'path';
import { ROWS_PER_PAGE_TEMPLATE } from '../utils/constants';

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
      SELECT s.id, s.operario_id, s.tubo_id, s.num_paqs, s.creado,
             o.nombre AS operario_nombre,
             o.apellido1 AS operario_apellido1,
              o.apellido2 AS operario_apellido2,
             t.medida AS tubo_medida
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
        };
      }),
      total,
    };
  } catch (error) {
    console.error('Error listando salida de paquetes:', error.message);
    throw error;
  }
};

export const informeSalidasPaquetes = async ({
  fechaInicial = '',
  fechaFinal = '',
  tubo_ids = [],
} = {}) => {
  try {
    const conn = database.getConnection();

    // Normalizar fechas
    let startDate = String(fechaInicial || '').trim();
    let endDate = String(fechaFinal || '').trim();

    // Si no hay fecha inicial, tomar la fecha mínima de la tabla
    if (!startDate) {
      const minDateQuery = `SELECT MIN(CAST(creado AS date)) AS fecha_minima FROM Salidas_Paqs_Tubos`;
      const minDateResult = await conn.query(minDateQuery);
      startDate = minDateResult[0]?.fecha_minima
        ? new Date(minDateResult[0].fecha_minima).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10);
    }

    // Si no hay fecha final, usar la fecha actual
    if (!endDate) {
      endDate = new Date().toISOString().slice(0, 10);
    }

    const whereClauses = ['1=1'];
    const params = [];

    whereClauses.push('CAST(s.creado AS date) BETWEEN ? AND ?');
    params.push(startDate, endDate);

    if (Array.isArray(tubo_ids) && tubo_ids.length > 0) {
      const ids = tubo_ids
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id));
      if (ids.length > 0) {
        whereClauses.push(`s.tubo_id IN (${ids.map(() => '?').join(',')})`);
        params.push(...ids);
      }
    }

    const whereSQL = whereClauses.join(' AND ');

    // Agrupar por tubo_id (obteniendo también la calidad) y luego reagrupar por calidad
    const query = `
      SELECT
        s.tubo_id,
        t.medida AS medida,
        t.peso_unitario AS peso_medio,
        t.calidad_id AS calidad_id,
        tc.nombre AS calidad_nombre,
        SUM(s.num_paqs) AS paquetes_sum
      FROM Salidas_Paqs_Tubos s
      LEFT JOIN Tubos t ON s.tubo_id = t.id
      LEFT JOIN Tipos_Calidad tc ON t.calidad_id = tc.id
      WHERE ${whereSQL}
      GROUP BY s.tubo_id, t.medida, t.peso_unitario, t.calidad_id, tc.nombre
      ORDER BY tc.nombre ASC, t.medida ASC
    `;

    const rows = await conn.query(query, params);

    // Construir filas de reporte por tubo incluyendo la calidad
    const reportRows = rows.map((row) => {
      const paquetes = Number(row.paquetes_sum || 0);
      const peso = paquetes * Number(row.peso_medio || 0);
      return {
        calidad_id: row.calidad_id != null ? Number(row.calidad_id) : null,
        calidad: row.calidad_nombre || 'N/A',
        tubo_id: Number(row.tubo_id),
        medida: row.medida || 'N/A',
        paquetes,
        peso,
      };
    });

    // Totales globales
    const totalPaquetes = reportRows.reduce((acc, r) => acc + r.paquetes, 0);
    const totalPeso = reportRows.reduce((acc, r) => acc + r.peso, 0);

    // Agrupar por calidad_id y añadir encabezado y subtotal por grupo
    let safeRows;
    if (reportRows.length) {
      const groups = new Map();
      for (const r of reportRows) {
        const key = r.calidad_id != null ? String(r.calidad_id) : '__null__';
        if (!groups.has(key)) {
          groups.set(key, { calidad: r.calidad || 'N/A', rows: [] });
        }
        groups.get(key).rows.push(r);
      }

      safeRows = [];
      for (const [, group] of groups) {
        safeRows.push({
          isQualityHeader: true,
          calidad: group.calidad,
        });

        for (const r of group.rows) {
          safeRows.push(r);
        }

        const subtotalPaquetes = group.rows.reduce(
          (acc, row) => acc + Number(row.paquetes || 0),
          0,
        );
        const subtotalPeso = group.rows.reduce(
          (acc, row) => acc + Number(row.peso || 0),
          0,
        );

        safeRows.push({
          isSubtotal: true,
          calidad: group.calidad,
          tubo_id: '',
          medida: '',
          paquetes: subtotalPaquetes,
          peso: subtotalPeso,
        });
      }
    } else {
      safeRows = [
        { isQualityHeader: true, calidad: 'Sin datos' },
        {
          calidad: 'Sin datos',
          tubo_id: '-',
          medida: '-',
          paquetes: 0,
          peso: 0,
        },
      ];
    }

    return {
      data: safeRows,
      totalPaquetes,
      totalPeso,
      fechaInicial: startDate,
      fechaFinal: endDate,
    };
  } catch (error) {
    console.error(
      'Error generando informe de salidas de paquetes:',
      error.message || error,
    );
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
            ? `<div class="grand-total">\n          <span>Suma total de salidas</span>\n          <div class="grand-total-values">\n            <span>${totalPaquetes}</span>\n            <span>${formatPeso(totalPeso)}</span>\n          </div>\n        </div>`
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
}) => {
  try {
    const conn = database.getConnection();
    const insertQuery = `
      INSERT INTO Salidas_Paqs_Tubos (operario_id, tubo_id, num_paqs)
      VALUES (?, ?, ?)
    `;
    const result = await conn.query(insertQuery, [
      operario_id,
      tubo_id,
      num_paqs,
    ]);
    return { id: result.insertId };
  } catch (error) {
    console.error('Error creando salida de paquetes:', error.message);
    throw error;
  }
};

export const eliminarSalidaPaquetes = async (id) => {
  try {
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
    const conn = database.getConnection();
    const updateQuery = `
      UPDATE Salidas_Paqs_Tubos
      SET operario_id = ?, tubo_id = ?, num_paqs = ?
      WHERE id = ?
    `;
    await conn.query(updateQuery, [
      data.operario_id,
      data.tubo_id,
      data.num_paqs,
      id,
    ]);
    return { success: true };
  } catch (error) {
    console.error('Error actualizando salida de paquetes:', error.message);
    throw error;
  }
};
