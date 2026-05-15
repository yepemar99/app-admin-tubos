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

const schema = z.object({
  id: z.number().optional(),
  operario_id: z
    .number({ invalid_type_error: 'Seleccione un operario' })
    .positive('Seleccione un operario'),
  turno_id: z
    .number({ invalid_type_error: 'Seleccione un turno' })
    .positive('Seleccione un turno'),
  maquina_id: z
    .number({ invalid_type_error: 'Seleccione una máquina' })
    .positive('Seleccione una máquina'),
  calidad_id: z
    .number({ invalid_type_error: 'Seleccione una calidad' })
    .positive('Seleccione una calidad'),
  tubo_id: z
    .number({ invalid_type_error: 'Seleccione un tubo' })
    .positive('Seleccione un tubo'),
  cant_tubos_buenos: z
    .number({ invalid_type_error: 'Ingrese la cantidad' })
    .int('Debe ser un número entero')
    .nonnegative('No puede ser negativo'),
  cant_tubos_malos: z
    .number({ invalid_type_error: 'Ingrese la cantidad' })
    .int('Debe ser un número entero')
    .nonnegative('No puede ser negativo'),
  concentracion_taladrina: z.number().positive('No puede ser negativo'),
  observacion: z.string().optional(),
  fecha: z.string().optional(),
});

const ProdTubosForm = ({ data = null, handleConfirm, handleCancel }) => {
  const { operarios, maquinas, tiposCalidad, tiposTubos, turnos } =
    useContext(DataContext);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [tubosFiltrados, setTubosFiltrados] = useState([]);

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      id: data?.id || undefined,
      operario_id: data?.operario_id || '',
      turno_id: data?.turno_id || '',
      maquina_id: data?.maquina_id || '',
      calidad_id: data?.calidad_id || '',
      tubo_id: data?.tubo_id || '',
      cant_tubos_buenos: data?.cant_tubos_buenos || 0,
      cant_tubos_malos: data?.cant_tubos_malos || 0,
      concentracion_taladrina: data?.concentracion_taladrina || 0,
      observacion: data?.observacion || '',
      fecha: data?.creado
        ? new Date(data.creado).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    },
  });

  const { handleSubmit, watch, setValue } = methods;
  const watchMaquinaId = watch('maquina_id');
  const watchCalidadId = watch('calidad_id');

  const loadTubos = async (maquinaId, calidadId) => {
    try {
      const result = await window.api.tubos.getAllForSelects({
        maquina_id: maquinaId,
        calidad_id: calidadId,
      });
      if (result.success) {
        setTubosFiltrados(result.data);
      } else {
        console.error('Error cargando tubos:', result.error);
      }
    } catch (error) {
      console.error('Error cargando tubos:', error);
    }
  };

  useEffect(() => {
    const maquinaId = Number(watchMaquinaId);
    const calidadId = Number(watchCalidadId);

    if (maquinaId > 0 && calidadId > 0) {
      loadTubos(maquinaId, calidadId);
      return;
    }

    setTubosFiltrados([]);
    setValue('tubo_id', '');
  }, [watchMaquinaId, watchCalidadId, tiposTubos, setValue]);

  const getInitialFecha = () => {
    if (!data?.creado) return null;

    return new Date(data.creado).toISOString().split('T')[0];
  };

  const buildSubmitPayload = (formData) => {
    const initialFecha = getInitialFecha();
    const fecha = initialFecha === formData.fecha ? null : formData.fecha;
    return {
      ...formData,
      creado: fecha,
    };
  };

  const handleFormSubmit = (formData) => {
    if (
      formData.concentracion_taladrina > 8 ||
      formData.concentracion_taladrina < 6
    ) {
      setPendingFormData(formData);
      setOpenConfirmDialog(true);
      return;
    }

    handleConfirm(buildSubmitPayload(formData));
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setPendingFormData(null);
  };

  const handleConfirmDialog = () => {
    if (pendingFormData) {
      handleConfirm(buildSubmitPayload(pendingFormData));
    }
    handleCloseConfirmDialog();
  };

  return (
    <FormProvider {...methods}>
      <Box
        component="form"
        onSubmit={handleSubmit(handleFormSubmit)}
        sx={{ p: 2 }}
      >
        {/* SECCIÓN 1: IDENTIFICACIÓN Y RESPONSABLES */}
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
              Producción y Responsables
            </Typography>
          </Stack>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Select
                size="small"
                name="operario_id"
                label="Operario"
                options={operarios.map((o) => ({
                  label: o.nombre_completo,
                  value: o.id,
                }))}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Select
                size="small"
                name="turno_id"
                label="Turno"
                options={turnos.map((t) => ({
                  label: t.horario,
                  value: t.id,
                }))}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Select
                size="small"
                name="maquina_id"
                label="Máquina"
                options={maquinas.map((m) => ({
                  label: m.maquina,
                  value: m.id,
                }))}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                size="small"
                name="fecha"
                label="Fecha"
                type="date"
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* SECCIÓN 2: DETALLES DE PRODUCCIÓN */}
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
              Detalles de Producción
            </Typography>
          </Stack>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Select
                size="small"
                name="calidad_id"
                label="Calidad"
                options={tiposCalidad.map((calidad) => ({
                  label: calidad.nombre,
                  value: calidad.id,
                }))}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Select
                size="small"
                name="tubo_id"
                label="Tubo"
                options={tubosFiltrados.map((t) => ({
                  label: t.art_concepto || t.concepto || `Tubo ${t.id}`,
                  value: t.id,
                }))}
                fullWidth
                disabled={
                  !watchMaquinaId ||
                  !watchCalidadId ||
                  tubosFiltrados.length === 0
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                size="small"
                name="cant_tubos_buenos"
                label="Tubos Buenos"
                type="number"
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                size="small"
                name="cant_tubos_malos"
                label="Tubos Malos"
                type="number"
                fullWidth
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                size="small"
                name="concentracion_taladrina"
                label="Concentración Taladrina (mg/L) entre 6 y 8"
                type="number"
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }} />
            <Grid size={{ xs: 12, sm: 4 }} />

            <Grid size={{ xs: 12 }}>
              <TextField
                size="small"
                name="observacion"
                label="Observación"
                fullWidth
                multiline
                rows={3}
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

        {/* DIÁLOGO DE CONFIRMACIÓN */}
        <Dialog
          open={openConfirmDialog}
          onClose={handleCloseConfirmDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Confirmar Producción</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 1.5 }}>
              ¿Está seguro de guardar esta producción de tubos?
            </DialogContentText>
            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
              <Stack flexDirection={'column'} spacing={1}>
                <Typography variant="caption">
                  <strong>Operario:</strong>{' '}
                  {operarios.find((o) => o.id === pendingFormData?.operario_id)
                    ?.nombre_completo || 'N/A'}
                </Typography>
                <Typography variant="caption">
                  <strong>Concentración Taladrina:</strong>{' '}
                  {pendingFormData?.concentracion_taladrina} mg/L
                </Typography>
                <Typography variant="caption">
                  <strong>Tubos Buenos:</strong>{' '}
                  {pendingFormData?.cant_tubos_buenos}
                </Typography>
                <Typography variant="caption">
                  <strong>Tubos Malos:</strong>{' '}
                  {pendingFormData?.cant_tubos_malos}
                </Typography>
                {pendingFormData?.observacion && (
                  <Typography variant="caption">
                    <strong>Observación:</strong> {pendingFormData.observacion}
                  </Typography>
                )}
              </Stack>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseConfirmDialog}
              color="secondary"
              variant="contained"
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirmDialog} variant="contained">
              Confirmar y Guardar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </FormProvider>
  );
};

export default ProdTubosForm;
