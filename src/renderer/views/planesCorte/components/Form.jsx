import React, { useContext, useState } from 'react';
import { z } from 'zod';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Avatar,
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import TextField from '../../../components/common/Textfield';
import { Add, Delete, Inventory2 } from '@mui/icons-material';
import Select from '../../../components/common/Select';
import { DataContext } from '../../../contexts/DataContext';
import { toast } from 'react-toastify';
import { id } from 'zod/v4/locales';

const flejesCorteSchema = z.object({
  id: z.number().optional(),
  fleje_id: z.number({ invalid_type_error: 'Seleccione un fleje' }).positive(),
  num_flejes: z.number({ invalid_type_error: 'Obligatorio' }).positive(),
  calidad: z.number(),
  peso_unit_definido: z
    .number({ invalid_type_error: 'Obligatorio' })
    .positive(),
  factor_proporcional_peso: z.number(),
  concepto: z.string(),
});

const schema = z.object({
  id: z.number().optional(),
  ancho_estipulado: z
    .number({ invalid_type_error: 'El ancho es obligatorio' })
    .positive(),
  flejes_cortes: z
    .array(flejesCorteSchema)
    .min(1, 'Debes agregar al menos un fleje'),
});

const PlanesForm = ({
  data = null,
  handleConfirm = () => {},
  handleCancel = () => {},
}) => {
  const { tiposCalidad } = useContext(DataContext);
  const [loadingFlejes, setLoadingflejes] = useState(false);
  const [flejes, setFlejes] = useState([]);

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      id: data?.id || undefined,
      ancho_estipulado: data?.ancho_estipulado || 0,
      flejes_cortes: data?.flejes_cortes || [],
      calidad: '',
      fleje_id: '',
      num_flejes: '',
      peso_unit_definido: '',
    },
  });

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'flejes_cortes',
  });

  const loadFlejes = async (tipoCalidad_id) => {
    try {
      setLoadingflejes(true);
      const result = await window.api.flejes.getAllForSelects({
        calidad_id: tipoCalidad_id,
      });
      setFlejes(result.data);
      setLoadingflejes(false);
    } catch (err) {
      setLoadingflejes(false);
      toast.error(err?.message || 'Error al cargar flejes');
    }
  };

  const handleAddFleje = async () => {
    // Validamos solo los campos necesarios para agregar un fleje a la lista
    const isValid = await trigger([
      'fleje_id',
      'num_flejes',
      'peso_unit_definido',
      'calidad',
    ]);

    if (isValid) {
      const current = getValues();
      const flejeSeleccionado = flejes.find((f) => f.id === current.fleje_id);
      const factor =
        (flejeSeleccionado.ancho * current.num_flejes) /
        watch('ancho_estipulado');

      append({
        fleje_id: current.fleje_id,
        num_flejes: Number(current.num_flejes),
        calidad: current.calidad,
        peso_unit_definido: Number(current.peso_unit_definido),
        factor_proporcional_peso: Math.round(factor * 1000) / 1000,
        concepto: flejeSeleccionado?.concepto || 'Fleje',
      });

      // Limpiar campos de entrada para el siguiente fleje
      setValue('fleje_id', '');
      setValue('num_flejes', '');
      setValue('peso_unit_definido', '');
    }
  };

  return (
    <FormProvider {...methods}>
      <Box
        component="form"
        onSubmit={handleSubmit(handleConfirm)}
        sx={{ p: 1 }}
      >
        {/* 1. CABECERA: ANCHO DE BOBINA */}
        <Paper
          elevation={0}
          sx={{ p: 2, mb: 3, bgcolor: '#f1f3f5', borderRadius: 2 }}
        >
          <Grid container alignItems="center" spacing={2}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Configuración del Plan de Corte
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                name="ancho_estipulado"
                type="number"
                label="Ancho de la Bobina (mm)"
                size="small"
                fullWidth
              />
            </Grid>
          </Grid>
        </Paper>

        {/* 2. FORMULARIO DE AGREGADO (DASHED BOX) */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Agregar Flejes al Plan de Corte
            </Typography>
            <Button
              disabled={
                watch('ancho_estipulado') <= 0 ||
                watch('calidad') === '' ||
                watch('fleje_id') === '' ||
                watch('num_flejes') === '' ||
                watch('peso_unit_definido') === ''
              }
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddFleje}
              size="small"
              sx={{ borderRadius: 1.5, textTransform: 'none' }}
            >
              Agregar a la lista
            </Button>
          </Stack>

          <Grid
            container
            spacing={2}
            sx={{ p: 2, border: '1px dashed #b2bec3', borderRadius: 2 }}
          >
            <Grid size={{ xs: 12, sm: 3 }}>
              <Select
                name="calidad"
                label="Calidad"
                size="small"
                options={tiposCalidad.map((c) => ({
                  label: c.nombre,
                  value: c.id,
                }))}
                onChange={(val) => {
                  setValue('calidad', val);
                  loadFlejes(val);
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Select
                loading={loadingFlejes}
                name="fleje_id"
                label="Seleccionar Fleje"
                size="small"
                disabled={!watch('calidad')}
                options={flejes.map((f) => ({
                  label: f.concepto,
                  value: f.id,
                }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                name="num_flejes"
                type="number"
                label="Cantidad"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                name="peso_unit_definido"
                type="number"
                label="Peso Unit (Tn)"
                size="small"
              />
            </Grid>
          </Grid>
        </Box>

        {/* 3. LISTADO TIPO CARDS */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{ mb: 2, fontWeight: 'bold', display: 'flex', gap: 1 }}
            >
              Flejes por Corte
              <Box
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  px: 1,
                  borderRadius: 1,
                }}
              >
                {fields.length}
              </Box>
            </Typography>

            {errors.flejes_cortes?.message && (
              <Typography
                color={'error.main'}
                variant="caption"
                sx={{ mb: 2, display: 'block' }}
              >
                {errors.flejes_cortes?.message}
              </Typography>
            )}
          </Box>

          <Grid container spacing={1}>
            {fields.map((field, index) => {
              const peso_total = field.num_flejes * field.peso_unit_definido;
              return (
                <Grid size={6} key={field.id}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid #e0e0e0',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: '#fcfcfc',
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: 'primary.light',
                        mr: 2,
                        width: 32,
                        height: 32,
                      }}
                    >
                      <Inventory2 sx={{ fontSize: 18 }} />
                    </Avatar>

                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 'bold' }}
                        noWrap
                      >
                        {field.concepto}
                      </Typography>
                    </Box>

                    <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />

                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{ textAlign: 'right' }}
                    >
                      <Box>
                        <Typography variant="caption" display="block">
                          CANT.
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {field.num_flejes}
                        </Typography>
                      </Box>
                      <Box sx={{ minWidth: 60 }}>
                        <Typography variant="caption" display="block">
                          F. Proporcional
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color="primary"
                        >
                          {field.factor_proporcional_peso?.toFixed(2) || 0}{' '}
                        </Typography>
                      </Box>
                    </Stack>

                    <IconButton
                      color="error"
                      onClick={() => remove(index)}
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Paper>
                </Grid>
              );
            })}

            {fields.length === 0 && (
              <Grid size={12}>
                <Typography
                  variant="body2"
                  sx={{
                    py: 4,
                    textAlign: 'center',
                    color: 'text.disabled',
                    border: '1px dashed #eee',
                  }}
                >
                  No hay flejes en la lista
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        <Box
          sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 1 }}
        >
          <Button
            size="small"
            color="secondary"
            variant="contained"
            onClick={handleCancel}
          >
            Cancelar
          </Button>
          <Button size="small" variant="contained" type="submit">
            Guardar
          </Button>
        </Box>
      </Box>
    </FormProvider>
  );
};

export default PlanesForm;
