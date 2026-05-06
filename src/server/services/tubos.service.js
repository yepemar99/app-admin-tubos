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
      'informe_tubos.html',
    ),
    pathModule.join(
      app.getAppPath(),
      'server',
      'plantillas',
      'informe_tubos.html',
    ),
    pathModule.join(__dirname, '..', 'plantillas', 'informe_tubos.html'),
  ];

  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    throw new Error('No se encontro la plantilla informe_tubos.html');
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
  return pathModule.join(resolvedDestination, `informe-tubos-${stamp}.pdf`);
}

export async function listarTodosTubosService({ calidad_id = null }) {
  try {
    const conn = database.getConnection();

    let whereClauses = ['1=1'];

    if (calidad_id && calidad_id !== 0) {
      whereClauses.push(`calidad_id = ${calidad_id}`);
    }
    const whereSQL = whereClauses.join(' AND ');
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM Tubos
      WHERE ${whereSQL}
    `;
    const countResult = await conn.query(countQuery);
    const total = countResult[0]?.total ? Number(countResult[0].total) : 0;

    const selectQuery = `
      WITH TubosCTE AS (
        SELECT 
          id, 
          medida, 
          creado,
          calidad_id, 
          ROW_NUMBER() OVER (ORDER BY creado DESC) AS rn
        FROM Tubos
        WHERE ${whereSQL} 
      )
      SELECT *
      FROM TubosCTE
    `;

    const rows = await conn.query(selectQuery);

    return {
      data: rows.map((row) => ({
        id: Number(row.id),
        medida: row.medida,
        creado: row.creado,
        calidad_id: row.calidad_id ? Number(row.calidad_id) : null,
      })),
      total,
    };
  } catch (error) {
    console.error('Error listando tubos:', error.message);
    throw error;
  }
}

export async function listarTiposTubosService() {
  try {
    const conn = database.getConnection();
    const query = `
      SELECT id, nombre
      FROM Tipos_Tubos
      ORDER BY nombre ASC
    `;
    const rows = await conn.query(query);
    return {
      data: rows.map((row) => ({
        id: Number(row.id),
        nombre: row.nombre,
      })),
      total: rows.length,
    };
  } catch (error) {
    console.error('Error listando tipos de tubos:', error.message);
    throw error;
  }
}

export async function listarTubosService({
  page = 1,
  pageSize = 20,
  orderBy = 'creado',
  orderDir = 'DESC',
  calidad_id,
  tipo_id,
  maquina_id,
  tubo_id,
  activo,
  searchTerm = '',
} = {}) {
  try {
    const conn = database.getConnection();
    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.max(1, Number(pageSize) || 20);
    const offset = (safePage - 1) * safePageSize;

    const allowedOrderBy = {
      id: 't.id',
      calidad: 'tc.nombre',
      tipo: 'tt.nombre',
      maquina: 'tt.nombre',
      art_concepto: 't.art_concepto',
      activo: 't.activo',
      ancho: 't.ancho',
      alto: 't.alto',
      longitud: 't.longitud',
      diametro: 't.diametro',
      espesor: 't.espesor',
      creado: 't.creado',
    };

    const safeOrderBy = allowedOrderBy[String(orderBy)] || 't.creado';
    const safeOrderDir =
      String(orderDir).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const whereClauses = ['1=1'];

    if (searchTerm) {
      whereClauses.push(`
        (
          t.medida LIKE '%${searchTerm}%'
          OR t.art_concepto LIKE '%${searchTerm}%'
        )
      `);
    }
    if (tubo_id && Number(tubo_id) > 0) {
      whereClauses.push(`t.id = ${Number(tubo_id)}`);
    }
    if (calidad_id && Number(calidad_id) !== 0) {
      whereClauses.push(`t.calidad_id = ${Number(calidad_id)}`);
    }
    if (tipo_id && Number(tipo_id) !== 0) {
      whereClauses.push(`t.tipo_id = ${Number(tipo_id)}`);
    }
    if (maquina_id && Number(maquina_id) !== 0) {
      whereClauses.push(`EXISTS (
        SELECT 1
        FROM Tubos_Maquinas tmf
        WHERE tmf.tubo_id = t.id
          AND tmf.maquina_id = ${Number(maquina_id)}
      )`);
    }
    if (activo !== undefined && activo !== null) {
      whereClauses.push(`t.activo = ${activo ? 1 : 0}`);
    }

    const whereSQL = whereClauses.join(' AND ');

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM Tubos t
      WHERE ${whereSQL}
    `;
    const countResult = await conn.query(countQuery);
    const total = countResult[0]?.total ? Number(countResult[0].total) : 0;

    const selectQuery = `
      SELECT
        t.*,
        tc.nombre AS calidad_nombre,
        tt.nombre AS tipo_nombre,
        tm_rel.maquinas_ids,
        tm_rel.maquinas_nombres,
        f.concepto AS fleje_concepto
      FROM Tubos t
      LEFT JOIN Tipos_Calidad tc ON t.calidad_id = tc.id
      LEFT JOIN Tipos_Tubos tt ON t.tipo_id = tt.id
      LEFT JOIN Flejes f ON t.fleje_id = f.id
      OUTER APPLY (
        SELECT
          STRING_AGG(CAST(tm.maquina_id AS VARCHAR(20)), ',') AS maquinas_ids,
          STRING_AGG(COALESCE(m.maquina, m.nombre), '||') AS maquinas_nombres
        FROM Tubos_Maquinas tm
        LEFT JOIN Maquinas m ON tm.maquina_id = m.id
        WHERE tm.tubo_id = t.id
      ) tm_rel
      WHERE ${whereSQL}
      ORDER BY ${safeOrderBy} ${safeOrderDir}
      OFFSET ${offset} ROWS FETCH NEXT ${safePageSize} ROWS ONLY
    `;

    const rows = await conn.query(selectQuery);

    return {
      data: rows.map((row) => {
        const maquinasIds = row.maquinas_ids
          ? String(row.maquinas_ids)
              .split(',')
              .map((value) => Number(value))
              .filter((value) => Number.isFinite(value) && value > 0)
          : [];

        const maquinasNombres = row.maquinas_nombres
          ? String(row.maquinas_nombres).split('||')
          : [];

        const maquinas = maquinasIds.map((id, index) => ({
          id,
          maquina: maquinasNombres[index] || 'N/A',
        }));

        return {
          id: Number(row.id),
          calidad_id: Number(row.calidad_id),
          calidad_nombre: row.calidad_nombre || 'N/A',
          tipo_id: Number(row.tipo_id),
          unidades: Number(row.unidades),
          num_paquetes: Number(row.num_por_paq),
          tipo_nombre: row.tipo_nombre || 'N/A',
          maquinas,
          maquina: maquinas.map((item) => item.maquina).join(', ') || 'N/A',
          fleje_id: row.fleje_id ? Number(row.fleje_id) : null,
          fleje_concepto: row.fleje_concepto || 'N/A',
          art_concepto: row.art_concepto,
          medida: row.medida,
          activo: Boolean(row.activo),
          ancho: Number(row.ancho),
          alto: Number(row.alto),
          longitud: Number(row.longitud),
          diametro: Number(row.diametro),
          espesor: Number(row.espesor),
          peso_unitario: Number(row.peso_unitario),
          peso_total: Number(row.peso_total),
          num_por_paq: Number(row.num_por_paq),
          alto_paq: Number(row.alto_paq),
          ancho_paq: Number(row.ancho_paq),
          creado: row.creado,
        };
      }),
      total,
    };
  } catch (error) {
    console.error('Error listando tubos:', error.message);
    throw error;
  }
}

export async function crearTuboService({
  calidad_id,
  tipo_id,
  maquina_ids,
  fleje_id,
  medida,
  art_concepto,
  activo,
  ancho,
  alto,
  longitud,
  diametro,
  espesor,
  peso_unitario,
  peso_total,
  unidades,
  num_por_paq,
  alto_paq,
  ancho_paq,
  num_paquetes,
}) {
  try {
    const conn = database.getConnection();
    const maquinasNormalizadas = Array.isArray(maquina_ids)
      ? [...new Set(maquina_ids.map((id) => Number(id)).filter((id) => id > 0))]
      : [];

    const maquina_id =
      maquinasNormalizadas.length > 0 ? maquinasNormalizadas[0] : null;

    const insertQuery = `
      INSERT INTO Tubos
      (calidad_id, tipo_id, fleje_id, medida, art_concepto, activo, ancho, alto, longitud, diametro, espesor, peso_unitario, peso_total, unidades, num_por_paq, alto_paq, ancho_paq, num_paquetes)
      OUTPUT INSERTED.id AS id
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await conn.query(insertQuery, [
      calidad_id,
      tipo_id,
      fleje_id || null,
      medida,
      art_concepto,
      activo ? 1 : 0,
      ancho,
      alto,
      longitud,
      diametro,
      espesor,
      peso_unitario,
      peso_total,
      unidades,
      num_por_paq,
      alto_paq,
      ancho_paq,
      num_paquetes,
    ]);

    const tuboId = Number(result?.[0]?.id || result?.insertId);
    if (!Number.isFinite(tuboId) || tuboId <= 0) {
      throw new Error('No se pudo obtener el ID del tubo creado.');
    }

    if (maquinasNormalizadas.length > 0) {
      const valuesPlaceholders = maquinasNormalizadas
        .map(() => '(?, ?)')
        .join(', ');
      const relationParams = maquinasNormalizadas.flatMap((mId) => [
        tuboId,
        mId,
      ]);

      await conn.query(
        `INSERT INTO Tubos_Maquinas (tubo_id, maquina_id) VALUES ${valuesPlaceholders}`,
        relationParams,
      );
    }

    return {
      id: tuboId,
      calidad_id: Number(calidad_id),
      tipo_id: Number(tipo_id),
      maquina_id: Number(maquina_id),
      maquina_ids: maquinasNormalizadas,
      fleje_id: fleje_id ? Number(fleje_id) : null,
      medida,
      art_concepto,
      activo: Boolean(activo),
      ancho: Number(ancho),
      alto: Number(alto),
      longitud: Number(longitud),
      diametro: Number(diametro),
      espesor: Number(espesor),
      peso_unitario: Number(peso_unitario),
      peso_total: Number(peso_total),
      unidades: Number(unidades),
      num_por_paq: Number(num_por_paq),
      alto_paq: Number(alto_paq),
      ancho_paq: Number(ancho_paq),
      num_paquetes: Number(num_paquetes),
      creado: new Date(),
    };
  } catch (error) {
    console.error('Error creando tubo:', error.message);
    throw error;
  }
}

export async function actualizarTuboService(
  id,
  {
    calidad_id,
    tipo_id,
    maquina_ids,
    fleje_id,
    medida,
    art_concepto,
    activo,
    ancho,
    alto,
    longitud,
    diametro,
    espesor,
    peso_unitario,
    peso_total,
    unidades,
    num_por_paq,
    alto_paq,
    ancho_paq,
  },
) {
  try {
    const conn = database.getConnection();
    const tuboId = Number(id);
    const maquinasNormalizadas = Array.isArray(maquina_ids)
      ? [
          ...new Set(
            maquina_ids.map((mId) => Number(mId)).filter((mId) => mId > 0),
          ),
        ]
      : [];

    const maquina_id =
      maquinasNormalizadas.length > 0 ? maquinasNormalizadas[0] : null;

    const updateQuery = `
      UPDATE Tubos
      SET calidad_id = ?, tipo_id = ?, fleje_id = ?, medida = ?, art_concepto = ?, activo = ?, ancho = ?, alto = ?, longitud = ?, diametro = ?, espesor = ?, peso_unitario = ?, peso_total = ?, unidades = ?, num_por_paq = ?, alto_paq = ?, ancho_paq = ?
      WHERE id = ?
    `;
    await conn.query(updateQuery, [
      calidad_id,
      tipo_id,
      fleje_id || null,
      medida,
      art_concepto,
      activo ? 1 : 0,
      ancho,
      alto,
      longitud,
      diametro,
      espesor,
      peso_unitario,
      peso_total,
      unidades,
      num_por_paq,
      alto_paq,
      ancho_paq,
      tuboId,
    ]);

    await conn.query(`DELETE FROM Tubos_Maquinas WHERE tubo_id = ?`, [tuboId]);

    if (maquinasNormalizadas.length > 0) {
      const valuesPlaceholders = maquinasNormalizadas
        .map(() => '(?, ?)')
        .join(', ');
      const relationParams = maquinasNormalizadas.flatMap((mId) => [
        tuboId,
        mId,
      ]);

      await conn.query(
        `INSERT INTO Tubos_Maquinas (tubo_id, maquina_id) VALUES ${valuesPlaceholders}`,
        relationParams,
      );
    }

    return {
      id: tuboId,
      calidad_id: Number(calidad_id),
      tipo_id: Number(tipo_id),
      maquina_id: Number(maquina_id),
      maquina_ids: maquinasNormalizadas,
      fleje_id: fleje_id ? Number(fleje_id) : null,
      medida,
      art_concepto,
      activo: Boolean(activo),
      ancho: Number(ancho),
      alto: Number(alto),
      longitud: Number(longitud),
      diametro: Number(diametro),
      espesor: Number(espesor),
      peso_unitario: Number(peso_unitario),
      peso_total: Number(peso_total),
      unidades: Number(unidades),
      num_por_paq: Number(num_por_paq),
      alto_paq: Number(alto_paq),
      ancho_paq: Number(ancho_paq),
      creado: new Date(),
    };
  } catch (error) {
    console.error('Error actualizando tubo:', error.message);
    throw error;
  }
}

export async function eliminarTuboService(id) {
  try {
    const conn = database.getConnection();
    const deleteQuery = `
      DELETE FROM Tubos
      WHERE id = ?
    `;
    await conn.query(deleteQuery, [id]);
    return { id: Number(id) };
  } catch (error) {
    console.error('Error eliminando tubo:', error.message);
    throw error;
  }
}

export async function informeTubos({ path: destinationPath, ids } = {}) {
  let reportWindow;

  try {
    const conn = database.getConnection();

    const whereClauses = ['1=1'];
    if (ids && Array.isArray(ids) && ids.length > 0) {
      const idsList = ids.map((id) => Number(id)).filter((id) => !isNaN(id));
      if (idsList.length > 0) {
        whereClauses.push(`t.id IN (${idsList.join(',')})`);
      }
    }

    const query = `
      SELECT
        t.medida,
        t.unidades,
        t.num_por_paq,
        t.peso_total,
        tc.nombre AS calidad_nombre
      FROM Tubos t
      LEFT JOIN Tipos_Calidad tc ON t.calidad_id = tc.id
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY t.creado DESC
    `;

    const rows = await conn.query(query);
    const reportRows = rows.map((row) => ({
      calidad: row.calidad_nombre || 'N/A',
      medida: row.medida || 'N/A',
      unidades: Number(row.unidades || 0),
      paquetes: Number(row.num_por_paq || 0),
      peso: Number(row.peso_total || 0),
    }));

    const templatePath = resolveTemplatePath();
    const outputFilePath = resolveOutputFilePath(destinationPath);

    const totalUnidades = reportRows.reduce(
      (acc, row) => acc + Number(row.unidades || 0),
      0,
    );
    const totalPaquetes = reportRows.reduce(
      (acc, row) => acc + Number(row.paquetes || 0),
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
      : [
          {
            calidad: 'Sin datos',
            medida: '-',
            unidades: 0,
            paquetes: 0,
            peso: 0,
          },
        ];
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
          <td class="text-left">${escapeHtml(row.calidad)}</td>
          <td class="text-left">${escapeHtml(row.medida)}</td>
          <td class="text-right">${row.unidades}</td>
          <td class="text-right">${row.paquetes}</td>
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
          <h1>Inventario de Tubos en Dos Hermanas</h1>
        </div>

        <table style="margin-bottom: 14px;">
          <thead>
            <tr>
              <th class="text-left" style="width: 25%">Calidad</th>
              <th class="text-left" style="width: 25%">Medida</th>
              <th class="text-right" style="width: 15%">Unidades</th>
              <th class="text-right" style="width: 15%">Paquetes</th>
              <th class="text-right" style="width: 20%">Peso (Tn)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        ${
          showTotals
            ? `<div class="grand-total">\n          <span>Suma total de tubos en Dos Hermanas</span>\n          <div class="grand-total-values">\n            <span>${totalUnidades} Uds.</span>\n            <span>${totalPaquetes} Paq.</span>\n            <span>${formatPeso(totalPeso)}</span>\n          </div>\n        </div>`
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
        rows: reportRows,
        totalUnidades,
        totalPaquetes,
        totalPeso,
      },
    };
  } catch (error) {
    console.error('Error obteniendo datos para el informe de tubos:', error);
    throw error;
  } finally {
    if (reportWindow && !reportWindow.isDestroyed()) {
      reportWindow.destroy();
    }
  }
}
