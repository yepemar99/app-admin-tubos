import React, { useContext, useEffect, useState } from 'react';
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
  InputAdornment,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Save,
  Cancel,
  Straighten,
  Balance,
  Inventory,
} from '@mui/icons-material';
import { z } from 'zod';
import TextField from '../../../components/common/Textfield';
import Select from '../../../components/common/Select';
import { DataContext } from '../../../contexts/DataContext';

const schema = z.object({
  id: z.number().optional(),
  calidad_id: z
    .number({ invalid_type_error: 'Seleccione una calidad' })
    .positive(),
  concepto: z.string().min(1, 'El concepto es obligatorio'),
  art_concepto: z.string().min(1, 'El concepto de artículo es obligatorio'),
  espesor: z.coerce.number().positive('Debe ser mayor a 0'),
  ancho: z.coerce.number().positive('Debe ser mayor a 0'),
  unidades: z.coerce.number().int().min(0, 'Mínimo 0'),
  peso_total: z.coerce.number().min(0, 'Debe ser mayor que 0'),
  peso_medio: z.coerce.number().min(0, 'Debe ser mayor que 0'),
  activo: z.boolean(),
});

const FlejeForm = ({ data = null, handleConfirm, handleCancel }) => {
  const { tiposCalidad } = useContext(DataContext);
  const [openAnomalyDialog, setOpenAnomalyDialog] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      id: data?.id || undefined,
      calidad_id: data?.calidad_id || '',
      concepto: data?.concepto || '',
      art_concepto: data?.art_concepto || '',
      espesor: data?.espesor || 0,
      ancho: data?.ancho || 0,
      unidades: data?.unidades || 0,
      peso_total: data?.peso_total || 0,
      peso_medio: data?.peso_medio || 0,
      activo: data?.activo ? true : false,
    },
  });

  const { handleSubmit, watch, setValue } = methods;

  const normalizeFormData = (formData) => {
    return {
      ...formData,
    };
  };

  const validateAnomaliesAndConfirm = (formData) => {
    const normalizedData = normalizeFormData(formData);
    const hasAnomalies =
      Number(normalizedData?.espesor) > 6 ||
      Number(normalizedData?.ancho) > 2000 ||
      Number(normalizedData?.peso_medio) > 30000;

    if (!hasAnomalies) {
      handleConfirm(normalizedData);
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
      handleConfirm(pendingFormData);
    }
    handleCloseAnomalyDialog();
  };

  // Vigilancia de campos para lógica reactiva
  const watchAncho = watch('ancho');
  const watchEspesor = watch('espesor');
  const watchCalidadId = watch('calidad_id');
  const watchPesoTotal = watch('peso_total');
  const watchPesoMedio = watch('peso_medio');
  const watchUnidades = watch('unidades');
  const watchActivo = watch('activo');

  // 1. Efecto para generar el CONCEPTO automáticamente
  useEffect(() => {
    if (watchAncho > 0 && watchEspesor > 0) {
      const calidadObj = tiposCalidad.find((c) => c.id === watchCalidadId);
      const calidadNom = calidadObj ? calidadObj.nombre.toUpperCase() : '';

      const conceptoGenerado =
        `FLEJE ${calidadNom} ${watchAncho}x${watchEspesor}`.trim();

      setValue('concepto', conceptoGenerado);
      setValue('art_concepto', conceptoGenerado); // Sincronizado por defecto
    }
  }, [watchAncho, watchEspesor, watchCalidadId, tiposCalidad, setValue]);

  // 2. Si se edita peso total (o unidades), recalcular peso medio
  useEffect(() => {
    const activeField = document.activeElement?.getAttribute('name');
    const editedFromTotal =
      activeField === 'peso_total' ||
      activeField === 'unidades' ||
      !activeField;

    if (!editedFromTotal) return;

    const total = parseFloat(watchPesoTotal) || 0;
    const unds = parseInt(watchUnidades) || 0;

    if (unds > 0) {
      const medio = total / unds;
      setValue('peso_medio', parseFloat(medio.toFixed(3))); // 3 decimales para precisión en metalurgia
    } else {
      setValue('peso_medio', 0);
    }
  }, [watchPesoTotal, watchUnidades, setValue]);

  // 3. Si se edita peso medio, recalcular peso total
  useEffect(() => {
    const activeField = document.activeElement?.getAttribute('name');
    if (activeField !== 'peso_medio') return;

    const medio = parseFloat(watchPesoMedio) || 0;
    const unds = parseInt(watchUnidades) || 0;

    if (unds > 0) {
      const total = medio * unds;
      setValue('peso_total', parseFloat(total.toFixed(3)));
    } else {
      setValue('peso_total', 0);
    }
  }, [watchPesoMedio, watchUnidades, setValue]);

  console.log('Valores vigilados:', watchActivo);

  return (
    <FormProvider {...methods}>
      <Box
        component="form"
        onSubmit={handleSubmit(validateAnomaliesAndConfirm)}
        sx={{ p: 1 }}
      >
        {/* CABECERA Y ESTADO */}
        <Paper
          elevation={0}
          sx={{ p: 2, mb: 2, bgcolor: '#f1f3f4', border: '1px solid #dadce0' }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" fontWeight="bold">
              Configuración
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography
                variant="caption"
                fontWeight="bold"
                color={watchActivo ? 'success.main' : 'error.main'}
              >
                {watchActivo ? 'ACTIVO' : 'INACTIVO'}
              </Typography>
              <Switch
                checked={watchActivo}
                onChange={(e) => setValue('activo', e.target.checked)}
                color="success"
                size="small"
              />
            </Stack>
          </Stack>
        </Paper>

        <Grid container spacing={2}>
          {/* SECCIÓN TÉCNICA */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <Straighten color="action" />
                <Typography variant="subtitle2" fontWeight="bold">
                  Dimensiones y Calidad
                </Typography>
              </Stack>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Select
                    name="calidad_id"
                    label="Calidad del Material"
                    options={tiposCalidad.map((c) => ({
                      label: c.nombre,
                      value: c.id,
                    }))}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    name="ancho"
                    label="Ancho"
                    type="number"
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    name="espesor"
                    label="Espesor"
                    type="number"
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    name="concepto"
                    label="Concepto"
                    fullWidth
                    size="small"
                    helperText="Generado automáticamente"
                    sx={{ bgcolor: '#f8f9fa' }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* SECCIÓN DE INVENTARIO Y PESOS */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fcfcfc' }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <Balance color="action" />
                <Typography variant="subtitle2" fontWeight="bold">
                  Cálculos de Pesos y Calidad
                </Typography>
              </Stack>
              <Stack spacing={2} mb={2}>
                <TextField
                  name="unidades"
                  label="Stock Unidades"
                  type="number"
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Inventory fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
              <Stack spacing={1}>
                <TextField
                  name="peso_total"
                  label="Peso Total (Kg)"
                  type="number"
                  fullWidth
                  size="small"
                />
                <Divider />
                <TextField
                  name="peso_medio"
                  label="Peso Medio Unitario"
                  type="number"
                  fullWidth
                  size="small"
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">Kg/u</InputAdornment>
                    ),
                  }}
                  sx={{ bgcolor: '#e8f0fe' }}
                />
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              name="art_concepto"
              label="Concepto de Artículo (ERP)"
              fullWidth
              size="small"
            />
          </Grid>
        </Grid>

        {/* ACCIONES */}
        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          sx={{ mt: 3 }}
        >
          <Button
            onClick={handleCancel}
            color="secondary"
            variant="contained"
            size="small"
          >
            Cancelar
          </Button>
          <Button type="submit" variant="contained" size="small">
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
              Se detectaron valores por encima de los límites esperados.
            </DialogContentText>
            <DialogContentText>
              Espesor: {pendingFormData?.espesor} mm (límite: 6 mm)
            </DialogContentText>
            <DialogContentText>
              Ancho: {pendingFormData?.ancho} mm (límite: 2000 mm)
            </DialogContentText>
            <DialogContentText>
              Peso medio: {pendingFormData?.peso_medio} kg (límite: 30000 kg)
            </DialogContentText>
            <DialogContentText sx={{ mt: 1.5 }}>
              ¿Está seguro de que desea continuar?
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

export default FlejeForm;
