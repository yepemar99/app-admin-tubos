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
  return pathModule.join(resolvedDestination, `informe-bobinas-${stamp}.pdf`);
}

export async function listarBobinasService({
  page = 1,
  pageSize = 20,
  orderBy,
  orderDir,
  searchTerm = '',
  calidad_id,
  plan_id,
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
      activa: 'b.activa',
      calidad: 'tc.nombre',
      plan_id: 'b.plan_id',
      fabricante_id: 'b.fabricante_id',
      creado: 'b.creado',
    };

    const hasFilters = Boolean(
      searchTerm ||
      (calidad_id && Number(calidad_id) !== 0) ||
      (plan_id && Number(plan_id) !== 0) ||
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
      whereClauses.push(`activa = ${activo ? 1 : 0}`);

    const whereSQL = whereClauses.join(' AND ');
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM Bobinas
      WHERE ${whereSQL}
    `;
    const countResult = await conn.query(countQuery);
    const total = countResult[0]?.total ? Number(countResult[0].total) : 0;

    let orderBySQL = orderQuery({
      secondaryOrderCols: ['tc.nombre', 'b.concepto', 'b.id'],
      safeOrderBy,
      safeOrderDir,
    });

    const selectQuery = `
    WITH BobinasCTE AS (
      SELECT 
        id, 
        concepto,
        art_concepto,
        unidades,
        espesor,
        ancho,
        peso_medio,
        activa,
        calidad_id,
        fabricante_id,
        creado,
        ROW_NUMBER() OVER (ORDER BY creado DESC) AS rn
      FROM Bobinas
      WHERE ${whereSQL} 
    )
    SELECT 
      b.*, 
      tc.nombre AS calidad_nombre, 
      f.nombre AS fabricante_nombre
    FROM BobinasCTE b
    LEFT JOIN Tipos_Calidad tc ON b.calidad_id = tc.id
    LEFT JOIN Fabricantes f ON b.fabricante_id = f.id
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
        activa: Number(row.activa),
        calidad_id: row.calidad_id ? Number(row.calidad_id) : null,
        fabricante_id: row.fabricante_id ? Number(row.fabricante_id) : null,
        calidad: row.calidad_nombre || null,
        fabricante: row.fabricante_nombre || null,
        creado: row.creado,
      })),
      total,
    };
  } catch (error) {
    console.error('Error listando bobinas:', error.message);
    throw error;
  }
}

export async function crearBobinaService({
  concepto,
  art_concepto,
  unidades = 0,
  espesor,
  ancho,
  peso_medio,
  activa = true,
  calidad_id,
  fabricante_id,
  fabricante,
}) {
  try {
    const conn = database.getConnection();
    let resolvedFabricanteId =
      Number(fabricante_id) > 0 ? Number(fabricante_id) : null;
    const fabricanteNombre = String(fabricante || '').trim();

    if (!concepto || !art_concepto) {
      throw new Error(
        "Los campos 'concepto' y 'art_concepto' son obligatorios.",
      );
    }

    if (!calidad_id || calidad_id === 0) {
      throw new Error(
        "El campo 'calidad_id' es obligatorio y debe ser diferente de 0.",
      );
    }

    if (!espesor || !ancho || !peso_medio) {
      throw new Error(
        "Los campos 'espesor', 'ancho' y 'peso_medio' son obligatorios.",
      );
    }

    if (!resolvedFabricanteId && !fabricanteNombre) {
      throw new Error(
        'Debe seleccionar un fabricante existente o indicar un fabricante nuevo.',
      );
    }

    if (!resolvedFabricanteId && fabricanteNombre) {
      const fabricanteExistenteQuery = `
        SELECT TOP 1 id
        FROM Fabricantes
        WHERE LTRIM(RTRIM(nombre)) = LTRIM(RTRIM(?))
      `;
      const fabricanteExistente = await conn.query(fabricanteExistenteQuery, [
        fabricanteNombre,
      ]);

      if (fabricanteExistente?.[0]?.id) {
        resolvedFabricanteId = Number(fabricanteExistente[0].id);
      } else {
        const insertFabricanteQuery = `
          INSERT INTO Fabricantes (nombre)
          OUTPUT INSERTED.id AS id
          VALUES (?)
        `;
        const insertFabricanteResult = await conn.query(insertFabricanteQuery, [
          fabricanteNombre,
        ]);

        resolvedFabricanteId = Number(insertFabricanteResult?.[0]?.id);

        if (!resolvedFabricanteId) {
          throw new Error('No se pudo crear el fabricante.');
        }
      }
    }

    const insertQuery = `
      INSERT INTO Bobinas 
      (concepto, art_concepto, unidades, espesor, ancho, peso_medio, activa, calidad_id, fabricante_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await conn.query(insertQuery, [
      concepto,
      art_concepto,
      unidades,
      espesor,
      ancho,
      peso_medio,
      activa ? 1 : 0,
      calidad_id || null,
      resolvedFabricanteId || null,
    ]);

    return { data: result };
  } catch (error) {
    console.error('Error creando bobina:', error.message);
    throw error;
  }
}

export async function actualizarBobinaService({ id, bobina } = {}) {
  try {
    const conn = database.getConnection();
    const payloadToUpdate = { ...bobina };
    const fields = [];
    const values = [];
    const updatableFields = new Set([
      'concepto',
      'art_concepto',
      'unidades',
      'espesor',
      'ancho',
      'peso_medio',
      'activa',
      'calidad_id',
      'fabricante_id',
      'plan_id',
    ]);

    if (!id) {
      throw new Error(
        "El campo 'id' es obligatorio para actualizar una bobina.",
      );
    }

    if (!bobina || typeof bobina !== 'object') {
      throw new Error("El campo 'bobina' es obligatorio y debe ser un objeto.");
    }

    let resolvedFabricanteId =
      Number(payloadToUpdate?.fabricante_id) > 0
        ? Number(payloadToUpdate.fabricante_id)
        : null;
    const fabricanteNombre = String(payloadToUpdate?.fabricante || '').trim();

    if (!resolvedFabricanteId && fabricanteNombre) {
      const fabricanteExistenteQuery = `
        SELECT TOP 1 id
        FROM Fabricantes
        WHERE LTRIM(RTRIM(nombre)) = LTRIM(RTRIM(?))
      `;
      const fabricanteExistente = await conn.query(fabricanteExistenteQuery, [
        fabricanteNombre,
      ]);

      if (fabricanteExistente?.[0]?.id) {
        resolvedFabricanteId = Number(fabricanteExistente[0].id);
      } else {
        const insertFabricanteQuery = `
          INSERT INTO Fabricantes (nombre)
          OUTPUT INSERTED.id AS id
          VALUES (?)
        `;
        const insertFabricanteResult = await conn.query(insertFabricanteQuery, [
          fabricanteNombre,
        ]);

        resolvedFabricanteId = Number(insertFabricanteResult?.[0]?.id);

        if (!resolvedFabricanteId) {
          throw new Error('No se pudo crear el fabricante.');
        }
      }
    }

    if (resolvedFabricanteId) {
      payloadToUpdate.fabricante_id = resolvedFabricanteId;
    }

    delete payloadToUpdate.fabricante;
    delete payloadToUpdate.fabricante_nombre;
    delete payloadToUpdate.calidad;
    delete payloadToUpdate.calidad_nombre;

    for (const [key, value] of Object.entries(payloadToUpdate)) {
      if (key.toLowerCase() !== 'id' && updatableFields.has(key)) {
        const normalizedValue = key === 'activa' ? (value ? 1 : 0) : value;
        fields.push(`${key} = ?`);
        values.push(normalizedValue);
      }
    }

    if (fields.length === 0) {
      throw new Error('No hay campos válidos para actualizar la bobina.');
    }

    values.push(id);

    const updateQuery = `
    UPDATE Bobinas
    SET ${fields.join(', ')}
    WHERE id = ?
  `;

    await conn.query(updateQuery, values);
    return { data: { id, ...payloadToUpdate } };
  } catch (error) {
    console.error('Error actualizando bobina:', error.message);
    throw error;
  }
}

export async function eliminarBobinaService({ id } = {}) {
  try {
    const conn = database.getConnection();
    if (!id) {
      throw new Error("El campo 'id' es obligatorio para eliminar una bobina.");
    }
    const deleteQuery = `
      DELETE FROM Bobinas
      WHERE id = ?
    `;
    await conn.query(deleteQuery, [id]);
    return { data: { id } };
  } catch (error) {
    console.error('Error eliminando bobina:', error.message);
    throw error;
  }
}

export async function listarBobinasCortadasService({
  page = 1,
  pageSize = 20,
  orderBy = 'creado',
  orderDir = 'DESC',
  plan_id,
  bobina_id,
}) {
  try {
    const conn = database.getConnection();
    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.max(1, Number(pageSize) || 20);
    const offset = (safePage - 1) * safePageSize;

    const allowedOrderBy = {
      id: 'b.id',
      concepto: 'b.concepto',
      bobina_concepto: 'b.concepto',
      art_concepto: 'b.art_concepto',
      unidades: 'b.unidades',
      espesor: 'b.espesor',
      ancho: 'b.ancho',
      peso_medio: 'b.peso_medio',
      activa: 'b.activa',
      calidad_id: 'b.calidad_id',
      plan_id: 'b.plan_id',
      fabricante_id: 'b.fabricante_id',
      creado: 'b.creado',
    };

    const safeOrderBy = allowedOrderBy[String(orderBy)] || '';
    const safeOrderDir =
      String(orderDir).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    let whereClauses = ['1=1'];

    if (plan_id && plan_id !== 0)
      whereClauses.push(`bc.plan_corte_id = ${Number(plan_id)}`);
    if (bobina_id && bobina_id !== 0)
      whereClauses.push(`bc.bobina_id = ${Number(bobina_id)}`);

    const queryCount = `
      SELECT COUNT(*) AS total
      FROM Bobinas_Cortadas bc
      JOIN Bobinas b ON bc.bobina_id = b.id
      WHERE ${whereClauses.join(' AND ')}
    `;

    const countResult = await conn.query(queryCount);

    let orderBySQL = orderQuery({
      secondaryOrderCols: ['b.id', 'tc.nombre', 'b.concepto'],
      safeOrderBy,
      safeOrderDir,
    });

    const selectQuery = `
      SELECT 
        bc.id, bc.peso_real, bc.ancho_inicial, bc.ancho_final, 
        bc.espesor_inicial, bc.espesor_final, bc.plan_corte_id, 
        bc.bobina_id, bc.turno_id, bc.operario_id, bc.creado,
        b.ancho, b.espesor, b.peso_medio, 
        t.entrada, t.salida, 
        b.concepto, b.art_concepto,
        o.nombre, tc.nombre AS calidad
      FROM Bobinas_Cortadas bc
      JOIN Bobinas b ON bc.bobina_id = b.id
      JOIN Turnos t ON bc.turno_id = t.id
      JOIN Operarios o ON bc.operario_id = o.id
      LEFT JOIN Tipos_Calidad tc ON b.calidad_id = tc.id
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY ${orderBySQL}
      OFFSET ${offset} ROWS FETCH NEXT ${safePageSize} ROWS ONLY
    `;

    const rows = await conn.query(selectQuery);

    return {
      data: rows.map((row) => ({
        id: Number(row.id),
        calidad: row.calidad,
        peso_real: Number(row.peso_real),
        ancho_inicial: Number(row.ancho_inicial),
        bobina_concepto: row.concepto,
        bobina_art_concepto: row.art_concepto,
        ancho_final: Number(row.ancho_final),
        espesor_inicial: Number(row.espesor_inicial),
        espesor_final: Number(row.espesor_final),
        plan_corte_id: Number(row.plan_corte_id),
        bobina_id: Number(row.bobina_id),
        bobina_ancho: Number(row.ancho),
        bobina_espesor: Number(row.espesor),
        bobina_peso_medio: Number(row.peso_medio),
        turno_id: Number(row.turno_id),
        turno_entrada: row.entrada,
        turno_salida: row.salida,
        operario_id: Number(row.operario_id),
        operario_nombre: row.nombre,
        creado: row.creado,
      })),
      total: countResult[0]?.total ? Number(countResult[0].total) : 0,
    };
  } catch (error) {
    console.error('Error listando bobinas cortadas:', error.message);
    throw error;
  }
}

export async function informeBobinas({ path: destinationPath, ids } = {}) {
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
    whereClauses.push(`b.activa = 1`);
    whereClauses.push(`b.unidades > 0`);

    let orderBySQL = orderQuery({
      secondaryOrderCols: ['tc.nombre', 'b.concepto', 'b.id'],
      safeOrderBy: 'tc.nombre',
      safeOrderDir: 'ASC',
    });

    const query = `
      SELECT 
        b.calidad_id,
        b.concepto, 
        b.unidades, 
        b.peso_medio,
        tc.nombre AS calidad_nombre
      FROM Bobinas b
      LEFT JOIN Tipos_Calidad tc ON b.calidad_id = tc.id
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

        for (const r of group.rows) {
          safeRows.push(r);
        }

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
    const pages = [];
    let currentPage = [];
    let currentWeight = 0;

    for (const row of safeRows) {
      let rowWeight = 1;
      if (row.isSubtotal) {
        rowWeight = 1;
      } else if (row.isQualityHeader) {
        rowWeight = 1;
      }

      if (currentWeight + rowWeight > rowsPerPage && currentPage.length > 0) {
        pages.push(currentPage);
        currentPage = [];
        currentWeight = 0;
      }

      currentPage.push(row);
      currentWeight += rowWeight;
    }

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
          <td class="text-left" >Subtotal de ${escapeHtml(row.calidad)}</td>
          <td class="text-right" >${row.unidades}</td>
          <td class="text-right" >${formatPeso(row.peso)}</td>
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
          <h1>Inventario de Bobinas en Dos hermanas</h1>
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
                   ? `<table>
                <tfoot>
                  <tr class="grand-total">
                    <td class="text-left" style="width: 60%">Total general</td>
                    <td class="text-right" style="width: 20%">${totalUnidades}</td>
                    <td class="text-right"  style="width: 20%">${formatPeso(totalPeso)}</td>
                  </tr>
                </tfoot>
              </table>`
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
