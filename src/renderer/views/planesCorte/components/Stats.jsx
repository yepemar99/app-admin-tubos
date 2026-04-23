import React from 'react';
import {
  Avatar,
  Box,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Inventory2,
  Engineering,
  History,
  Description,
  ExpandMore,
  Layers,
  CheckCircle,
  HourglassEmpty,
} from '@mui/icons-material';

const MOCK_DATA = {
  plan_id: 505,
  // Array de bobinas utilizadas para este plan
  bobinas: [
    {
      id: 1024,
      operario: 'Carlos Rodríguez',
      turno: 'Matutino - A',
      ancho_inicial: 1250.0,
      anchoo_final: 1248.5,
      espesor_final: 2.5,
      peso_real: 4500.0,
      observacion: 'Se ajustaron cuchillas a mitad de proceso.',
      creado: '2026-04-15 08:30',
    },
    {
      id: 1025,
      operario: 'Juan Pérez',
      turno: 'Vespertino - B',
      ancho_inicial: 1250.0,
      anchoo_final: 1249.0,
      espesor_final: 2.5,
      peso_real: 4800.0,
      observacion: 'Bobina con ligero óxido en el extremo inicial.',
      creado: '2026-04-15 14:20',
    },
  ],
  // Flejes totales resultantes del plan (acumulado de todas las bobinas)
  flejes: [
    {
      id: 1,
      concepto: 'FLEJE GALV 108x1,5',
      num_flejes: 12, // Subió la cantidad porque son 2 bobinas
      peso_unit_definido: 520.0,
      factor_proporcional_peso: 6240.0,
    },
    {
      id: 2,
      concepto: 'FLEJE GALV 50x1,5',
      num_flejes: 16,
      peso_unit_definido: 165.5,
      factor_proporcional_peso: 2648.0,
    },
  ],
};

const PlanCorteMultiView = ({ id = 0 }) => {
  const [bobinas, setBobinas] = React.useState([]);
  const [flejes, setFlejes] = React.useState([]);

  // CÁLCULOS AGREGADOS
  const pesoTotalEntrada = bobinas.reduce((acc, b) => acc + b.peso_real, 0);
  const pesoTotalSalida = flejes.reduce(
    (acc, f) => acc + f.factor_proporcional_peso,
    0,
  );
  const scrap = pesoTotalEntrada - pesoTotalSalida;
  const porcentajeEficiencia = !pesoTotalEntrada
    ? 0
    : ((pesoTotalSalida / pesoTotalEntrada) * 100).toFixed(1);
  const isFinalizado = bobinas.length > 0 && flejes.length > 0;

  const loadBobinas = async () => {
    return await window.api.bobinas.getAllCortadas({ plan_id: id });
  };

  const loadFlejes = async () => {
    console.log('Cargando flejes para el plan de corte con ID:', id);
    return await window.api.flejes.getAllPlanesCorte({ corte_id: id });
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const resultBobinas = await loadBobinas();
        const resultFlejes = await loadFlejes();
        if (resultBobinas.success) {
          setBobinas(resultBobinas.data);
        } else {
          console.error(
            'Error al cargar bobinas cortadas:',
            resultBobinas.error,
          );
        }
        if (resultFlejes.success) {
          setFlejes(resultFlejes.data);
        } else {
          console.error(
            'Error al cargar flejes por corte:',
            resultFlejes.error,
          );
        }
      } catch (error) {
        console.error('Error al cargar datos del plan de corte:', error);
      }
    };
    fetchData();
  }, [id]);

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{ position: 'absolute', top: 0, right: 0, zIndex: 1 }}>
        <Chip
          icon={isFinalizado ? <CheckCircle /> : <HourglassEmpty />}
          label={isFinalizado ? 'FINALIZADO' : 'POR HACER'}
          size="small"
          color={isFinalizado ? 'success' : 'warning'}
          variant="filled"
          sx={{ fontWeight: 'bold' }}
        />
      </Box>
      {bobinas.length !== 0 && (
        <Typography
          variant="subtitle2"
          sx={{ mb: 1, color: 'text.secondary', fontWeight: 'bold' }}
        >
          BOBINAS PROCESADAS ({bobinas.length})
        </Typography>
      )}

      {bobinas.length !== 0 &&
        bobinas.map((bobina, index) => (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 1,
              bgcolor: '#f1f3f5',
              borderRadius: 2,
              border: '1px solid #e0e0e0',
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <History />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Resumen de Bobina Cortada
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Registro realizado el {bobina.creado}
                </Typography>
              </Box>
              <Box sx={{ flexGrow: 1 }} />
              <Chip
                icon={<Engineering sx={{ fontSize: '16px !important' }} />}
                label={`Operario: ${bobina.operario}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  ANCHO FINAL
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {bobina.anchoo_final} mm
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  ESPESOR REAL
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {bobina.espesor_final} mm
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  PESO EN BÁSCULA
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  color="primary.main"
                >
                  {bobina?.peso_real} Kg
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  TURNO
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {bobina.turno}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        ))}

      {bobinas.length !== 0 && <Divider sx={{ my: 4 }} />}

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="subtitle2"
          sx={{
            mb: 2,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          Producción Total de Flejes
          <Chip
            label={`${flejes.length} Tipos`}
            size="small"
            color="secondary"
          />
        </Typography>

        <Grid container spacing={2}>
          {flejes.map((f) => (
            <Grid size={{ xs: 12, sm: 6 }} key={f.id}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  '&:hover': { bgcolor: '#fcfcfc' },
                }}
              >
                <Inventory2 sx={{ mr: 2, color: 'secondary.main' }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {f.fleje_concepto}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Peso Unit: {f.peso_unit_definido} Kg
                  </Typography>
                </Box>
                <Stack direction="row" spacing={4} sx={{ textAlign: 'right' }}>
                  <Box>
                    <Typography variant="caption" display="block">
                      CANT. TOTAL
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {f.num_flejes}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 80 }}>
                    <Typography variant="caption" display="block">
                      SUBTOTAL KG
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color="primary"
                    >
                      {f.factor_proporcional_peso.toFixed(2)} Kg
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 3. SECCIÓN: BALANCE GLOBAL (SUMA DE TODO) */}
      <Paper sx={{ p: 3, bgcolor: '#2d3436', color: 'white', borderRadius: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 4, sm: 4 }}>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              TOTAL ENTRADA (BOBINAS)
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {pesoTotalEntrada.toFixed(2)} Kg
            </Typography>
          </Grid>
          <Grid size={{ xs: 4, sm: 4 }}>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              TOTAL SALIDA (FLEJES)
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="primary.light">
              {pesoTotalSalida.toFixed(2)} Kg
            </Typography>
          </Grid>
          <Grid size={{ xs: 4, sm: 4 }} sx={{ textAlign: { sm: 'right' } }}>
            <Box
              sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}
            >
              <Typography variant="caption" display="block">
                EFICIENCIA GLOBAL
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="success.light">
                {porcentajeEficiencia}%
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default PlanCorteMultiView;
