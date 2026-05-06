import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  Stack,
  Switch,
  Divider,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Save,
  Cancel,
  PrecisionManufacturing,
  Straighten,
  Scale,
  Inventory2,
  Factory,
} from '@mui/icons-material';
import TextField from '../../../components/common/Textfield';
import Select from '../../../components/common/Select';
import MultiSelect from '../../../components/common/MultiSelect';
import { DataContext } from '../../../contexts/DataContext';
import { z } from 'zod';
import { StatusBullet } from '../../bobinas/components/Form';

const tuboSchema = z.object({
  id: z.number().optional(),
  calidad_id: z.number({ invalid_type_error: 'Seleccione calidad' }).positive(),
  tipo_id: z.number({ invalid_type_error: 'Seleccione tipo' }).positive(),
  maquina_ids: z.array(z.number()).min(1, 'Seleccione al menos una máquina'),
  fleje_id: z.number().optional(), // Fleje de procedencia
  medida: z.string().min(1, 'La medida es obligatoria'),
  art_concepto: z.string().min(1, 'El concepto es obligatorio'),

  // Dimensiones
  espesor: z.coerce.number().positive('Requerido'),
  ancho: z.coerce.number().min(0),
  alto: z.coerce.number().min(0),
  longitud: z.coerce.number().positive('Mínimo 6m o medida corte'),
  diametro: z.coerce.number().min(0),

  // Pesos y Stock
  peso_unitario: z.coerce.number().min(0), // Masa lineal (kg/m)
  peso_total: z.coerce.number().min(0), // Peso de la barra completa
  num_por_paq: z.coerce.number().int().min(1),
  paquetes: z.coerce.number().min(0),
  unidades: z.coerce.number().int().min(0),
  alto_paq: z.coerce.number().min(0),
  ancho_paq: z.coerce.number().min(0),

  activo: z.boolean(),
});

const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const formatNumber = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '0';
  return Number.isInteger(numeric) ? String(numeric) : String(numeric);
};

const buildMedidaTubo = ({
  tipoNombre,
  calidadNombre,
  alto,
  ancho,
  diametro,
  espesor,
  longitud,
}) => {
  const tipo = normalizeText(tipoNombre);
  const calidad = normalizeText(calidadNombre);

  let sufijoCalidad = '';
  if (calidad.includes('galvan')) {
    sufijoCalidad = ' GALV';
  } else if (calidad.includes('chapa negra') || calidad === 'negra') {
    sufijoCalidad = ' N';
  }

  const altoTxt = formatNumber(alto);
  const anchoTxt = formatNumber(ancho);
  const diametroTxt = formatNumber(diametro);
  const espesorTxt = formatNumber(espesor);
  const longitudTxt = formatNumber(longitud);

  let base = '';

  if (tipo.includes('rectang')) {
    base = `${altoTxt}x${anchoTxt}x${espesorTxt}`;
  } else if (tipo.includes('cuadr')) {
    const lado = Number(alto) > 0 ? altoTxt : anchoTxt;
    base = `${lado}x${lado}x${espesorTxt}`;
  } else if (tipo.includes('redond') || tipo === 'red') {
    base = `Red ${diametroTxt}x${espesorTxt}`;
  } else if (tipo.includes('pds')) {
    const medidaPds = Number(alto) > 0 ? altoTxt : anchoTxt;
    base = `PDS ${medidaPds}`;
  } else {
    base = `${altoTxt}x${anchoTxt}x${espesorTxt}`;
  }

  let medida = `${base}${sufijoCalidad}`.trim();
  if (Number(longitud) > 0 && Number(longitud) !== 6) {
    medida = `${medida} L${longitudTxt}m`;
  }

  return medida;
};

const TuboForm = ({ data = null, handleConfirm, handleCancel }) => {
  const { tiposCalidad, tiposTubos, maquinas } = useContext(DataContext);
  const [flejes, setFlejes] = React.useState([]);
  const [loadingFlejes, setLoadingFlejes] = React.useState(false);
  const [conceptoManual, setConceptoManual] = useState(Boolean(data?.id));
  const [openAnomalyDialog, setOpenAnomalyDialog] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  const methods = useForm({
    resolver: zodResolver(tuboSchema),
    defaultValues: {
      id: data?.id,
      tipo_id: data?.tipo_id || '',
      calidad_id: data?.calidad_id || '',
      maquina_ids: data?.maquina_ids || [],
      fleje_id: data?.fleje_id || '',
      medida:
        data?.medida ||
        String(data?.art_concepto || '')
          .replace(/^Tubo\s+/i, '')
          .trim(),
      art_concepto: data?.art_concepto || '',
      espesor: data?.espesor || 0,
      ancho: data?.ancho || 0,
      alto: data?.alto || 0,
      longitud: data?.longitud || 0,
      diametro: data?.diametro || 0,
      peso_unitario: data?.peso_unitario || 0,
      peso_total: data?.peso_total || 0,
      num_por_paq: data?.num_por_paq || 1,
      paquetes: data?.paquetes || 0,
      unidades: data?.unidades || 0,
      alto_paq: data?.alto_paq || 0,
      ancho_paq: data?.ancho_paq || 0,
      activo: data?.activo ? true : false,
    },
  });

  const { handleSubmit, watch, setValue, getValues } = methods;

  // Watches para cálculos
  const watchTipo = watch('tipo_id');
  const watchEspesor = watch('espesor');
  const watchLongitud = watch('longitud');
  const watchPesoUnitario = watch('peso_unitario');
  const watchPesoTotal = watch('peso_total');
  const watchNumPorPaq = watch('num_por_paq');
  const watchPaquetes = watch('paquetes');
  const watchUnidades = watch('unidades');
  const watchActivo = watch('activo');
  const watchCalidad = watch('calidad_id');
  const watchAlto = watch('alto');
  const watchAncho = watch('ancho');
  const watchDiametro = watch('diametro');
  const watchMedida = watch('medida');
  const watchConcepto = watch('art_concepto');

  const calidadSeleccionada = useMemo(
    () => tiposCalidad.find((c) => Number(c.id) === Number(watchCalidad)),
    [tiposCalidad, watchCalidad],
  );

  const tipoSeleccionado = useMemo(
    () => tiposTubos.find((t) => Number(t.id) === Number(watchTipo)),
    [tiposTubos, watchTipo],
  );

  // --- LÓGICA 1: Geometría dinámica ---
  useEffect(() => {
    // Si es Redondo (ej: ID 3), limpiar ancho/alto
    if (watchTipo === 3) {
      setValue('ancho', 0);
      setValue('alto', 0);
    }
    // Si es Cuadrado, ancho = alto
    if (watchTipo === 1) {
      setValue('diametro', 0);
    }
  }, [watchTipo, setValue]);

  useEffect(() => {
    const active = document.activeElement?.getAttribute('name');
    if (active === 'peso_unitario' || active === 'longitud') {
      const total = watchPesoUnitario * watchLongitud;
      setValue('peso_total', parseFloat(total.toFixed(3)));
    }
  }, [watchPesoUnitario, watchLongitud, setValue]);

  useEffect(() => {
    const active = document.activeElement?.getAttribute('name');
    if (active === 'peso_total' && watchLongitud > 0) {
      const unitario = watchPesoTotal / watchLongitud;
      setValue('peso_unitario', parseFloat(unitario.toFixed(3)));
    }
  }, [watchPesoTotal, watchLongitud, setValue]);

  useEffect(() => {
    const active = document.activeElement?.getAttribute('name');
    if (active === 'paquetes' || active === 'num_por_paq') {
      setValue('unidades', Math.round(watchPaquetes * watchNumPorPaq));
    }
  }, [watchPaquetes, watchNumPorPaq, setValue]);

  useEffect(() => {
    const active = document.activeElement?.getAttribute('name');
    if (active === 'unidades' && watchNumPorPaq > 0) {
      setValue(
        'paquetes',
        parseFloat((watchUnidades / watchNumPorPaq).toFixed(2)),
      );
    }
  }, [watchUnidades, watchNumPorPaq, setValue]);

  useEffect(() => {
    let isMounted = true;

    const loadFlejes = async () => {
      if (!watchCalidad) {
        setFlejes([]);
        setValue('fleje_id', '');
        return;
      }

      try {
        setLoadingFlejes(true);
        const result = await window.api.flejes.getAllForSelects({
          calidad_id: Number(watchCalidad),
        });

        if (!isMounted) return;

        const flejesFiltrados = Array.isArray(result?.data) ? result.data : [];
        setFlejes(flejesFiltrados);

        const currentFlejeId = Number(getValues('fleje_id'));
        const existeFleje = flejesFiltrados.some(
          (item) => Number(item.id) === currentFlejeId,
        );

        if (currentFlejeId && !existeFleje) {
          setValue('fleje_id', '');
        }
      } catch (error) {
        if (!isMounted) return;
        setFlejes([]);
        setValue('fleje_id', '');
        console.error('Error cargando flejes por calidad:', error);
      } finally {
        if (isMounted) {
          setLoadingFlejes(false);
        }
      }
    };

    loadFlejes();

    return () => {
      isMounted = false;
    };
  }, [watchCalidad, getValues, setValue]);

  useEffect(() => {
    if (conceptoManual) return;

    const medidaGenerada = buildMedidaTubo({
      tipoNombre: tipoSeleccionado?.nombre,
      calidadNombre: calidadSeleccionada?.nombre,
      alto: watchAlto,
      ancho: watchAncho,
      diametro: watchDiametro,
      espesor: watchEspesor,
      longitud: watchLongitud,
    });

    if (medidaGenerada && medidaGenerada !== watchMedida) {
      setValue('medida', medidaGenerada);
    }
  }, [
    conceptoManual,
    tipoSeleccionado,
    calidadSeleccionada,
    watchAlto,
    watchAncho,
    watchDiametro,
    watchEspesor,
    watchLongitud,
    watchMedida,
    watchConcepto,
    setValue,
  ]);

  useEffect(() => {
    const concepto = String(watchMedida || '').trim()
      ? `Tubo ${String(watchMedida || '').trim()}`
      : '';

    if (concepto !== watchConcepto) {
      setValue('art_concepto', concepto);
    }
  }, [watchMedida, watchConcepto, setValue]);

  const normalizeFormData = (formData) => {
    return {
      ...formData,
    };
  };

  const validateAnomaliesAndConfirm = (formData) => {
    const normalizedData = normalizeFormData(formData);
    const medida = String(formData.medida || '').trim();
    const isRectangular = Number(watchTipo) === 2;

    const hasAnomalies =
      isRectangular &&
      (Number(normalizedData?.espesor) > 6 ||
        Number(normalizedData?.ancho) > 2000);

    if (!hasAnomalies) {
      handleConfirm({
        ...normalizedData,
        medida,
        art_concepto: medida ? `Tubo ${medida}` : '',
      });
      return;
    }

    setPendingFormData(normalizedData);
    setOpenAnomalyDialog(true);
  };

  const handleCloseAnomalyDialog = () => {
    setOpenAnomalyDialog(false);
    setPendingFormData(null);
  };

  const handleConfirmAnomalyDialog = () => {
    if (pendingFormData) {
      const medida = String(pendingFormData.medida || '').trim();
      handleConfirm({
        ...pendingFormData,
        medida,
        art_concepto: medida ? `Tubo ${medida}` : '',
      });
    }
    handleCloseAnomalyDialog();
  };

  return (
    <FormProvider {...methods}>
      <Box
        component="form"
        onSubmit={handleSubmit(validateAnomaliesAndConfirm)}
        sx={{ p: 2 }}
      >
        <Grid container spacing={3}>
          <Grid size={12}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fa' }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <Factory fontSize="small" color="action" />
                <Typography variant="subtitle2" fontWeight="bold">
                  Identificación del Tubo
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Stack direction="row" alignItems="center" spacing={1}>
                  <StatusBullet active={watchActivo} />
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    color={watchActivo ? 'success.main' : 'error.main'}
                  >
                    {watchActivo ? 'ARTÍCULO ACTIVO' : 'ARTÍCULO INACTIVO'}
                  </Typography>
                  <Switch
                    checked={watchActivo}
                    onChange={(e) => setValue('activo', e.target.checked)}
                    size="small"
                  />
                </Stack>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Select
                  size="small"
                  name="tipo_id"
                  label="Tipo de Tubo"
                  options={tiposTubos.map((t) => ({
                    value: t.id,
                    label: t.nombre,
                  }))}
                  sx={{ width: 250 }}
                />
                <Select
                  size="small"
                  name="calidad_id"
                  label="Calidad"
                  options={tiposCalidad.map((c) => ({
                    value: c.id,
                    label: c.nombre,
                  }))}
                  sx={{ width: 200 }}
                />
                <Select
                  loading={loadingFlejes}
                  disabled={!watchCalidad}
                  size="small"
                  name="fleje_id"
                  label="Fleje de Origen"
                  options={flejes.map((f) => ({
                    value: f.id,
                    label: f.concepto || f.art_concepto || `Fleje ${f.id}`,
                  }))}
                  fullWidth
                />
              </Stack>
            </Paper>
          </Grid>

          {/* DIMENSIONES DINÁMICAS */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <Straighten fontSize="small" color="action" />
                <Typography variant="subtitle2" fontWeight="bold">
                  Dimensiones Geométricas{' '}
                </Typography>
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField
                    size="small"
                    name="espesor"
                    label="Espesor"
                    type="number"
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    size="small"
                    name="longitud"
                    label="Longitud (m)"
                    type="number"
                  />
                </Grid>

                {/* Campos condicionales según tipo */}
                {watchTipo === 3 ? (
                  <Grid item xs={4}>
                    <TextField
                      size="small"
                      name="diametro"
                      label="Diámetro"
                      type="number"
                    />
                  </Grid>
                ) : (
                  <>
                    <Grid item xs={4}>
                      <TextField
                        size="small"
                        name="alto"
                        label="Alto / Lado"
                        type="number"
                      />
                    </Grid>
                    {watchTipo === 2 && ( // Solo si es Rectangular
                      <Grid item xs={4}>
                        <TextField
                          size="small"
                          name="ancho"
                          label="Ancho"
                          type="number"
                        />
                      </Grid>
                    )}
                  </>
                )}
              </Grid>
            </Paper>
          </Grid>

          {/* CÁLCULO TÉCNICO DE PESOS */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <Scale fontSize="small" color="action" />
                <Typography variant="subtitle2" fontWeight="bold">
                  Peso y Masa Lineal
                </Typography>
              </Stack>
              <Stack spacing={2}>
                <TextField
                  size="small"
                  name="peso_unitario"
                  label="Masa Lineal (Kg/m)"
                  type="number"
                  helperText="Peso de 1 metro de tubo"
                />
                <TextField
                  size="small"
                  name="peso_total"
                  label="Peso Total de la Barra (Kg)"
                  type="number"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">Kg/barra</InputAdornment>
                    ),
                  }}
                />
              </Stack>
            </Paper>
          </Grid>

          {/* PRODUCCIÓN Y STOCK */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <PrecisionManufacturing fontSize="small" color="action" />
                <Typography variant="subtitle2" fontWeight="bold">
                  Fabricación y Máquinas
                </Typography>
              </Stack>
              <MultiSelect
                size="small"
                name="maquina_ids"
                label="Máquinas Autorizadas"
                options={maquinas.map((m) => ({
                  value: m.id,
                  label: m.maquina,
                }))}
              />
              <Box mt={2}>
                <TextField
                  size="small"
                  name="medida"
                  label="Medida"
                  onChange={(value) => {
                    if (String(value || '').trim() === '') {
                      setConceptoManual(false);
                      return;
                    }
                    setConceptoManual(true);
                  }}
                  fullWidth
                />
              </Box>
            </Paper>
          </Grid>

          {/* GESTIÓN DE PAQUETES */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <Inventory2 fontSize="small" color="action" />
                <Typography variant="subtitle2" fontWeight="bold">
                  Gestión de Paquetes
                </Typography>
              </Stack>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    size="small"
                    name="num_por_paq"
                    label="Tubos por Paquete"
                    type="number"
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    size="small"
                    name="paquetes"
                    label="Cant. Paquetes"
                    type="number"
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    size="small"
                    name="unidades"
                    label="Total Unidades"
                    type="number"
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    size="small"
                    name="alto_paq"
                    label="Alto Paquete"
                    type="number"
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    size="small"
                    name="ancho_paq"
                    label="Ancho Paquete"
                    type="number"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          sx={{ mt: 4 }}
        >
          <Button
            variant="contained"
            color="secondary"
            onClick={handleCancel}
            size="small"
          >
            Cancelar
          </Button>
          <Button variant="contained" type="submit" size="small">
            Guardar
          </Button>
        </Stack>

        <Dialog
          open={openAnomalyDialog}
          onClose={handleCloseAnomalyDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Anomalias detectadas</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 1.5 }}>
              Se detectaron valores por encima de los limites esperados para
              tubos rectangulares.
            </DialogContentText>
            <DialogContentText>
              Espesor: {pendingFormData?.espesor} mm (limite: 6 mm)
            </DialogContentText>
            <DialogContentText>
              Ancho: {pendingFormData?.ancho} mm (limite: 2000 mm)
            </DialogContentText>
            <DialogContentText sx={{ mt: 1.5 }}>
              Está seguro de que desea continuar?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseAnomalyDialog}
              color="secondary"
              variant="contained"
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirmAnomalyDialog} variant="contained">
              Confirmar y guardar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </FormProvider>
  );
};

export default TuboForm;
