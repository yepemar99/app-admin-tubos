import database from '../../db/database';

export async function listarTodosFabricantesService() {
  try {
    const conn = database.getConnection();

    // 1. Obtener el total
    const countQuery = `SELECT COUNT(*) AS total FROM Fabricantes`;
    const countResult = await conn.query(countQuery);
    const total = countResult[0]?.total || 0;

    // 2. Consulta con la sintaxis corregida
    const selectQuery = `
      WITH FabricantesCTE AS (
        SELECT *,
               ROW_NUMBER() OVER (ORDER BY creado) AS rn
        FROM Fabricantes
      )
      SELECT *
      FROM FabricantesCTE f
      ORDER BY f.nombre ASC
    `;

    const rows = await conn.query(selectQuery);

    return {
      data: rows.map((row) => ({
        id: Number(row.id),
        nombre: row.nombre,
        creado: row.creado,
      })),
      total,
    };
  } catch (error) {
    console.error('Error listando fabricantes:', error.message);
    throw error;
  }
}
