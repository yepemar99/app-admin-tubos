import database from "../../db/database";
export async function listarMaquinasService() {
  try {
    const conn = database.getConnection();
    const query = `
      SELECT id, nombre, maquina
      FROM Maquinas
      ORDER BY nombre ASC
    `;
    const rows = await conn.query(query);
    return {
      data: rows.map((row) => ({
        id: Number(row.id),
        nombre: row.nombre,
        maquina: row.maquina,
      })),
      total: rows.length,
    };
  } catch (error) {
    console.error("Error listando maquinas:", error.message);
    throw error;
  }
}
