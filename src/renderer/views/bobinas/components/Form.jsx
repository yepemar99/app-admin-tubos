import React, { useContext, useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Factory, Description } from '@mui/icons-material';
import { z } from 'zod';
import TextField from '../../../components/common/Textfield';
import Select from '../../../components/common/Select';
import { DataContext } from '../../../contexts/DataContext';

const schema = z
  .object({
    id: z.number().optional(),
    fabricante_id: z.any().optional(),
    fabricante: z.string().optional(),
    calidad_id: z
      .number({ invalid_type_error: 'Seleccione una calidad' })
      .positive(),
    concepto: z.string().min(1, 'El concepto es obligatorio'),
    espesor: z.number().positive('Debe ser mayor a 0'), // Flotante
    ancho: z.number().positive('Debe ser mayor a 0'), // Flotante
    peso_medio: z.number().nonnegative(),
    activa: z.boolean(),
    unidades: z.number().int().positive(), // Entero
  })
  .superRefine((values, ctx) => {
    const hasFabricanteId = Number(values?.fabricante_id) > 0;
    const hasFabricanteNombre =
      String(values?.fabricante || '').trim().length > 0;

    if (!hasFabricanteId && !hasFabricanteNombre) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fabricante_id'],
        message: 'Seleccione un fabricante o escriba uno nuevo',
      });
    }
  });

export const StatusBullet = ({ active }) => (
  <Box
    sx={{
      width: 10,
      height: 10,
      borderRadius: '50%',
      bgcolor: active ? 'success.main' : 'error.main',
      display: 'inline-block',
      mr: 1,
      boxShadow: (theme) =>
        `0 0 0 2px ${theme.palette.background.paper}, 0 0 0 4px ${active ? theme.palette.success.light : theme.palette.error.light}`,
    }}
  />
);

const BobinaForm = ({ data = null, handleConfirm, handleCancel }) => {
  const { fabricantes, tiposCalidad } = useContext(DataContext);
  const [useFabricanteInput, setUseFabricanteInput] = useState(false);
  const [openAnomalyDialog, setOpenAnomalyDialog] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  const normalizeFormData = (formData) => {
    const normalizedData = {
      ...formData,
      fabricante: String(formData?.fabricante || '').trim(),
      fabricante_id:
        Number(formData?.fabricante_id) > 0
          ? Number(formData.fabricante_id)
          : null,
    };

    if (normalizedData.fabricante_id) {
      normalizedData.fabricante = '';
    }

    return normalizedData;
  };

  const validateAnomaliesAndConfirm = (formData) => {
    const normalizedData = normalizeFormData(formData);
    const hasAnomalies =
      Number(normalizedData?.espesor) > 6 ||
      Number(normalizedData?.ancho) > 2000 ||
      Number(normalizedData?.ancho) < 1000 ||
      Number(normalizedData?.peso_medio) > 30000;

    if (!hasAnomalies) {
      handleConfirm(normalizedData);
      return;
    }

    setPendingFormData(normalizedData);
    setOpenAnomalyDialog(true);
  };

  const handleToggleFabricanteMode = () => {
    const nextMode = !useFabricanteInput;
    setUseFabricanteInput(nextMode);

    if (nextMode) {
      methods.setValue('fabricante_id', null);
    } else {
      methods.setValue('fabricante', '');
    }
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

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      id: data?.id || undefined,
      fabricante_id: data?.fabricante_id || null,
      fabricante: '',
      calidad_id: data?.calidad_id || '',
      concepto: data?.concepto || '',
      art_concepto: data?.art_concepto || '',
      espesor: data?.espesor || 0,
      ancho: data?.ancho || 0,
      peso_medio: data?.peso_medio || 0,
      activa: data?.activa ? true : false,
      unidades: data?.unidades || 1,
    },
  });

  const { handleSubmit, watch, setValue } = methods;
  const isActiva = watch('activa');
  const watchFabricanteId = watch('fabricante_id');
  const watchFabricanteNombre = watch('fabricante');
  const watchCalidadId = watch('calidad_id');
  const watchEspesor = watch('espesor');
  const watchAncho = watch('ancho');

  // Efecto para generar el CONCEPTO automáticamente
  useEffect(() => {
    if (watchEspesor > 0 && watchAncho > 0 && watchCalidadId) {
      // Obtener nombre del fabricante
      let fabricanteNom = '';
      if (useFabricanteInput) {
        fabricanteNom = String(watchFabricanteNombre || '')
          .trim()
          .toUpperCase();
      } else if (watchFabricanteId) {
        const fabricanteObj = fabricantes.find(
          (f) => f.id === watchFabricanteId,
        );
        fabricanteNom =
          fabricanteObj && fabricanteObj.nombre
            ? fabricanteObj?.nombre.toUpperCase()
            : '';
      }

      // Obtener nombre del material (calidad)
      const calidadObj = tiposCalidad.find((c) => c.id === watchCalidadId);
      const materialNom =
        calidadObj && calidadObj.label_bobina
          ? calidadObj?.label_bobina.toUpperCase()
          : '';

      // Generar concepto
      if (fabricanteNom) {
        const conceptoGenerado =
          `BOBINA ${materialNom ? `${materialNom} ` : ''}${fabricanteNom} ${watchEspesor}x${watchAncho}`.trim();
        setValue('concepto', conceptoGenerado);
      }
    }
  }, [
    watchEspesor,
    watchAncho,
    watchCalidadId,
    watchFabricanteId,
    watchFabricanteNombre,
    useFabricanteInput,
    fabricantes,
    tiposCalidad,
    setValue,
  ]);

  return (
    <FormProvider {...methods}>
      <Box
        component="form"
        onSubmit={handleSubmit(validateAnomaliesAndConfirm)}
        sx={{ p: 2 }}
      >
        {/* SECCIÓN 1: IDENTIFICACIÓN (Estilo Gris) */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            bgcolor: '#f8f9fa',
            borderRadius: 2,
            border: '1px solid #e9ecef',
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 1.5 }}
          >
            <Factory color="action" />
            <Typography variant="subtitle2" fontWeight="bold">
              Identificación y Fabricante
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Stack direction="row" alignItems="center" spacing={1}>
              <StatusBullet active={isActiva} />
              <Typography
                variant="caption"
                fontWeight="bold"
                color={isActiva ? 'success.main' : 'error.main'}
              >
                {isActiva ? 'ARTÍCULO ACTIVO' : 'ARTÍCULO INACTIVO'}
              </Typography>
              <Switch
                checked={isActiva}
                onChange={(e) => setValue('activa', e.target.checked)}
                size="small"
              />
            </Stack>
          </Stack>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              {useFabricanteInput ? (
                <TextField
                  size="small"
                  name="fabricante"
                  label="Nuevo fabricante"
                  fullWidth
                />
              ) : (
                <Select
                  size="small"
                  name="fabricante_id"
                  label="Fabricante"
                  options={fabricantes.map((f) => ({
                    label: f.nombre,
                    value: f.id,
                  }))}
                  fullWidth
                />
              )}
              <Button
                size="small"
                variant="text"
                sx={{ mt: 1, px: 0 }}
                onClick={handleToggleFabricanteMode}
                variant="text"
              >
                {useFabricanteInput
                  ? 'Seleccionar fabricante existente'
                  : 'No existe? Crear fabricante nuevo'}
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Select
                size="small"
                name="calidad_id"
                label="Calidad Material"
                options={tiposCalidad.map((c) => ({
                  label: c.nombre,
                  value: c.id,
                }))}
                fullWidth
              />
            </Grid>
          </Grid>
        </Paper>

        {/* SECCIÓN 2: ESPECIFICACIONES TÉCNICAS (Dashed Box) */}
        <Box
          sx={{ p: 3, mb: 3, border: '2px dashed #dee2e6', borderRadius: 2 }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 1.5 }}
          >
            <Description color="action" />
            <Typography variant="subtitle2" fontWeight="bold">
              Especificaciones Técnicas
            </Typography>
          </Stack>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                size="small"
                name="espesor"
                label="Espesor (mm)"
                type="number"
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                size="small"
                name="ancho"
                label="Ancho (mm)"
                type="number"
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                size="small"
                name="peso_medio"
                label="Peso Medio (Kg)"
                type="number"
                fullWidth
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                size="small"
                name="concepto"
                label="Concepto detallado"
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                size="small"
                name="unidades"
                label="Unidades"
                type="number"
                fullWidth
              />
            </Grid>
          </Grid>
        </Box>

        {/* ACCIONES */}
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button
            size="small"
            variant="contained"
            color="secondary"
            onClick={handleCancel}
          >
            Cancelar
          </Button>
          <Button size="small" variant="contained" type="submit">
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
            {pendingFormData?.espesor > 6 && (
              <DialogContentText>
                Espesor: {pendingFormData?.espesor} mm (límite: 6 mm)
              </DialogContentText>
            )}
            {(pendingFormData?.ancho < 1000 ||
              pendingFormData?.ancho > 2000) && (
              <DialogContentText>
                Ancho: {pendingFormData?.ancho} mm (límite mínimo: 1000 mm y
                máximo: 2000 mm)
              </DialogContentText>
            )}

            {pendingFormData?.peso_medio > 30000 && (
              <DialogContentText>
                Peso medio: {pendingFormData?.peso_medio} kg (límite: 30000 kg)
              </DialogContentText>
            )}
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

export default BobinaForm;
