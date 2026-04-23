import React from "react";
import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import TextField from "../../../components/common/Textfield";
import { flexEnd, flexRowAlignCenter } from "../../../utils/styles";
import { Help } from "@mui/icons-material";
import Select from "../../../components/common/Select";
import { loadDiametros, loadRegions } from "../utils";

const schema = z.object({
  art_codigo: z
    .number({
      invalid_type_error: "El código de identificación es obligatorio",
    })
    .positive("El código de identificación debe ser mayor que 0"),
  codigo: z.string().nonempty("El código es obligatorio"),
  designacion: z.string().nonempty("La designación es obligatoria"),
  region: z.string().nonempty("La región es obligatoria"),
  concepto: z.string().nonempty("El concepto es obligatorio"),
  dimensionX: z
    .number({
      invalid_type_error: "Las dimensiones son obligatorias",
    })
    .positive("Las dimensiones deben ser mayores que 0"),
  dimensionY: z
    .number({
      invalid_type_error: "Las dimensiones son obligatorias",
    })
    .positive("Las dimensiones deben ser mayores que 0"),
  diametro: z
    .number({
      invalid_type_error: "El diámetro es obligatorio",
    })
    .positive("El diámetro debe ser mayor que 0"),
  longitud: z
    .number({
      invalid_type_error: "La longitud es obligatoria",
    })
    .positive("La longitud debe ser mayor que 0"),
  transversal: z
    .number({
      invalid_type_error: "El transversal es obligatorio",
    })
    .positive("El transversal debe ser mayor que 0"),
  peso: z
    .number({
      invalid_type_error: "El peso es obligatorio",
    })
    .positive("El peso debe ser mayor que 0"),
  sl: z
    .number({
      invalid_type_error: "El SL es obligatorio",
    })
    .positive("El SL debe ser mayor que 0"),
  st: z
    .number({
      invalid_type_error: "El ST es obligatorio",
    })
    .positive("El ST debe ser mayor que 0"),
  unidades: z
    .number({
      invalid_type_error: "Las unidades son obligatorias",
    })
    .int("Las unidades deben ser un número entero")
    .positive("Las unidades deben ser mayores que 0"),
});

const MallasForm = ({
  data,
  handleConfirm = () => {},
  handleCancel = () => {},
}) => {
  const [regions, setRegions] = React.useState([]);
  const [diametros, setDiametros] = React.useState([]);
  const [regionSelect, setRegionSelect] = React.useState(true);
  const [diametroSelect, setDiametroSelect] = React.useState(true);

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      codigo: data?.codigo ? `${data?.codigo}` : 0,
      art_codigo: data?.art_codigo ? parseInt(data?.art_codigo) : "",
      designacion: data?.designacion || "",
      region: data?.region || "",
      concepto: data?.art_concepto || "",
      dimensionX: data?.dimensiones.split("x")[0]
        ? parseFloat(data?.dimensiones.split("x")[0])
        : 0,
      dimensionY: data?.dimensiones.split("x")[1]
        ? parseFloat(data?.dimensiones.split("x")[1])
        : 0,
      diametro: data?.diametro || 0,
      longitud: data?.longitud || 0,
      transversal: data?.transversal || 0,
      peso: data?.peso_por_paquete || 0,
      sl: data?.sl || 0,
      st: data?.st || 0,
      unidades: data?.unidades_por_paquete || 0,
    },
  });
  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
    setValue,
  } = methods;

  const onSubmit = (data) => {
    handleConfirm(data);
  };

  React.useEffect(() => {
    const fetchData = async () => {
      const regionsResult = await loadRegions();
      const diametrosResult = await loadDiametros();

      const regionsOptions = (regionsResult?.data || []).map((r) => ({
        label: r,
        value: r,
      }));
      const diametrosOptions = (diametrosResult?.data || []).map((d) => ({
        label: d.toString(),
        value: d,
      }));

      regionsOptions.unshift({ label: "Otra", value: "otra" });
      diametrosOptions.unshift({ label: "Otro", value: -1 });

      setRegions(regionsOptions);
      setDiametros(diametrosOptions);
    };

    fetchData();
  }, []);

  return (
    <FormProvider {...methods}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Box>
          <Box sx={flexRowAlignCenter}>
            <Typography sx={{ mb: 0 }} gutterBottom>
              Administración
            </Typography>
            <Tooltip title="Este código es utilizado para identificar de manera única cada malla en el sistema. Es un código proporcionado por administración.">
              <IconButton size={"small"}>
                <Help fontSize={"small"} />
              </IconButton>
            </Tooltip>
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 4 }}>
              <TextField
                name="art_codigo"
                type="number"
                label="Código de identificación"
                size="small"
              />
            </Grid>
          </Grid>
        </Box>
        <Box mt={2}>
          <Typography sx={{ mb: 1 }} gutterBottom>
            Datos Generales
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField name="codigo" label="Código" size="small" />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              {regionSelect ? (
                <Select
                  size="small"
                  name={"region"}
                  label={"Región"}
                  options={regions}
                  optionsExtra={[{ label: "Otra", value: "otra" }]}
                  onChange={(value) => {
                    if (value === "otra") {
                      setRegionSelect(false);
                      setValue("region", "");
                    } else {
                      setValue("region", value);
                    }
                  }}
                />
              ) : (
                <Box display="flex" gap={1} alignItems="center">
                  <TextField name="region" label="Región" size="small" />
                  <Tooltip title="Volver a seleccionar región">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setRegionSelect(true);
                        setValue("region", "");
                      }}
                    >
                      <Help fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField name="concepto" label="Concepto" size="small" />
            </Grid>
            <Grid size={12}>
              <TextField name="designacion" label="Designación" size="small" />
            </Grid>
          </Grid>
        </Box>
        <Box mt={2}>
          <Typography sx={{ mb: 1 }} gutterBottom>
            Longitudes y dimensiones
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 4 }}>
              {diametroSelect ? (
                <Select
                  size="small"
                  name={"diametro"}
                  label={"Diámetro"}
                  options={diametros}
                  optionsExtra={[{ label: "Otro", value: -1 }]}
                  onChange={(value) => {
                    if (value === -1) {
                      setDiametroSelect(false);
                      setValue("diametro", 0);
                    } else {
                      const parsedValue = parseFloat(value);
                      setValue("diametro", parsedValue);
                    }
                  }}
                />
              ) : (
                <Box display="flex" gap={1} alignItems="center">
                  <TextField
                    name="diametro"
                    label="Diámetro (mm)"
                    type="number"
                    size="small"
                  />
                  <Tooltip title="Volver a seleccionar diámetro">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setDiametroSelect(true);
                        setValue("diametro", "");
                      }}
                    >
                      <Help fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField
                name="dimensionX"
                label="Dimensiones largo (mm)"
                size="small"
                type="number"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField
                name="dimensionY"
                label="Dimensiones ancho (mm)"
                type="number"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                name="longitud"
                label="Longitudinal"
                type="number"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                name="transversal"
                label="Transversal"
                type="number"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                name="sl"
                label="Saliente longitudinal"
                type="number"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                name="st"
                label="Saliente transversal"
                type="number"
                size="small"
              />
            </Grid>
          </Grid>
        </Box>
        <Box mt={2}>
          <Typography gutterBottom>Especificaciones del Paquete</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField
                name="unidades"
                label="Unidades Por Paquete"
                size="small"
                type="number"
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                name="peso"
                label="Peso Por Paquete (kg)"
                size="small"
                type="number"
              />
            </Grid>
          </Grid>
        </Box>
        <Box mt={2} sx={flexEnd}>
          <Button type="submit" variant="contained">
            Guardar
          </Button>
          <Button onClick={handleCancel} variant="contained" color="secondary">
            Cancelar
          </Button>
        </Box>
      </Box>
    </FormProvider>
  );
};

export default MallasForm;
