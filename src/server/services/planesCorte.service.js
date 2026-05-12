import database from '../../db/database';

export async function listarPlanesCorteService({
  page = 1,
  pageSize = 20,
  orderBy = 'id',
  orderDir = 'DESC',
  searchTerm = '',
} = {}) {
  const conn = database.getConnection();

  // Campos permitidos para ordenamiento normal
  const allowedOrderFields = ['creado'];
  if (!allowedOrderFields.includes(orderBy)) orderBy = 'creado';
  orderDir = orderDir.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  try {
    let whereClauses = ['1=1'];

    if (searchTerm) {
      whereClauses.push(`
        (
           id = ${isNaN(Number(searchTerm)) ? 'NULL' : Number(searchTerm)}
        )
      `);
    }

    const whereSQL = whereClauses.join(' AND ');

    // -------------------------------
    // ORDER BY dinámico
    // -------------------------------
    let orderSQL = `${orderBy} ${orderDir}`;

    // -------------------------------
    // Total de registros
    // -------------------------------
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM Planes_Corte
      WHERE ${whereSQL}
    `;

    const countResult = await conn.query(countQuery);
    const total = countResult[0]?.total || 0;

    // -------------------------------
    // Paginación con ROW_NUMBER
    // -------------------------------
    const start = (page - 1) * pageSize + 1;
    const end = start + pageSize - 1;

    const selectQuery = `
    WITH PlanesCorteCTE AS (
        SELECT 
            pc.*,
            (SELECT COUNT(*) 
            FROM Flejes_Plan_Corte fpc 
            WHERE fpc.plan_corte_id = pc.id) AS cantidad_flejes_cortes,
            ROW_NUMBER() OVER (ORDER BY pc.${orderSQL}) AS rn
        FROM Planes_Corte pc
        WHERE ${whereSQL}
    )
    SELECT *
    FROM PlanesCorteCTE
    WHERE rn BETWEEN ${start} AND ${end}
    `;

    const rows = await conn.query(selectQuery);

    return {
      data: rows.map((row) => ({
        id: Number(row.id),
        estado: row.estado,
        cantidad_flejes_cortes: row?.cantidad_flejes_cortes,
        ancho_estipulado: row?.ancho_estipulado,
        creado: row?.creado,
      })),
      total,
    };
  } catch (err) {
    console.error('Error listando planes de corte:', err.message);
    throw err;
  }
}

export async function listarFlejesPorCortes(plan_corte_id) {
  const conn = database.getConnection();

  try {
    const query = `
      SELECT 
        fpc.*,           
        f.concepto,
        f.calidad_id,
        f.ancho
      FROM Flejes_Plan_Corte AS fpc
      INNER JOIN Flejes AS f ON fpc.fleje_id = f.id
      WHERE fpc.plan_corte_id = ?
    `;
    const result = await conn.query(query, [plan_corte_id]);
    return { data: result };
  } catch (err) {
    console.error('Error listando flejes por corte:', err.message);
    throw err;
  }
}

export async function crearPlanCorte(planData) {
  if (
    !planData?.ancho_estipulado ||
    !planData?.flejes_cortes ||
    planData?.flejes_cortes.length == 0
  ) {
    throw 'Faltan datos!!!';
  }

  try {
    // Crear el plan
    const conn = database.getConnection();
    const query = `
      INSERT INTO Planes_Corte (ancho_estipulado)
      OUTPUT INSERTED.id
      VALUES (?)
    `;
    const values = [planData.ancho_estipulado];
    const resultPlan = await conn.query(query, values);
    const nuevoId = resultPlan[0]?.id;

    // Crear los flejes a cortar por el plan
    const flejes_cortes_insertar = planData?.flejes_cortes;
    const queryFlejesCorte = `
        INSERT INTO Flejes_Plan_Corte
        (plan_corte_id, fleje_id, num_flejes, peso_unit_definido, factor_proporcional_peso)
        VALUES (?, ?, ?, ?, ?)
    `;

    let cantidad = 0;
    for (const fleje_corte of flejes_cortes_insertar) {
      const valuesFlejesCorte = [
        nuevoId,
        fleje_corte?.fleje_id,
        fleje_corte?.num_flejes,
        fleje_corte?.peso_unit_definido,
        fleje_corte?.factor_proporcional_peso,
      ];

      await conn.query(queryFlejesCorte, valuesFlejesCorte);
      cantidad = cantidad + 1;
    }

    const result =
      resultPlan.length > 0
        ? { ...resultPlan[0], cantidad_flejes_cortes: cantidad }
        : null;

    return { data: result };
  } catch (err) {
    console.error('Error creando malla:', err.message);
    throw err;
  }
}

export async function actualizarPlanCorte(data = { plan: null, id: '' }) {
  try {
    const conn = database.getConnection();
    const { plan, id } = data;

    if (!plan || !id) {
      throw new Error('Faltan datos o el id');
    }

    if (!plan?.flejes_cortes || plan?.flejes_cortes.length === 0) {
      throw new Error('Tiene que insertar los flejes a cortar');
    }

    const queryFlejesViejos = `
        SELECT * FROM Flejes_Plan_Corte WHERE plan_corte_id = ${id}
    `;
    const resultFlejesViejos = await conn.query(queryFlejesViejos);

    const flejes_cortes_nuevos = plan?.flejes_cortes;
    const flejes_cortes_viejos = resultFlejesViejos;

    // Preparar queries
    const actualizar_fleje_corte_query = `
        UPDATE Flejes_Plan_Corte
        SET 
            num_flejes = ?, 
            peso_unit_definido = ?, 
            factor_proporcional_peso = ?
        WHERE id = ?;
    `;

    const insertar_fleje_corte_query = `
        INSERT INTO Flejes_Plan_Corte
        (plan_corte_id, fleje_id, num_flejes, peso_unit_definido, factor_proporcional_peso)
        VALUES (?, ?, ?, ?, ?);
    `;

    const eliminar_fleje_corte_query = `
        DELETE FROM Flejes_Plan_Corte 
        WHERE id = ?;
    `;

    // Obtener los flejes a actualizar, crear y eliminar
    let cantidad = 0;
    for (const f_c_n of flejes_cortes_nuevos) {
      const findFlejesViejos = flejes_cortes_viejos.find(
        (f_c_v) => f_c_v.id == f_c_n?.id,
      );
      console.log(
        'Fleje corte nuevo:',
        f_c_n,
        'Fleje corte viejo encontrado:',
        findFlejesViejos,
      );
      if (findFlejesViejos) {
        // Se debe actualizar
        console.log(`Fleje corte con ID ${f_c_n} encontrado. Se actualizará.`);
        const nuevos_valores = [
          f_c_n?.num_flejes,
          f_c_n?.peso_unit_definido,
          f_c_n?.factor_proporcional_peso,
          f_c_n?.id,
        ];
        await conn.query(actualizar_fleje_corte_query, nuevos_valores);
        console.log(`Fleje corte con ID ${f_c_n?.id} actualizado.`);
      } else {
        // Se debe crear
        const nuevos_valores = [
          id,
          f_c_n?.fleje_id,
          f_c_n?.num_flejes,
          f_c_n?.peso_unit_definido,
          f_c_n?.factor_proporcional_peso,
        ];
        await conn.query(insertar_fleje_corte_query, nuevos_valores);
        console.log(`Fleje corte con ID ${id} creado.`);
      }

      cantidad = cantidad + 1;
    }

    for (const f_c_v of flejes_cortes_viejos) {
      const findFlejesNuevos = flejes_cortes_nuevos.find(
        (f_c_n) => f_c_n.id == f_c_v.id,
      );
      if (!findFlejesNuevos) {
        // Se debe eliminar
        const valores = [f_c_v?.id];
        await conn.query(eliminar_fleje_corte_query, valores);
        console.log(`Fleje corte con ID ${f_c_v?.id} eliminado.`);
      }
    }

    console.log('Flejes corte nuevos:', flejes_cortes_nuevos);
    const query = `
        UPDATE Planes_Corte
        SET
          ancho_estipulado = ?
        WHERE id = ?;
      `;

    const values = [plan?.ancho_estipulado, id];
    console.log('Query a ejecutar:', query);
    console.log('Valores a ejecutar:', values);

    // Actualizacion en la base de datos
    const result = await conn.query(query, values);
    return {
      data:
        result && result.length > 0
          ? { ...result[0], cantidad_flejes_cortes: cantidad }
          : null,
    };
  } catch (err) {
    console.error('Error actualizando plan de corte:', err.message);
    throw err;
  }
}

export async function eliminarPlanCorte(id = '') {
  try {
    if (!id) {
      throw new Error('ID de plan de corte no proporcionado.');
    }

    const conn = database.getConnection();

    // Obtener todos los ids de los flejes por corte
    const queryFlejesCorte = `
        SELECT id 
        FROM Flejes_Plan_Corte 
        WHERE plan_corte_id = ?;
    `;

    const resultFlejesCorte = await conn.query(queryFlejesCorte, [id]);
    const idsFlejesCorte = resultFlejesCorte.map((fila) => fila.id);

    // Eliminar los flejes corte
    const queryEliminarFlejesCorte = `
        DELETE FROM Flejes_Plan_Corte
        WHERE id = ?
    `;

    for (const fleje_corte_id of idsFlejesCorte) {
      const values = [fleje_corte_id];
      await conn.query(queryEliminarFlejesCorte, values);
    }

    // Eliminar el Plan de Corte
    const query = `DELETE FROM Planes_Corte WHERE id = ?`;
    const result = await conn.query(query, [id]);
    console.log(
      `Plan de corte con ID ${id} eliminado. Filas afectadas: ${result.affectedRows}`,
    );
    return result;
  } catch (err) {
    console.error('Error eliminando plan de corte:', err.message);
    throw err;
  }
}
