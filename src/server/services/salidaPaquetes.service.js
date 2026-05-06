import database from '../../db/database';

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
