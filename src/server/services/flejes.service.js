import database from '../../db/database';
import { app, BrowserWindow } from 'electron';
import fs from 'fs';
import pathModule from 'path';
import { ROWS_PER_PAGE_TEMPLATE } from '../utils/constants';
import { orderQuery } from '../../utils/functions';

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
  return pathModule.join(resolvedDestination, `informe-flejes-${stamp}.pdf`);
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

    const hasFilters = Boolean(
      searchTerm ||
      (calidad_id && calidad_id !== 0) ||
      (activo !== undefined && activo !== null),
    );

    const safeOrderBy = orderBy
      ? allowedOrderBy[String(orderBy)]
      : !hasFilters
        ? 'b.id'
        : '';
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

    let orderBySQL = orderQuery({
      secondaryOrderCols: ['tc.nombre', 'b.espesor', 'b.ancho', 'b.id'],
      safeOrderBy,
      safeOrderDir,
    });

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

export async function listarFlejesPorCortesService({
  corte_id,
  orderBy = '',
  orderDir = 'ASC',
} = {}) {
  try {
    const conn = database.getConnection();

    let orderBySQL = orderQuery({
      secondaryOrderCols: [
        'tc.nombre',
        'f.espesor',
        'f.ancho',
        'f.concepto',
        'f.id',
      ],
      orderBy,
      orderDir,
    });

    const query = `
      SELECT 
        fc.id,
        fc.plan_corte_id, 
        fc.num_flejes,
        fc.peso_unit_definido,
        fc.factor_proporcional_peso,
        fc.creado, 
        fc.fleje_id,
        tc.nombre AS calidad,
        f.concepto,
        f.espesor,
        f.ancho
      FROM Flejes_Plan_Corte fc
      JOIN Flejes f ON fc.fleje_id = f.id
      LEFT JOIN Tipos_Calidad AS tc ON f.calidad_id = tc.id
      WHERE fc.plan_corte_id = ?
      ORDER BY ${orderBySQL}
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
        calidad: row.calidad,
        espesor: Number(row.espesor),
        ancho: Number(row.ancho),
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
        whereClauses.push(`f.id IN (${idsList.join(',')})`);
      }
    }
    whereClauses.push(`f.activo = 1`);
    whereClauses.push(`f.unidades > 0`);

    let orderBySQL = orderQuery({
      secondaryOrderCols: [
        'tc.nombre',
        'f.espesor',
        'f.ancho',
        'f.concepto',
        'f.id',
      ],
      safeOrderBy: 'tc.nombre',
      safeOrderDir: 'ASC',
    });
    const query = `
      SELECT 
        f.calidad_id,
        f.concepto, 
        f.unidades, 
        f.peso_medio,
        tc.nombre AS calidad_nombre
      FROM Flejes f
      LEFT JOIN Tipos_Calidad tc ON f.calidad_id = tc.id
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY ${orderBySQL}
    `;

    const rows = await conn.query(query);
    const reportRows = rows.map((row) => ({
      calidad_id: Number(row.calidad_id),
      calidad: row.calidad_nombre || 'N/A',
      concepto: row.concepto,
      unidades: Number(row.unidades),
      peso: Number(row.unidades) * Number(row.peso_medio),
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

        // Añadir filas del grupo
        for (const r of group.rows) {
          safeRows.push(r);
        }

        // Calcular subtotal del grupo
        const subtotalUnidades = group.rows.reduce(
          (acc, row) => acc + Number(row.unidades || 0),
          0,
        );
        const subtotalPeso = group.rows.reduce(
          (acc, row) => acc + Number(row.peso || 0),
          0,
        );

        safeRows.push({
          isSubtotal: true,
          calidad: group.calidad,
          concepto: '',
          unidades: subtotalUnidades,
          peso: subtotalPeso,
        });
      }
    } else {
      safeRows = [
        {
          isQualityHeader: true,
          calidad: 'Sin datos',
        },
        {
          calidad: 'Sin datos',
          concepto: '-',
          unidades: 0,
          peso: 0,
        },
      ];
    }
    const rowsPerPage = ROWS_PER_PAGE_TEMPLATE;
    const pageBreakSlack = 2;

    // Paginar contando el peso visual de cada fila
    // isQualityHeader = 1 línea, fila normal = 1 línea, isSubtotal = 3 líneas (espaciador + fila + espaciador)
    const pages = [];
    let currentPage = [];
    let currentWeight = 0;

    for (const row of safeRows) {
      let rowWeight = 1; // por defecto
      if (row.isSubtotal) {
        rowWeight = 1; // subtotal genera 3 filas HTML
      } else if (row.isQualityHeader) {
        rowWeight = 1;
      }

      // Si agregar esta fila excedería el límite, comenzar nueva página
      if (currentWeight + rowWeight > rowsPerPage && currentPage.length > 0) {
        pages.push(currentPage);
        currentPage = [];
        currentWeight = 0;
      }

      currentPage.push(row);
      currentWeight += rowWeight;
    }

    // Agregar la última página si tiene contenido
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    const totalPages = Math.max(1, pages.length);

    let html = fs.readFileSync(templatePath, 'utf-8');

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
          <td colspan="3" style="height: 6px; padding: 0; border: none;"></td>
        </tr>
        <tr class="subtotal-row" style="font-weight:700; background:#f4f4f4;">
          <td class="text-left">Subtotal de ${escapeHtml(row.calidad)}</td>
          <td class="text-right">${row.unidades}</td>
          <td class="text-right">${formatPeso(row.peso)}</td>
        </tr>
        <tr class="subtotal-spacer">
          <td colspan="3" style="height: 6px; padding: 0; border: none;"></td>
        </tr>`;
            }

            return `
        <tr>
          <td class="text-left">${escapeHtml(row.concepto)}</td>
          <td class="text-right">${row.unidades}</td>
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
          <h1>Inventario de Flejes en Dos hermanas</h1>
        </div>

        <table style="margin-bottom: 14px;">
          <thead>
            <tr>
              <th class="text-left" style="width: 60%">Concepto</th>
              <th class="text-right" style="width: 20%">Unidades</th>
              <th class="text-right" style="width: 20%">Peso (Tn)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        ${
          showTotals
            ? `<div class="grand-total">\n          <span>Suma total de flejes en Dos Hermanas</span>\n          <div class="grand-total-values">\n            <span>${totalUnidades}</span>\n            <span>${formatPeso(totalPeso)}</span>\n          </div>\n        </div>`
            : ''
        }

        <div class="footer" style="position: static; margin-top: auto;">
          <span>${escapeHtml(fechaFooter)}</span>
          <span>Página ${pageIndex + 1} de ${totalPages}</span>
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
