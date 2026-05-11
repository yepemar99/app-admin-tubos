import database from '../../db/database';

function toValidDate(value) {
  if (!value) return null;

  const date = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date;
}

function getDefaultDateRange({ fechaInicio, fechaFin } = {}) {
  const today = new Date();
  const endDate = toValidDate(fechaFin) || today;
  const startDate = toValidDate(fechaInicio) || new Date(today);

  if (!fechaInicio) {
    startDate.setMonth(startDate.getMonth() - 7);
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
}

function formatSqlDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}

export async function obtenerEstadisticasService(params = {}) {
  try {
    const conn = database.getConnection();
    const { startDate, endDate } = getDefaultDateRange(params);
    const fechaInicioSql = formatSqlDate(startDate);
    const fechaFinSql = formatSqlDate(endDate);

    const resumenQuery = `
			SELECT
				SUM(cant_tubos_buenos + cant_tubos_malos) AS Total_Tubos_Procesados,
				SUM(cant_tubos_buenos) AS Total_Tubos_Buenos,
				SUM(cant_tubos_malos) AS Total_Tubos_Malos,
				CAST(
					(SUM(cant_tubos_malos) * 100.0 / NULLIF(SUM(cant_tubos_buenos + cant_tubos_malos), 0))
					AS DECIMAL(5,2)
				) AS Porcentaje_Merma
			FROM dbo.Prod_Tubos
      WHERE creado >= '${fechaInicioSql}' AND creado <= '${fechaFinSql}'
		`;

    const resumenRows = await conn.query(resumenQuery);
    const resumen = resumenRows?.[0] || {};

    const produccionMensualQuery = `
			SELECT
				DATENAME(month, creado) AS Mes_Nombre,
				MONTH(creado) AS Mes_Numero,
				YEAR(creado) AS Anio,
				SUM(cant_tubos_buenos) AS Tubos_Buenos,
        SUM(cant_tubos_malos) AS Tubos_Malos,
        CAST(
          (SUM(cant_tubos_malos) * 100.0 / NULLIF(SUM(cant_tubos_buenos + cant_tubos_malos), 0))
          AS DECIMAL(5,2)
        ) AS Porcentaje_Tubos_Malos
			FROM dbo.Prod_Tubos
      WHERE creado >= '${fechaInicioSql}' AND creado <= '${fechaFinSql}'
			GROUP BY
				YEAR(creado),
				MONTH(creado),
				DATENAME(month, creado)
			ORDER BY
				Anio,
				Mes_Numero
		`;

    const produccionMensualRows = await conn.query(produccionMensualQuery);

    const salidasPaquetesMensualQuery = `
      SELECT
        DATENAME(month, sp.creado) AS Mes_Nombre,
        MONTH(sp.creado) AS Mes_Numero,
        YEAR(sp.creado) AS Anio,
        COUNT(sp.id) AS Total_Salidas,
        SUM(sp.num_paqs) AS Total_Paquetes
      FROM dbo.Salidas_Paqs_Tubos sp
      WHERE sp.creado >= '${fechaInicioSql}' AND sp.creado <= '${fechaFinSql}'
      GROUP BY
        YEAR(sp.creado),
        MONTH(sp.creado),
        DATENAME(month, sp.creado)
      ORDER BY
        Anio,
        Mes_Numero
    `;

    const salidasPaquetesMensualRows = await conn.query(
      salidasPaquetesMensualQuery,
    );

    const produccionMaquinasQuery = `
			SELECT
				m.id AS Maquina_Id,
				COALESCE(m.maquina, m.nombre) AS Maquina_Nombre,
				SUM(pt.cant_tubos_buenos) AS Tubos_Buenos
			FROM dbo.Prod_Tubos pt
			INNER JOIN dbo.Tubos_Maquinas tm ON pt.id = tm.tubo_id
			INNER JOIN dbo.Maquinas m ON tm.maquina_id = m.id
			WHERE pt.creado >= '${fechaInicioSql}' AND pt.creado <= '${fechaFinSql}'
			GROUP BY
				m.id,
				COALESCE(m.maquina, m.nombre)
			ORDER BY Maquina_Nombre ASC
		`;

    const produccionMaquinasRows = await conn.query(produccionMaquinasQuery);
    const totalProduccionMaquinas = produccionMaquinasRows.reduce(
      (accumulator, row) => accumulator + (Number(row.Tubos_Buenos) || 0),
      0,
    );

    const querySalidaPaquetes = `
      SELECT TOP 4
        sp.id,
        sp.num_paqs,
        sp.creado AS fecha,
        sp.operario_id,
        o.nombre AS nombre_operario,
        o.apellido1 AS apellido_operario1,
        o.apellido2 AS apellido_operario2,
        sp.tubo_id,
        t.medida
      FROM dbo.Salidas_Paqs_Tubos sp
      LEFT JOIN dbo.Operarios o ON sp.operario_id = o.id
      LEFT JOIN dbo.Tubos t ON sp.tubo_id = t.id
      ORDER BY sp.creado DESC
    `;

    const rowsSalidasPaquetes = await conn.query(querySalidaPaquetes);

    // Histórico completo de salidas de paquetes con filtros de fecha
    const queryHistoricoSalidasPaquetes = `
      SELECT
        sp.id,
        sp.num_paqs,
        sp.creado AS fecha,
        sp.operario_id,
        o.nombre AS nombre_operario,
        o.apellido1 AS apellido_operario1,
        o.apellido2 AS apellido_operario2,
        sp.tubo_id,
        t.medida,
        DATEDIFF(MINUTE, LAG(sp.creado) OVER (ORDER BY sp.creado), sp.creado) AS tiempo_desde_anterior_minutos,
        DATEDIFF(HOUR, LAG(sp.creado) OVER (ORDER BY sp.creado), sp.creado) AS tiempo_desde_anterior_horas
      FROM dbo.Salidas_Paqs_Tubos sp
      LEFT JOIN dbo.Operarios o ON sp.operario_id = o.id
      LEFT JOIN dbo.Tubos t ON sp.tubo_id = t.id
      WHERE sp.creado >= '${fechaInicioSql}' AND sp.creado <= '${fechaFinSql}'
      ORDER BY sp.creado DESC
    `;

    const rowsHistoricoSalidasPaquetes = await conn.query(
      queryHistoricoSalidasPaquetes,
    );

    //Totales
    const queryBobinasCortadasTotales = `SELECT COUNT(*) FROM dbo.Bobinas_Cortadas`;
    const resultBobinasCortadasTotales = await conn.query(
      queryBobinasCortadasTotales,
    );
    const bobinasCortadasTotales = resultBobinasCortadasTotales?.[0]?.[''] || 0;

    const queryTotalTubosBuenos = `SELECT SUM(cant_tubos_buenos) FROM dbo.Prod_Tubos`;
    const resultTotalTubosBuenos = await conn.query(queryTotalTubosBuenos);
    const totalTubosBuenos = resultTotalTubosBuenos?.[0]?.[''] || 0;

    const queryIndiceMerma = `SELECT CAST((SUM(cant_tubos_malos) * 100.0 / NULLIF(SUM(cant_tubos_buenos + cant_tubos_malos), 0)) AS DECIMAL(10,2)) 
FROM dbo.Prod_Tubos`;
    const resultIndiceMerma = await conn.query(queryIndiceMerma);
    const indiceMerma = resultIndiceMerma?.[0]?.[''] || 0;

    const queryTotalFlejes = `SELECT SUM(unidades) FROM dbo.Flejes`;
    const resultTotalFlejes = await conn.query(queryTotalFlejes);
    const totalFlejes = resultTotalFlejes?.[0]?.[''] || 0;

    const queryTotalSalidasPaqs = `SELECT SUM(num_paqs) FROM dbo.Salidas_Paqs_Tubos`;
    const resultTotalSalidasPaqs = await conn.query(queryTotalSalidasPaqs);
    const totalSalidasPaqs = resultTotalSalidasPaqs?.[0]?.[''] || 0;

    return {
      resumen: {
        totalTubosProcesados: Number(resumen.Total_Tubos_Procesados) || 0,
        totalTubosBuenos: Number(resumen.Total_Tubos_Buenos) || 0,
        totalTubosMalos: Number(resumen.Total_Tubos_Malos) || 0,
        porcentajeMerma: Number(resumen.Porcentaje_Merma) || 0,
      },
      produccionMensual: produccionMensualRows.map((row) => ({
        mesNombre: row.Mes_Nombre,
        mesNumero: Number(row.Mes_Numero),
        anio: Number(row.Anio),
        tubosBuenos: Number(row.Tubos_Buenos) || 0,
        tubosMalos: Number(row.Tubos_Malos) || 0,
        porcentajeTubosMalosSobreTotal: Number(row.Porcentaje_Tubos_Malos) || 0,
      })),
      salidasPaquetesMensual: salidasPaquetesMensualRows.map((row) => ({
        mesNombre: row.Mes_Nombre,
        mesNumero: Number(row.Mes_Numero),
        anio: Number(row.Anio),
        totalSalidas: Number(row.Total_Salidas) || 0,
        totalPaquetes: Number(row.Total_Paquetes) || 0,
      })),
      graficoTubosMalosSobreTotal: produccionMensualRows.map((row) => ({
        label: `${row.Mes_Nombre} ${row.Anio}`,
        value: Number(row.Porcentaje_Tubos_Malos) || 0,
      })),
      ultimasSalidas: rowsSalidasPaquetes.map((row) => ({
        id: Number(row.id),
        numPaqs: Number(row.num_paqs) || 0,
        fecha: row.fecha ? new Date(row.fecha).toISOString() : null,
        operarioId: Number(row.operario_id) || null,
        nombreOperario: row.nombre_operario || '',
        apellidoOperario1: row.apellido_operario1 || '',
        apellidoOperario2: row.apellido_operario2 || '',
        nombreCompletoOperario:
          `${row.nombre_operario || ''} ${row.apellido_operario1 || ''} ${row.apellido_operario2 || ''}`.trim(),
        tuboId: Number(row.tubo_id) || null,
        medida: row.medida || '',
      })),
      historicoSalidasPaquetes: rowsHistoricoSalidasPaquetes.map((row) => ({
        id: Number(row.id),
        numPaqs: Number(row.num_paqs) || 0,
        fecha: row.fecha ? new Date(row.fecha).toISOString() : null,
        operarioId: Number(row.operario_id) || null,
        nombreOperario: row.nombre_operario || '',
        apellidoOperario1: row.apellido_operario1 || '',
        apellidoOperario2: row.apellido_operario2 || '',
        nombreCompletoOperario:
          `${row.nombre_operario || ''} ${row.apellido_operario1 || ''} ${row.apellido_operario2 || ''}`.trim(),
        tuboId: Number(row.tubo_id) || null,
        medida: row.medida || '',
        tiempoDesdeAnteriorMinutos:
          row.tiempo_desde_anterior_minutos !== null
            ? Number(row.tiempo_desde_anterior_minutos)
            : null,
        tiempoDesdeAnteriorHoras:
          row.tiempo_desde_anterior_horas !== null
            ? Number(row.tiempo_desde_anterior_horas)
            : null,
      })),
      graficoDistribucionMaquinas: {
        total: totalProduccionMaquinas,
        series: produccionMaquinasRows.map((row) => ({
          id: Number(row.Maquina_Id),
          label: row.Maquina_Nombre,
          value: Number(row.Tubos_Buenos) || 0,
        })),
      },
      totales: {
        bobinasCortadas: Number(bobinasCortadasTotales) || 0,
        tubosBuenos: Number(totalTubosBuenos) || 0,
        indiceMerma: Number(indiceMerma) || 0,
        totalFlejes: Number(totalFlejes) || 0,
        totalSalidasPaqs: Number(totalSalidasPaqs) || 0,
      },
      rangoFechas: {
        fechaInicio: startDate.toISOString(),
        fechaFin: endDate.toISOString(),
      },
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas de tubos:', error.message);
    throw error;
  }
}
