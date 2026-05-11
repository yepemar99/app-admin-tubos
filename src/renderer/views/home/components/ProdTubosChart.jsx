import { Box, Card, Grid, Stack, Typography } from '@mui/material';
import React from 'react';
import SimpleBarChart from '../../../components/charts/DobleBarChart';
import ColorCustomization from '../../../components/charts/SparkLine';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { formatearFechaCorta } from '../../../utils/functions';
import DonutChart from '../../../components/charts/PieChart';
import Timeline from '../../../components/charts/Timeline';
import Totals from './Totals';
import { LineChart } from '@mui/x-charts';

const fontLightStyles = {
  color: '#989599',
  fontWeight: 'bold',
  fontSize: 12,
};
const fontDarkStyles = {
  fontWeight: 'bold',
  fontSize: 14,
};

const ProdTubosChart = () => {
  const [stats, setStats] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await window.api.stats.getTubosStats();
      if (response.success) {
        setStats(response.data);
      } else {
        console.error(
          'Error al obtener estadísticas de tubos:',
          response.error,
        );
      }
    } catch (error) {
      console.error('Error al llamar a stats.getTubosStats:', error);
    } finally {
      setLoading(false);
    }
  };

  const produccionMensual = stats?.produccionMensual || [];
  const salidasPaquetesMensual = stats?.salidasPaquetesMensual || [];
  const graficoTubosMalosSobreTotal = stats?.graficoTubosMalosSobreTotal || [];
  const graficoDistribucionMaquinas = stats?.graficoDistribucionMaquinas || {};
  const uData = produccionMensual.map((item) => item.tubosBuenos || 0);
  const pData = produccionMensual.map((item) => item.tubosMalos || 0);
  const xLabels = produccionMensual.map((item) =>
    item.mesNombre ? `${item.mesNombre} ${item.anio}` : String(item.anio),
  );
  const salidasLabels = salidasPaquetesMensual.map((item) =>
    item.mesNombre ? `${item.mesNombre} ${item.anio}` : String(item.anio),
  );
  const salidasData = salidasPaquetesMensual.map(
    (item) => item.totalPaquetes || 0,
  );
  const sparkLineValues = graficoTubosMalosSobreTotal.map(
    (item) => item.value || 0,
  );
  const maquinasData = (graficoDistribucionMaquinas.series || []).map(
    (item) => ({
      label: item.label,
      value: item.value,
    }),
  );
  const timelineItems = (stats?.ultimasSalidas || []).map((salida) => {
    const fecha = salida.fecha ? new Date(salida.fecha) : new Date();
    const fechaFormato = fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const tiempoRelativo = Math.max(
      0,
      Math.floor((new Date() - fecha) / (1000 * 60 * 60 * 24)),
    );
    const tiempoTranscurrido =
      tiempoRelativo < 1
        ? 'Hace poco'
        : `Hace ${tiempoRelativo} día${tiempoRelativo > 1 ? 's' : ''}`;

    return {
      id: salida.id,
      title: `${salida.numPaqs} tubos de ${salida.medida}`,
      subtitle: `${salida.nombreOperario}`,
      date: fechaFormato,
      timeAgo: tiempoTranscurrido,
      icon: 'package',
      bgColor: '#7C3AED',
    };
  });

  React.useEffect(() => {
    loadStats();
  }, []);

  console.log('Stats de tubos:', stats);

  return (
    <Stack flexDirection={'column'} gap={1}>
      <Stack justifyContent={'center'} sx={{ mb: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', fontSize: 24 }}>
          Producción de Tubos
        </Typography>
      </Stack>
      <Totals stats={stats?.totales} />
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, sm: 8 }}>
          <Card variant="outlined" sx={{ p: 2, minHeight: 345 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Resumen de Producción de Tubos
            </Typography>
            <Grid container spacing={1}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card
                  variant="contained"
                  sx={{
                    height: 240,
                    px: 2,
                    py: 3,
                    backgroundColor: '#F7F6FB',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography sx={{ fontWeight: 'bold' }}>
                    Producción Total
                  </Typography>
                  <Box>
                    <Typography variant="h4">
                      {stats?.resumen?.totalTubosProcesados || 0} uds
                    </Typography>
                    <Typography sx={fontLightStyles}>
                      Desde{' '}
                      {formatearFechaCorta(stats?.rangoFechas?.fechaInicio)}{' '}
                      hasta {formatearFechaCorta(stats?.rangoFechas?.fechaFin)}
                    </Typography>
                  </Box>
                  <Stack
                    sx={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
                  >
                    <Box width={'60%'}>
                      <ColorCustomization values={sparkLineValues} />
                    </Box>
                    <Stack
                      sx={{
                        gap: 1,
                        flexDirection: 'row',
                        backgroundColor: '#E4665D',
                        p: 0.5,
                        borderRadius: 1,
                        alignItems: 'center',
                        height: 'fit-content',
                      }}
                    >
                      <ArrowDownwardIcon
                        sx={{ fontSize: 12, color: 'white' }}
                      />
                      <Typography
                        sx={{ ...fontDarkStyles, color: 'white', fontSize: 12 }}
                      >
                        {stats?.resumen?.porcentajeMerma || 0}%
                      </Typography>
                    </Stack>
                  </Stack>
                  <Stack sx={{ gap: 1, flexDirection: 'row' }}>
                    <Stack
                      sx={{ flex: 1, gap: 0 }}
                      flexDirection={'column'}
                      justifyContent={'center'}
                    >
                      <Stack sx={{ gap: 1 }} alignItems={'center'}>
                        <Box
                          component="span"
                          sx={{
                            bgcolor: 'primary.main',
                            width: 7,
                            height: 7,
                            borderRadius: '10px',
                          }}
                        />
                        <Typography sx={{ ...fontDarkStyles }}>
                          {stats?.resumen?.totalTubosBuenos || 0}
                        </Typography>
                      </Stack>
                      <Typography sx={{ ...fontLightStyles }}>
                        Tubos buenos
                      </Typography>
                    </Stack>
                    <Stack
                      sx={{ flex: 1, gap: 0 }}
                      flexDirection={'column'}
                      justifyContent={'center'}
                    >
                      <Stack sx={{ gap: 1 }} alignItems={'center'}>
                        <Box
                          component="span"
                          sx={{
                            bgcolor: '#E5DFFF',
                            width: 7,
                            height: 7,
                            borderRadius: '10px',
                          }}
                        />
                        <Typography sx={{ ...fontDarkStyles }}>
                          {stats?.resumen?.totalTubosMalos || 0}
                        </Typography>
                      </Stack>
                      <Typography sx={{ ...fontLightStyles }}>
                        Tubos defectuosos
                      </Typography>
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <SimpleBarChart
                  uData={uData}
                  pData={pData}
                  xLabels={xLabels}
                  uLabel="Tubos buenos"
                  pLabel="Tubos malos"
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined" sx={{ p: 2, minHeight: 345 }}>
            <Typography variant="h6">Productividad por Máquina</Typography>
            <Typography sx={fontLightStyles}>
              Desde {formatearFechaCorta(stats?.rangoFechas?.fechaInicio)} hasta{' '}
              {formatearFechaCorta(stats?.rangoFechas?.fechaFin)}
            </Typography>
            <DonutChart data={maquinasData} />
          </Card>
        </Grid>
      </Grid>
      <Grid spacing={2} container>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined" sx={{ p: 2, minHeight: 340 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Historial y Tendencia de Salidas
            </Typography>
            {loading ? (
              <Typography sx={{ color: '#6B7280' }}>Cargando...</Typography>
            ) : (
              <Timeline items={timelineItems} />
            )}
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 8 }}>
          <Card variant="outlined" sx={{ p: 2, minHeight: 340 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Historial y Tendencia de Salidas
            </Typography>
            <LineChart
              xAxis={[{ data: salidasLabels, scaleType: 'band' }]}
              series={[
                {
                  data: salidasData,
                  label: 'Total de Paquetes',
                  showMark: ({ index }) => index % 2 === 0,
                },
              ]}
              height={300}
            />
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default ProdTubosChart;
