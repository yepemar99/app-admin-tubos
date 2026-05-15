import database from '../../db/database';
import { toSqlServerUnicode } from '../utils/functions';

function normalizeString(value) {
  return value != null ? String(value).trim() : '';
}

function buildHorario(entrada, salida) {
  const safeEntrada = normalizeString(entrada);
  const safeSalida = normalizeString(salida);

  if (!safeEntrada && !safeSalida) return '';
  if (!safeEntrada) return safeSalida;
  if (!safeSalida) return safeEntrada;

  return `${safeEntrada} - ${safeSalida}`;
}

export async function listarTurnosService() {
  try {
    const conn = database.getConnection();
    const selectQuery = `
    SELECT *
    FROM Turnos
  `;
    const rows = await conn.query(selectQuery);
    return {
      data: rows.map((row) => ({
        id: Number(row.id),
        entrada: row.entrada || '',
        salida: row.salida || '',
        horario: buildHorario(row.entrada, row.salida),
        prefijo: row.prefijo || '',
        creado: row.creado ? new Date(row.creado).toISOString() : null,
      })),
      total: rows.length,
    };
  } catch (error) {
    console.error('Error listando turnos:', error.message);
    throw error;
  }
}

export async function crearTurnoService(turnoData) {
  try {
    const conn = database.getConnection();
    const payload =
      turnoData?.turno && typeof turnoData.turno === 'object'
        ? turnoData.turno
        : turnoData || {};

    const entrada = normalizeString(
      payload.entrada || payload.horario?.split('-')?.[0],
    );
    const salida = normalizeString(
      payload.salida || payload.horario?.split('-')?.[1],
    );

    if (!entrada || !salida) {
      throw new Error(
        "Los campos 'entrada' y 'salida' son obligatorios para crear un turno.",
      );
    }

    const query = `
        INSERT INTO Turnos
        (entrada, salida)
        VALUES (?, ?)
      `;

    const values = [toSqlServerUnicode(entrada), toSqlServerUnicode(salida)];

    // Inserción en la base de datos
    const result = await conn.query(query, values);

    return {
      data: {
        id: Number(result?.[0]?.id) || Number(result?.insertId) || null,
        entrada,
        salida,
        horario: buildHorario(entrada, salida),
      },
    };
  } catch (err) {
    console.error('Error creando Turno:', err.message);
    throw err;
  }
}

export async function actualizarTurnoService(data = { turno: null, id: '' }) {
  try {
    const conn = database.getConnection();
    const { turno, id } = data;
    const payload = turno && typeof turno === 'object' ? turno : data || {};
    const entrada = normalizeString(
      payload.entrada || payload.horario?.split('-')?.[0],
    );
    const salida = normalizeString(
      payload.salida || payload.horario?.split('-')?.[1],
    );

    if (!id) {
      throw new Error('Faltan datos o el id');
    }

    if (!entrada || !salida) {
      throw new Error(
        "Los campos 'entrada' y 'salida' son obligatorios para actualizar un turno.",
      );
    }

    const query = `
          UPDATE Turnos
          SET
            entrada = ?,
            salida = ?
          WHERE id = ?;
        `;

    const values = [
      toSqlServerUnicode(entrada),
      toSqlServerUnicode(salida),
      id,
    ];

    // Actualizacion en la base de datos
    const result = await conn.query(query, values);
    return {
      data: {
        id: Number(id),
        entrada,
        salida,
        horario: buildHorario(entrada, salida),
      },
    };
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
