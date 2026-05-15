import React, { useContext } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Grid, Paper, Typography, Stack } from '@mui/material';
import { Person, FilterList } from '@mui/icons-material';
import TextField from '../../../components/common/Textfield';
import Select from '../../../components/common/Select';
import { DataContext } from '../../../contexts/DataContext';
import { toast } from 'react-toastify';
import { set, z } from 'zod';
import Modal from '../../../components/common/Modal';

const salidaSchema = z.object({
  id: z.number().optional(),
  operario_id: z
    .number({ invalid_type_error: 'Seleccione un operario' })
    .positive('Requerido'),
  calidad_id: z
    .number({ invalid_type_error: 'Seleccione la calidad' })
    .positive('Requerido'),
  tubo_id: z
    .number({ invalid_type_error: 'Seleccione el tubo' })
    .positive('Requerido'),
  num_paqs: z.coerce
    .number()
    .int('Debe ser un número entero')
    .positive('Debe ser mayor a 0'),
  fecha: z.string().min(1, 'La fecha es obligatoria'),
  observacion: z.string().optional(),
});

const SalidaTuboForm = ({ data, handleConfirm, handleCancel }) => {
  // Extraemos tiposCalidad para el nuevo select y productos para filtrar
  const { operarios, tiposCalidad } = useContext(DataContext);
  const [tubos, setTubos] = React.useState([]);
  const [loadingTubos, setLoadingTubos] = React.useState(false);
  const [msgError, setMsgError] = React.useState('');
  const [showModalError, setShowModalError] = React.useState(false);
  const [pendingFormData, setPendingFormData] = React.useState(null);

  const methods = useForm({
    resolver: zodResolver(salidaSchema),
    defaultValues: {
      operario_id: data?.operario_id || '',
      calidad_id: data?.calidad_id || '',
      tubo_id: data?.tubo_id || '',
      num_paqs: data?.num_paqs || 1,
      fecha: data?.creado || new Date().toISOString().split('T')[0],
      observacion: data?.observacion || '',
    },
  });

  const { handleSubmit, watch, setValue, reset } = methods;

  const watchCalidadId = watch('calidad_id');
  const prevCalidadIdRef = React.useRef();

  const loadTubos = async (tipoCalidad_id) => {
    try {
      setLoadingTubos(true);
      const result = await window.api.tubos.getAllForSelects({
        calidad_id: tipoCalidad_id,
      });
      setTubos(result?.data || []);
      setLoadingTubos(false);
      return result?.data || [];
    } catch (err) {
      setLoadingTubos(false);
      toast.error(err?.message || 'Error al cargar tubos');
      return [];
    }
  };

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

  const handleFormSubmit = async (formData) => {
    try {
      if (
        data?.tubo_id !== formData.tubo_id ||
        data?.num_paqs < formData.num_paqs
      ) {
        const tuboResult = await window.api.tubos.getAll({
          tubo_id: formData.tubo_id,
          pageSize: 1,
        });
        const tuboSeleccionado = tuboResult?.data?.[0];
        if (!tuboSeleccionado) {
          toast.error('Tubo seleccionado no encontrado');
          return;
        }
        if (tuboSeleccionado.num_paquetes < formData.num_paqs) {
          setMsgError(
            'Este tubo solo tiene ' +
              tuboSeleccionado.num_paquetes +
              ' paquetes disponibles y se están intentando sacar ' +
              formData.num_paqs,
          );
          setPendingFormData(formData);
          setShowModalError(true);
          return;
        }
      }

      await handleConfirm(buildSubmitPayload(formData));
    } catch (error) {
      toast.error(error?.message || 'Error al enviar el formulario');
    }
  };

  React.useEffect(() => {
    const resetValues = {
      id: data?.id || undefined,
      operario_id: data?.operario_id || '',
      calidad_id: data?.calidad_id || '',
      tubo_id: data?.tubo_id || '',
      num_paqs: data?.num_paqs || 1,
      fecha: data?.creado
        ? new Date(data?.creado).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      observacion: data?.observacion || '',
    };

    prevCalidadIdRef.current = resetValues.calidad_id || undefined;
    reset(resetValues);
  }, [data, reset]);

  React.useEffect(() => {
    const syncTubosByCalidad = async () => {
      if (!watchCalidadId) {
        setTubos([]);
        setValue('tubo_id', '');
        prevCalidadIdRef.current = undefined;
        return;
      }

      await loadTubos(watchCalidadId);

      if (
        prevCalidadIdRef.current &&
        prevCalidadIdRef.current !== watchCalidadId
      ) {
        setValue('tubo_id', '');
      }

      prevCalidadIdRef.current = watchCalidadId;
    };

    syncTubosByCalidad();
  }, [watchCalidadId, setValue]);

  React.useEffect(() => {
    const resolveCalidadFromTubo = async () => {
      if (!data?.id || !data?.tubo_id || watchCalidadId) {
        return;
      }

      try {
        const result = await window.api.tubos.getAll({
          pageSize: 1,
          tubo_id: data.tubo_id,
        });
        const tuboEncontrado = result?.data?.[0];

        if (tuboEncontrado?.calidad_id) {
          setValue('calidad_id', tuboEncontrado.calidad_id);
        }
      } catch (err) {
        toast.error(err?.message || 'Error al resolver calidad del tubo');
      }
    };

    resolveCalidadFromTubo();
  }, [data, watchCalidadId, setValue]);

  return (
    <FormProvider {...methods}>
      <Box
        component="form"
        onSubmit={handleSubmit((formData) => {
          handleFormSubmit(formData);
        })}
        sx={{ p: 2 }}
      >
        <Grid container spacing={3}>
          {/* SECCIÓN DATOS DE CONTROL (Operario y Fecha) */}
          <Grid size={{ xs: 12 }}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fa' }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Person fontSize="small" color="action" />
                <Typography variant="subtitle2" fontWeight="bold">
                  Responsable
                </Typography>
              </Stack>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Select
                    size="small"
                    name="operario_id"
                    label="Seleccionar Operario"
                    options={
                      operarios?.map((o) => ({
                        value: o.id,
                        label: o.nombre_completo || '',
                      })) || []
                    }
                    fullWidth
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField size="small" name="fecha" type="date" fullWidth />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* SECCIÓN FILTRADO Y PRODUCTO */}
          <Grid size={{ xs: 12 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <FilterList fontSize="small" color="action" />
                <Typography variant="subtitle2" fontWeight="bold">
                  Filtrar por Calidad
                </Typography>
              </Stack>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Select
                    size="small"
                    name="calidad_id"
                    label="Seleccione Calidad"
                    options={
                      tiposCalidad?.map((c) => ({
                        value: c.id,
                        label: c.nombre,
                      })) || []
                    }
                    onChange={(val) => {
                      setValue('calidad_id', val);
                      loadTubos(val);
                    }}
                    fullWidth
                  />
                </Grid>

                {/* 2. Select de Tubo (Dependiente de Calidad) */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Select
                    size="small"
                    name="tubo_id"
                    label={
                      watchCalidadId
                        ? 'Seleccionar Tubo'
                        : 'Primero seleccione una calidad'
                    }
                    disabled={!watchCalidadId}
                    loading={loadingTubos}
                    options={tubos.map((p) => ({
                      value: p.id,
                      label: p.concepto || `N/A`,
                    }))}
                    fullWidth
                  />
                </Grid>

                {/* Cantidad y Observaciones */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    size="small"
                    name="num_paqs"
                    label="Nº Paquetes"
                    type="number"
                    fullWidth
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Box>
                    <TextField
                      size="small"
                      name="observacion"
                      label="Observaciones"
                      multiline
                      rows={5}
                      fullWidth
                    />
                  </Box>
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
            size="small"
            variant="contained"
            color="secondary"
            onClick={handleCancel}
          >
            Cancelar
          </Button>
          <Button
            size="small"
            variant="contained"
            type="submit"
            color="primary"
          >
            Guardar
          </Button>
        </Stack>
      </Box>
      <Modal
        open={showModalError}
        title="Inventario insuficiente"
        showCustom
        showCancel
        customText="Continuar"
        handleClose={() => setShowModalError(false)}
        handleCancel={() => setShowModalError(false)}
        handleCustom={() => {
          setShowModalError(false);
          handleConfirm(buildSubmitPayload(pendingFormData));
          setPendingFormData(null);
        }}
      >
        <Typography>{msgError}</Typography>
      </Modal>
    </FormProvider>
  );
};

export default SalidaTuboForm;
