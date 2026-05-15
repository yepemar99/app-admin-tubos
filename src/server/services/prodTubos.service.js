import database from '../../db/database';
import { orderQuery } from '../../utils/functions';
import {
  formatFechaSQL,
  normalizeDate,
  normalizeNumber,
  normalizeString,
} from '../utils/functions';

const obtenerProdTuboPorId = async (id) => {
  const conn = database.getConnection();
  const query = `
    SELECT
      pt.id,
      pt.cant_tubos_buenos,
      pt.cant_tubos_malos,
      pt.tubo_id,
      t.fleje_id,
      t.peso_unitario,
      f.peso_total
    FROM dbo.Prod_Tubos pt
    LEFT JOIN dbo.Tubos t ON pt.tubo_id = t.id
    LEFT JOIN dbo.Flejes f ON t.fleje_id = f.id
    WHERE pt.id = ?
  `;
  const result = await conn.query(query, [id]);
  return result.length > 0 ? result[0] : null;
};

const recalcularInventarioTubo = async (
  prod_tubo,
  tubo_id,
  cant_tubos_buenos = 0,
) => {
  const conn = database.getConnection();
  if (prod_tubo) {
    const queryRestarInventarioViejo = `
      UPDATE dbo.Tubos
      SET unidades = CASE
            WHEN unidades - ? < 0 THEN 0
            ELSE unidades - ?
          END,
          num_paquetes = CASE
            WHEN (unidades - ?) < 0 THEN 0
            ELSE ISNULL((unidades - ?) / NULLIF(num_por_paq, 0), 0)
          END,
          peso_total = CASE
            WHEN peso_total - (unidades - ?)*peso_unitario < 0 THEN 0
            ELSE peso_total - (unidades - ?)*peso_unitario
          END
      WHERE id = ?
    `;

    const result = await conn.query(queryRestarInventarioViejo, [
      prod_tubo.cant_tubos_buenos,
      prod_tubo.cant_tubos_buenos,
      prod_tubo.cant_tubos_buenos,
      prod_tubo.cant_tubos_buenos,
      prod_tubo.cant_tubos_buenos,
      prod_tubo.cant_tubos_buenos,
      prod_tubo.tubo_id,
    ]);
  }
  if (tubo_id) {
    const querySumarInventarioNuevo = `
      UPDATE dbo.Tubos
      SET unidades = CASE
            WHEN unidades + ? < 0 THEN 0
            ELSE unidades + ?
          END,
          num_paquetes = CASE
            WHEN (unidades + ?) < 0 THEN 0
            ELSE ISNULL((unidades + ?) / NULLIF(num_por_paq, 0), 0)
          END,
          peso_total = CASE
            WHEN peso_total + (unidades + ?)*peso_unitario < 0 THEN 0
            ELSE peso_total + (unidades + ?)*peso_unitario
          END
      WHERE id = ?
    `;

    const result = await conn.query(querySumarInventarioNuevo, [
      cant_tubos_buenos,
      cant_tubos_buenos,
      cant_tubos_buenos,
      cant_tubos_buenos,
      cant_tubos_buenos,
      cant_tubos_buenos,
      tubo_id,
    ]);
  }
};

const recalcularInvetarioFleje = async (prod_tubo, tubo_id, cant_tubos = 0) => {
  const conn = database.getConnection();
  if (prod_tubo) {
    const querySumarInventarioViejo = `
      UPDATE dbo.Flejes
      SET peso_total = CASE
            WHEN peso_total + ? < 0 THEN 0
            ELSE peso_total + ?
          END,
          unidades = CASE
            WHEN unidades + ISNULL(CAST(ROUND((peso_total + ?)/NULLIF(peso_medio, 0), 0) AS INT), 0) < 0 THEN 0
            ELSE unidades + ISNULL(CAST(ROUND((peso_total + ?)/NULLIF(peso_medio, 0), 0) AS INT), 0)
          END
      WHERE id = ?
    `;
    console.log('querySumarInventarioViejo', querySumarInventarioViejo);

    const prod_tubo_cant_tubos =
      Number(prod_tubo.cant_tubos_buenos) + Number(prod_tubo.cant_tubos_malos);
    const prod_tubo_peso_total =
      (prod_tubo_cant_tubos * prod_tubo.peso_unitario) / 1000.0;
    console.log('values', [
      prod_tubo_peso_total,
      prod_tubo_peso_total,
      prod_tubo_peso_total,
      prod_tubo_peso_total,
      prod_tubo.fleje_id,
    ]);
    const result = await conn.query(querySumarInventarioViejo, [
      prod_tubo_peso_total,
      prod_tubo_peso_total,
      prod_tubo_peso_total,
      prod_tubo_peso_total,
      prod_tubo.fleje_id,
    ]);
  }
  if (tubo_id) {
    const querySelectTubo = `
      SELECT fleje_id, peso_unitario
      FROM dbo.Tubos
      WHERE id = ?
    `;
    const resultTubo = await conn.query(querySelectTubo, [tubo_id]);
    const tubo = resultTubo.length > 0 ? resultTubo[0] : null;
    const tubo_peso_total = (cant_tubos * tubo.peso_unitario) / 1000.0;

    const queryRestarInventarioNuevo = `
      UPDATE dbo.Flejes
      SET peso_total = CASE
            WHEN peso_total - ? < 0 THEN 0
            ELSE peso_total - ?
          END,
          unidades = CASE
            WHEN unidades - ISNULL(CAST(ROUND((peso_total - ?) / NULLIF(peso_medio, 0), 0) AS INT), 0) < 0 THEN 0
            ELSE unidades - ISNULL(CAST(ROUND((peso_total - ?) / NULLIF(peso_medio, 0), 0) AS INT), 0)
          END
      WHERE id = ?
    `;
    console.log('queryRestarInventarioNuevo', queryRestarInventarioNuevo);
    console.log('values', [
      tubo_peso_total,
      tubo_peso_total,
      tubo_peso_total,
      tubo_peso_total,
      tubo.fleje_id,
    ]);
    const result = await conn.query(queryRestarInventarioNuevo, [
      tubo_peso_total,
      tubo_peso_total,
      tubo_peso_total,
      tubo_peso_total,
      tubo.fleje_id,
    ]);
  }
};

export async function listarProdTubosService({
  page = 1,
  pageSize = 20,
  orderBy = 'creado',
  orderDir = 'DESC',
  searchTerm = '',
  id,
  calidad_id,
  operario_id,
  maquina_id,
  cant_tubos_buenos,
  cant_tubos_malos,
  creadoDesde,
  creadoHasta,
} = {}) {
  try {
    const conn = database.getConnection();
    const safePage = Math.max(1, normalizeNumber(page, 1));
    const safePageSize = Math.max(1, normalizeNumber(pageSize, 20));
    const offset = (safePage - 1) * safePageSize;

    const allowedOrderBy = {
      id: 'pt.id',
      tubo: 't2.art_concepto',
      lote: 'pt.lote',
      operario: 'o.apellido1',
      cantidad: 'pt.cant_tubos_buenos',
      paquetes: 'pt.cant_tubos_buenos / NULLIF(t2.num_por_paq, 0)',
      cant_tubos_buenos: 'pt.cant_tubos_buenos',
      cant_tubos_malos: 'pt.cant_tubos_malos',
      creado: 'pt.creado',
    };

    const safeOrderBy = allowedOrderBy[String(orderBy)] || 'pt.creado';
    const safeOrderDir =
      String(orderDir).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Caso especial: ordenar operario por apellido1, apellido2, nombre
    let orderSQL;
    if (String(orderBy) === 'operario') {
      orderSQL = orderQuery({
        secondaryOrderCols: [
          `o.apellido1 ${safeOrderDir}`,
          `o.apellido2 ${safeOrderDir}`,
          'pt.id',
        ],
        safeOrderBy,
        safeOrderDir,
      });
    } else {
      orderSQL = orderQuery({
        secondaryOrderCols: ['pt.id'],
        safeOrderBy,
        safeOrderDir,
      });
    }

    const whereClauses = ['1=1'];
    const queryParams = [];

    if (searchTerm) {
      whereClauses.push(`
        (
          t2.art_concepto LIKE '%${searchTerm}%'
        )
      `);
    }

    const safeId = normalizeNumber(id, null);
    if (safeId !== null && safeId > 0) {
      whereClauses.push('pt.id = ?');
      queryParams.push(safeId);
    }

    const safeTubosBuenos = normalizeNumber(cant_tubos_buenos, null);
    if (safeTubosBuenos !== null) {
      whereClauses.push('pt.cant_tubos_buenos = ?');
      queryParams.push(safeTubosBuenos);
    }

    const safeTubosMalos = normalizeNumber(cant_tubos_malos, null);
    if (safeTubosMalos !== null) {
      whereClauses.push('pt.cant_tubos_malos = ?');
      queryParams.push(safeTubosMalos);
    }

    const safeCreadoDesde = normalizeDate(creadoDesde);
    if (safeCreadoDesde) {
      whereClauses.push(`pt.creado >= ${safeCreadoDesde.toISOString()}`);
    }

    const safeCreadoHasta = normalizeDate(creadoHasta);
    if (safeCreadoHasta) {
      whereClauses.push(`pt.creado <= ${safeCreadoHasta.toISOString()}`);
    }

    if (calidad_id) {
      whereClauses.push(`t2.calidad_id = ${calidad_id}`);
    }

    if (operario_id) {
      whereClauses.push(`pt.operario_id = ${operario_id}`);
    }

    if (maquina_id) {
      whereClauses.push(`pt.maquina_id = ${maquina_id}`);
    }

    const whereSQL = whereClauses.join(' AND ');

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM dbo.Prod_Tubos pt
      LEFT JOIN dbo.Operarios AS o ON pt.operario_id = o.id
      LEFT JOIN dbo.Maquinas AS m ON pt.maquina_id = m.id
      LEFT JOIN dbo.Turnos AS t ON pt.turno_id = t.id
      LEFT JOIN dbo.Tubos AS t2 ON pt.tubo_id = t2.id
      WHERE ${whereSQL}
    `;

    const countResult = await conn.query(countQuery);
    const total = Number(countResult?.[0]?.total) || 0;

    const selectQuery = `
      SELECT
        pt.id,
        pt.cant_tubos_buenos,
        pt.cant_tubos_malos,
        pt.operario_id,
        pt.maquina_id,
        pt.turno_id,
        pt.tubo_id,
        o.nombre AS operario_nombre,
        o.apellido1 AS operario_apellido1,
        o.apellido2 AS operario_apellido2,
        m.maquina AS maquina_nombre,
        t.entrada AS turno_entrada,
        t.salida AS turno_salida,
        t2.art_concepto AS tubo_concepto,
        t2.num_por_paq AS tubo_num_por_paq,
        t2.calidad_id AS tubo_calidad_id,
        pt.concentracion_taladrina,
        pt.lote,
        pt.creado,
        pt.observacion
      FROM dbo.Prod_Tubos AS pt
      LEFT JOIN dbo.Operarios AS o ON pt.operario_id = o.id
      LEFT JOIN dbo.Maquinas AS m ON pt.maquina_id = m.id
      LEFT JOIN dbo.Turnos AS t ON pt.turno_id = t.id
      LEFT JOIN dbo.Tubos AS t2 ON pt.tubo_id = t2.id
      WHERE ${whereSQL}
      ORDER BY ${orderSQL}
      OFFSET ${offset} ROWS FETCH NEXT ${safePageSize} ROWS ONLY
    `;

    const rows = await conn.query(selectQuery, queryParams);

    return {
      data: rows.map((row) => {
        const paquetes = row.tubo_num_por_paq
          ? Number(row.cant_tubos_buenos) / Number(row.tubo_num_por_paq)
          : 0;
        return {
          id: Number(row.id),
          maquina_id: Number(row.maquina_id),
          operario_id: Number(row.operario_id),
          turno_id: Number(row.turno_id),
          tubo_id: Number(row.tubo_id),
          calidad_id: Number(row.tubo_calidad_id) || null,
          cant_tubos_buenos: Number(row.cant_tubos_buenos) || 0,
          cant_tubos_malos: Number(row.cant_tubos_malos) || 0,
          paqs_buenos: Number(paquetes.toFixed(2)),
          creado: row.creado ? new Date(row.creado).toISOString() : null,
          tubo: row.tubo_concepto || null,
          observacion: row.observacion || null,
          concentracion_taladrina: Number(row.concentracion_taladrina) || null,
          lote: row.lote || null,
          operario: row.operario_nombre
            ? `${row.operario_nombre} ${row.operario_apellido1 || ''} ${
                row.operario_apellido2 || ''
              }`.trim()
            : null,
          maquina_nombre: row.maquina_nombre || null,
          turno: `${row.turno_entrada ? new Date(row.turno_entrada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '??:??'} - ${row.turno_salida ? new Date(row.turno_salida).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '??:??'}`,
        };
      }),
      total,
    };
  } catch (error) {
    console.error('Error listando Prod_Tubos:', error.message);
    throw error;
  }
}

export async function crearProdTuboService({
  maquina_id,
  operario_id,
  turno_id,
  lote,
  tubo_id,
  concentracion_taladrina,
  observacion,
  cant_tubos_buenos,
  cant_tubos_malos,
  creado,
} = {}) {
  try {
    const conn = database.getConnection();
    const safeTubosBuenos = normalizeNumber(cant_tubos_buenos, null);
    const safeTubosMalos = normalizeNumber(cant_tubos_malos, null);

    if (safeTubosBuenos === null || safeTubosBuenos < 0) {
      throw new Error(
        "El campo 'cant_tubos_buenos' es obligatorio y debe ser un número válido.",
      );
    }

    if (safeTubosMalos === null || safeTubosMalos < 0) {
      throw new Error(
        "El campo 'cant_tubos_malos' es obligatorio y debe ser un número válido.",
      );
    }

    await recalcularInventarioTubo(null, tubo_id, safeTubosBuenos);
    await recalcularInvetarioFleje(
      null,
      tubo_id,
      safeTubosBuenos + safeTubosMalos,
    );

    const safeCreado = formatFechaSQL(creado) || '';

    const insertQuery = `
      INSERT INTO dbo.Prod_Tubos
      (lote, cant_tubos_buenos, cant_tubos_malos, creado, maquina_id, operario_id, turno_id, tubo_id, concentracion_taladrina, observacion)
      OUTPUT INSERTED.id AS id
      VALUES ('${String(lote || '')}', ${Number(safeTubosBuenos)}, ${Number(safeTubosMalos)}, ${safeCreado ? `'${safeCreado}'` : 'GETDATE()'}, ${Number(maquina_id)}, ${Number(operario_id)}, ${Number(turno_id)}, ${Number(tubo_id)}, ${Number(concentracion_taladrina) || 0}, '${String(observacion || '')}')
    `;

    const result = await conn.query(insertQuery);

    return {
      data: {
        id: Number(result?.[0]?.id) || null,
        cant_tubos_buenos: safeTubosBuenos,
        cant_tubos_malos: safeTubosMalos,
        creado: safeCreado,
        maquina_id: maquina_id,
        operario_id: operario_id,
        turno_id: turno_id,
        tubo_id: tubo_id,
        lote: lote,
        concentracion_taladrina: concentracion_taladrina,
        observacion: observacion,
      },
    };
  } catch (error) {
    console.error('Error creando Prod_Tubos:', error.message);
    throw error;
  }
}

export async function actualizarProdTuboService({
  id,
  cant_tubos_buenos,
  cant_tubos_malos,
  creado,
  maquina_id,
  operario_id,
  turno_id,
  tubo_id,
  concentracion_taladrina,
  observacion,
} = {}) {
  try {
    const conn = database.getConnection();
    const safeId = normalizeNumber(id, null);

    if (safeId === null || safeId <= 0) {
      throw new Error(
        "El campo 'id' es obligatorio para actualizar un registro de Prod_Tubos.",
      );
    }

    const fields = [];
    const values = [];

    const safeTubosBuenos = normalizeNumber(cant_tubos_buenos, null);
    if (safeTubosBuenos !== null) {
      fields.push('cant_tubos_buenos = ?');
      values.push(safeTubosBuenos);
    }

    const safeTubosMalos = normalizeNumber(cant_tubos_malos, null);
    if (safeTubosMalos !== null) {
      fields.push('cant_tubos_malos = ?');
      values.push(safeTubosMalos);
    }

    const safeCreado = formatFechaSQL(creado) || '';
    if (safeCreado) {
      fields.push(`creado = ${safeCreado ? `'${safeCreado}'` : 'GETDATE()'}`);
    }

    const safeMaquinaId = normalizeNumber(maquina_id, null);
    if (safeMaquinaId !== null) {
      fields.push('maquina_id = ?');
      values.push(safeMaquinaId);
    }

    const safeOperarioId = normalizeNumber(operario_id, null);
    if (safeOperarioId !== null) {
      fields.push('operario_id = ?');
      values.push(safeOperarioId);
    }

    const safeTurnoId = normalizeNumber(turno_id, null);
    if (safeTurnoId !== null) {
      fields.push('turno_id = ?');
      values.push(safeTurnoId);
    }

    const safeTuboId = normalizeNumber(tubo_id, null);
    if (safeTuboId !== null) {
      fields.push('tubo_id = ?');
      values.push(safeTuboId);
    }

    const safeConcentracionTaladrina = normalizeNumber(
      concentracion_taladrina,
      null,
    );
    if (safeConcentracionTaladrina !== null) {
      fields.push('concentracion_taladrina = ?');
      values.push(safeConcentracionTaladrina);
    }

    const safeObservacion = normalizeString(observacion, null);
    if (safeObservacion !== null) {
      fields.push('observacion = ?');
      values.push(safeObservacion);
    }

    if (fields.length === 0) {
      throw new Error('No se enviaron campos válidos para actualizar.');
    }

    values.push(safeId);

    await obtenerProdTuboPorId(safeId).then(async (prod_tubo) => {
      await recalcularInventarioTubo(
        prod_tubo,
        safeTubosBuenos,
        safeTubosMalos,
      );
      await recalcularInvetarioFleje(
        prod_tubo,
        safeTuboId,
        safeTubosBuenos + safeTubosMalos,
      );
    });

    const updateQuery = `
      UPDATE dbo.Prod_Tubos
      SET ${fields.join(', ')}
      WHERE id = ?
    `;

    await conn.query(updateQuery, values);

    return {
      data: {
        id: safeId,
        ...(safeTubosBuenos !== null
          ? { cant_tubos_buenos: safeTubosBuenos }
          : {}),
        ...(safeTubosMalos !== null
          ? { cant_tubos_malos: safeTubosMalos }
          : {}),
        ...(safeCreado ? { creado: safeCreado } : {}),
      },
    };
  } catch (error) {
    console.error('Error actualizando Prod_Tubos:', error.message);
    throw error;
  }
}

export async function eliminarProdTuboService(id) {
  try {
    const conn = database.getConnection();
    const safeId = normalizeNumber(id, null);

    await obtenerProdTuboPorId(safeId).then(async (prod_tubo) => {
      await recalcularInventarioTubo(prod_tubo, null, 0);
      await recalcularInvetarioFleje(prod_tubo, null, 0);
    });

    if (safeId === null || safeId <= 0) {
      throw new Error(
        "El campo 'id' es obligatorio para eliminar un registro de Prod_Tubos.",
      );
    }

    const deleteQuery = `
      DELETE FROM dbo.Prod_Tubos
      WHERE id = ?
    `;

    await conn.query(deleteQuery, [safeId]);

    return { data: { id: safeId } };
  } catch (error) {
    console.error('Error eliminando Prod_Tubos:', error.message);
    throw error;
  }
}
