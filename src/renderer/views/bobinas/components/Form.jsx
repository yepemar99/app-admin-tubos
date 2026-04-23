import React, { useContext } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  Stack,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Save, Cancel, Factory, Description } from "@mui/icons-material";
import { z } from "zod";
import TextField from "../../../components/common/Textfield";
import Select from "../../../components/common/Select";
import { DataContext } from "../../../contexts/DataContext";

const schema = z.object({
  id: z.number().optional(),
  fabricante_id: z
    .number({ invalid_type_error: "Seleccione un fabricante" })
    .positive(),
  calidad_id: z
    .number({ invalid_type_error: "Seleccione una calidad" })
    .positive(),
  concepto: z.string().min(1, "El concepto es obligatorio"),
  art_concepto: z.string().min(1, "El concepto de artículo es obligatorio"),
  espesor: z.number().positive("Debe ser mayor a 0"), // Flotante
  ancho: z.number().positive("Debe ser mayor a 0"), // Flotante
  peso_medio: z.number().nonnegative(),
  activa: z.boolean(),
  art_concepto: z.string().min(1, "El concepto de artículo es obligatorio"),
  unidades: z.number().int().positive(), // Entero
});

export const StatusBullet = ({ active }) => (
  <Box
    sx={{
      width: 10,
      height: 10,
      borderRadius: "50%",
      bgcolor: active ? "success.main" : "error.main",
      display: "inline-block",
      mr: 1,
      boxShadow: (theme) =>
        `0 0 0 2px ${theme.palette.background.paper}, 0 0 0 4px ${active ? theme.palette.success.light : theme.palette.error.light}`,
    }}
  />
);

const BobinaForm = ({ data = null, handleConfirm, handleCancel }) => {
  const { fabricantes, tiposCalidad } = useContext(DataContext);

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      id: data?.id || undefined,
      fabricante_id: data?.fabricante_id || "",
      calidad_id: data?.calidad_id || "",
      concepto: data?.concepto || "",
      art_concepto: data?.art_concepto || "",
      espesor: data?.espesor || 0,
      ancho: data?.ancho || 0,
      peso_medio: data?.peso_medio || 0,
      activa: data?.activa ?? true,
      art_concepto: data?.art_concepto || "",
      unidades: data?.unidades || 1,
    },
  });

  const { handleSubmit, watch, setValue } = methods;
  const isActiva = watch("activa");

  return (
    <FormProvider {...methods}>
      <Box
        component="form"
        onSubmit={handleSubmit(handleConfirm)}
        sx={{ p: 2 }}
      >
        {/* SECCIÓN 1: IDENTIFICACIÓN (Estilo Gris) */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            bgcolor: "#f8f9fa",
            borderRadius: 2,
            border: "1px solid #e9ecef",
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
                color={isActiva ? "success.main" : "error.main"}
              >
                {isActiva ? "ARTÍCULO ACTIVO" : "ARTÍCULO INACTIVO"}
              </Typography>
              <Switch
                checked={isActiva}
                onChange={(e) => setValue("activa", e.target.checked)}
                size="small"
              />
            </Stack>
          </Stack>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
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

            <Grid size={{ xs: 12 }}>
              <TextField
                size="small"
                name="concepto"
                label="Concepto General"
                fullWidth
              />
            </Grid>
          </Grid>
        </Paper>

        {/* SECCIÓN 2: ESPECIFICACIONES TÉCNICAS (Dashed Box) */}
        <Box
          sx={{ p: 3, mb: 3, border: "2px dashed #dee2e6", borderRadius: 2 }}
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
                name="art_concepto"
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
      </Box>
    </FormProvider>
  );
};

export default BobinaForm;
