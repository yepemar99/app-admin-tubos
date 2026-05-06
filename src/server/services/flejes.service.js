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
    pathModule.join(
      app.getAppPath(),
      'server',
      'plantillas',
      'informe_flejes.html',
    ),
    pathModule.join(__dirname, '..', 'plantillas', 'informe_flejes.html'),
  ];

  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    throw new Error('No se encontro la plantilla informe_flejes.html');
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
  return pathModule.join(resolvedDestination, `informe-bobinas-${stamp}.pdf`);
}

export async function listarTodosFlejesService({ calidad_id = null }) {
  try {
    const conn = database.getConnection();

    let whereClauses = ['1=1'];

    if (calidad_id && calidad_id !== 0) {
      whereClauses.push(`calidad_id = ${calidad_id}`);
    }
    const whereSQL = whereClauses.join(' AND ');
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM Flejes
      WHERE ${whereSQL}
    `;
    const countResult = await conn.query(countQuery);
    const total = countResult[0]?.total ? Number(countResult[0].total) : 0;

    const selectQuery = `
      WITH FlejesCTE AS (
        SELECT 
          id, 
          concepto, 
          creado,
          calidad_id, 
          ROW_NUMBER() OVER (ORDER BY creado DESC) AS rn
        FROM Flejes
        WHERE ${whereSQL}
      )
      SELECT *
      FROM FlejesCTE
    `;

    const rows = await conn.query(selectQuery);

    return {
      data: rows.map((row) => ({
        id: Number(row.id),
        concepto: row.concepto,
        creado: row.creado,
        calidad_id: row.calidad_id ? Number(row.calidad_id) : null,
      })),
      total,
    };
  } catch (error) {
    console.error('Error listando flejes:', error.message);
    throw error;
  }
}

export async function listarFlejesService({
  page = 1,
  pageSize = 20,
  orderBy = 'id',
  orderDir = 'DESC',
  searchTerm = '',
  calidad_id,
  activo,
} = {}) {
  try {
    const conn = database.getConnection();
    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.max(1, Number(pageSize) || 20);
    const offset = (safePage - 1) * safePageSize;

    const allowedOrderBy = {
      id: 'b.id',
      concepto: 'b.concepto',
      art_concepto: 'b.art_concepto',
      unidades: 'b.unidades',
      espesor: 'b.espesor',
      ancho: 'b.ancho',
      peso_medio: 'b.peso_medio',
      peso_total: 'b.peso_total',
      activo: 'b.activo',
      calidad: 'tc.nombre',
      creado: 'b.creado',
    };

    const safeOrderBy = allowedOrderBy[String(orderBy)] || 'b.id';
    const safeOrderDir =
      String(orderDir).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    let whereClauses = ['1=1'];

    if (searchTerm) {
      whereClauses.push(`
        (
          concepto LIKE '%${searchTerm}%'
          OR art_concepto LIKE '%${searchTerm}%'
        )
      `);
    }
    if (calidad_id && calidad_id !== 0)
      whereClauses.push(`calidad_id = ${Number(calidad_id)}`);
    if (activo !== undefined && activo !== null)
      whereClauses.push(`activo = ${activo ? 1 : 0}`);

    const whereSQL = whereClauses.join(' AND ');
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM Flejes
      WHERE ${whereSQL}
    `;
    const countResult = await conn.query(countQuery);
    const total = countResult[0]?.total ? Number(countResult[0].total) : 0;

    const hasFilters = Boolean(
      searchTerm ||
      (calidad_id && calidad_id !== 0) ||
      (activo !== undefined && activo !== null),
    );

    let orderBySQL;
    if (!hasFilters && safeOrderBy === 'b.id') {
      orderBySQL = `id DESC`;
    } else {
      const secondaryOrderCols = ['tc.nombre', 'b.espesor', 'b.ancho', 'b.id'];
      const orderParts = [];
      orderParts.push(`${safeOrderBy} ${safeOrderDir}`);
      for (const col of secondaryOrderCols) {
        if (col !== safeOrderBy && !orderParts.some((p) => p.startsWith(col))) {
          orderParts.push(`${col} ${safeOrderDir}`);
        }
      }
      orderBySQL = orderParts.join(', ');
    }

    const selectQuery = `
    WITH FlejesCTE AS (
      SELECT 
        id, 
        concepto,
        art_concepto,
        unidades,
        espesor,
        ancho,
        peso_medio,
        peso_total,
        activo,
        calidad_id,
        creado,
        ROW_NUMBER() OVER (ORDER BY creado DESC) AS rn
      FROM Flejes
      WHERE ${whereSQL} 
    )
    SELECT 
      b.*, 
      tc.nombre AS calidad_nombre
    FROM FlejesCTE b
    LEFT JOIN Tipos_Calidad tc ON b.calidad_id = tc.id
    ORDER BY ${orderBySQL}
    OFFSET ${offset} ROWS FETCH NEXT ${safePageSize} ROWS ONLY
  `;

    const rows = await conn.query(selectQuery);

    return {
      data: rows.map((row) => ({
        id: Number(row.id),
        concepto: row.concepto,
        art_concepto: row.art_concepto,
        unidades: Number(row.unidades),
        espesor: Number(row.espesor),
        ancho: Number(row.ancho),
        peso_medio: Number(row.peso_medio),
        peso_total: Number(row.peso_total),
        activo: Number(row.activo),
        calidad_id: row.calidad_id ? Number(row.calidad_id) : null,
        calidad: row.calidad_nombre || null,
        creado: row.creado,
      })),
      total,
    };
  } catch (error) {
    console.error('Error listando flejes:', error.message);
    throw error;
  }
}

export async function crearFlejeService({
  concepto,
  art_concepto,
  espesor,
  ancho,
  unidades,
  peso_total,
  peso_medio,
  activo,
  calidad_id,
}) {
  try {
    const conn = database.getConnection();
    const insertQuery = `
      INSERT INTO Flejes
      (concepto, art_concepto, espesor, ancho, unidades, peso_total, peso_medio, activo, calidad_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await conn.query(insertQuery, [
      concepto,
      art_concepto,
      espesor,
      ancho,
      unidades,
      peso_total,
      peso_medio,
      activo ? 1 : 0,
      calidad_id,
    ]);

    return {
      id: Number(result.insertId),
      concepto,
      art_concepto,
      espesor: Number(espesor),
      ancho: Number(ancho),
      unidades: Number(unidades),
      peso_total: Number(peso_total),
      peso_medio: Number(peso_medio),
      activo: Boolean(activo),
      calidad_id: calidad_id ? Number(calidad_id) : null,
      creado: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error creando fleje:', error.message);
    throw error;
  }
}

export async function actualizarFlejeService({
  id,
  fleje: {
    concepto,
    art_concepto,
    espesor,
    ancho,
    unidades,
    peso_total,
    peso_medio,
    activo,
    calidad_id,
  },
}) {
  try {
    const conn = database.getConnection();
    const updateQuery = `
      UPDATE Flejes
      SET concepto = ?, art_concepto = ?, espesor = ?, ancho = ?, unidades = ?, peso_total = ?, peso_medio = ?, activo = ?, calidad_id = ?
      WHERE id = ?    
    `;
    await conn.query(updateQuery, [
      concepto,
      art_concepto,
      espesor,
      ancho,
      unidades,
      peso_total,
      peso_medio,
      activo ? 1 : 0,
      calidad_id,
      id,
    ]);

    return {
      id: Number(id),
      concepto,
      art_concepto,
      espesor: Number(espesor),
      ancho: Number(ancho),
      unidades: Number(unidades),
      peso_total: Number(peso_total),
      peso_medio: Number(peso_medio),
      activo: Boolean(activo),
      calidad_id: calidad_id ? Number(calidad_id) : null,
    };
  } catch (error) {
    console.error('Error actualizando fleje:', error.message);
    throw error;
  }
}

export async function eliminarFlejeService(id) {
  try {
    const conn = database.getConnection();
    const deleteQuery = `
      DELETE FROM Flejes
      WHERE id = ?    
    `;
    await conn.query(deleteQuery, [id]);
    return { id: Number(id) };
  } catch (error) {
    console.error('Error eliminando fleje:', error.message);
    throw error;
  }
}

export async function listarFlejesPorCortesService({ corte_id } = {}) {
  try {
    const conn = database.getConnection();
    const query = `
      SELECT 
        fc.id,
        fc.plan_corte_id, 
        fc.num_flejes,
        fc.peso_unit_definido,
        fc.factor_proporcional_peso,
        fc.creado, 
        fc.fleje_id,
        f.concepto
      FROM Flejes_Plan_Corte fc
      JOIN Flejes f ON fc.fleje_id = f.id
      WHERE fc.plan_corte_id = ?
    `;
    const rows = await conn.query(query, [corte_id]);
    return {
      data: rows.map((row) => ({
        id: Number(row.id),
        plan_corte_id: Number(row.plan_corte_id),
        fleje_id: Number(row.fleje_id),
        num_flejes: Number(row.num_flejes),
        factor_proporcional_peso: Number(row.factor_proporcional_peso),
        peso_unit_definido: Number(row.peso_unit_definido),
        creado: row.creado,
        fleje_concepto: row.concepto,
      })),
      total: rows.length,
    };
  } catch (error) {
    console.error('Error listando flejes por corte:', error.message);
    throw error;
  }
}

export async function informeFlejes({ path: destinationPath, ids } = {}) {
  let reportWindow;

  try {
    const conn = database.getConnection();

    const whereClauses = ['1=1'];
    if (ids && Array.isArray(ids) && ids.length > 0) {
      const idsList = ids.map((id) => Number(id)).filter((id) => !isNaN(id));
      if (idsList.length > 0) {
        whereClauses.push(`b.id IN (${idsList.join(',')})`);
      }
    }

    const query = `
      SELECT 
        b.concepto, 
        b.unidades, 
        b.peso_medio,
        b.calidad_id,
        tc.nombre AS calidad_nombre
      FROM Flejes b
      LEFT JOIN Tipos_Calidad tc ON b.calidad_id = tc.id
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY b.creado DESC
    `;

    const rows = await conn.query(query);
    const reportRows = rows.map((row) => ({
      concepto: row.concepto,
      unidades: Number(row.unidades),
      peso: Number(row.unidades) * Number(row.peso_medio),
      calidad_nombre: row.calidad_nombre,
    }));

    const templatePath = resolveTemplatePath();
    const outputFilePath = resolveOutputFilePath(destinationPath);

    const totalUnidades = reportRows.reduce(
      (acc, row) => acc + Number(row.unidades || 0),
      0,
    );
    const totalPeso = reportRows.reduce(
      (acc, row) => acc + Number(row.peso || 0),
      0,
    );

    const fechaFooter = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const safeRows = reportRows.length
      ? reportRows
      : [{ concepto: 'Sin datos', unidades: 0, peso: 0 }];
    const rowsPerPage = ROWS_PER_PAGE_TEMPLATE;

    const pages = [];
    for (let i = 0; i < safeRows.length; i += rowsPerPage) {
      pages.push(safeRows.slice(i, i + rowsPerPage));
    }
    const totalPages = Math.max(1, pages.length);

    let html = fs.readFileSync(templatePath, 'utf-8');

    const pagesHtml = pages
      .map((pageRows, pageIndex) => {
        const rowsHtml = pageRows
          .map(
            (row) => `
        <tr>
          <td>${escapeHtml(row.concepto)}</td>
          <td class="text-left">${escapeHtml(row.calidad_nombre)}</td>
          <td class="text-right">${row.unidades}</td>
          <td class="text-right">${formatPeso(row.peso)}</td>
        </tr>`,
          )
          .join('');

        const showTotals = pageIndex === totalPages - 1;
        const pageBreakStyle =
          pageIndex === totalPages - 1
            ? ''
            : 'page-break-after: always; break-after: page;';

        return `
      <section class="pdf-page" style="min-height: 100%; display: flex; flex-direction: column; ${pageBreakStyle}">
        <div class="header">
          <h1>Inventario de Flejes en Dos hermanas</h1>
        </div>

        <table style="margin-bottom: 14px;">
          <thead>
            <tr>
              <th class="text-left">Concepto</th>
              <th class="text-left">Calidad</th>
              <th class="text-right">Unidades</th>
              <th class="text-right">Peso (Tn)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        ${
          showTotals
            ? `<div class="grand-total">\n          <span>Suma total de flejes en Dos Hermanas</span>\n          <div style="display: flex; gap: 50px">\n            <span>${totalUnidades}</span>\n            <span>${formatPeso(totalPeso)}</span>\n          </div>\n        </div>`
            : ''
        }

        <div class="report-footer" style="margin-top: auto; display: flex; justify-content: space-between; font-size: 12px; font-style: italic; border-top: 1px solid #ccc; padding-top: 5px;">
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
        rows: reportRows,
        totalUnidades,
        totalPeso,
      },
    };
  } catch (error) {
    console.error('Error obteniendo datos para el informe:', error);
    throw error;
  } finally {
    if (reportWindow && !reportWindow.isDestroyed()) {
      reportWindow.destroy();
    }
  }
}
