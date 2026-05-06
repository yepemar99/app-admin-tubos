import database from '../../db/database';
import { toSqlServerUnicode } from '../utils/functions';

export async function listarTurnosService({
  page = 1,
  pageSize = 20,
  orderBy = 'id',
  orderDir = 'DESC',
}) {
  try {
    const conn = database.getConnection();

    const allowedOrderFields = ['id'];
    if (!allowedOrderFields.includes(orderBy)) orderBy = 'id';
    orderDir = orderDir.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    let orderSQL = `${orderBy} ${orderDir}`;

    const countQuery = `
    SELECT COUNT(*) AS total
    FROM Turnos
  `;
    const countResult = await conn.query(countQuery);
    const total = countResult[0]?.total || 0;

    const start = (page - 1) * pageSize + 1;
    const end = start + pageSize - 1;
    const selectQuery = `
    WITH TurnosCTE AS (
      SELECT *,
             ROW_NUMBER() OVER (ORDER BY ${orderSQL}) AS rn
      FROM Turnos
    )
    SELECT *
    FROM TurnosCTE
    WHERE rn BETWEEN ${start} AND ${end}
  `;
    const rows = await conn.query(selectQuery);
    return {
      data: rows.map((row) => ({
        id: row.id,
        horario: row.horario,
        created_at: row.created_at,
        updated_at: row.updated_at,
      })),
      total,
    };
  } catch (error) {
    console.error('Error listando turnos:', error.message);
    throw error;
  }
}

export async function crearTurnoService(turnoData) {
  try {
    const conn = database.getConnection();

    const query = `
        INSERT INTO Turnos
        (horario)
        VALUES (?)
      `;

    const values = [toSqlServerUnicode(turno.horario)];

    // Inserción en la base de datos
    const result = await conn.query(query, values);

    return { id: result };
  } catch (err) {
    console.error('Error creando Turno:', err.message);
    throw err;
  }
}

export async function actualizarTurnoService(data = { turno: null, id: '' }) {
  try {
    const conn = database.getConnection();
    const { turno, id } = data;

    if (!turno || !id) {
      throw new Error('Faltan datos o el id');
    }

    const query = `
          UPDATE Turnos
          SET
            horario = ?
          WHERE id = ?;
        `;

    const values = [toSqlServerUnicode(turno.horario), id];

    // Actualizacion en la base de datos
    const result = await conn.query(query, values);
    return { data: result };
  } catch (err) {
    console.error('Error actualizando turno:', err.message);
    throw err;
  }
}

export async function eliminarTurnoService(id = '') {
  try {
    if (!id) {
      throw new Error('ID de turno no proporcionado para eliminación.');
    }
    const conn = database.getConnection();
    const query = `DELETE FROM Turnos WHERE id = ?`;
    const result = await conn.query(query, [id]);
    console.log(
      `Turno con ID ${id} eliminada. Filas afectadas: ${result.affectedRows}`,
    );
    return result;
  } catch (err) {
    console.error('Error eliminando turno:', err.message);
    throw err;
  }
}
