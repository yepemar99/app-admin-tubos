import React from "react";
import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loadRegions } from "../../mallas/utils";
import { Box, Button, Grid, Typography } from "@mui/material";
import Select from "../../../components/common/Select";
import { flexEnd } from "../../../utils/styles";
import TextField from "../../../components/common/Textfield";

const schema = z.object({
  nombre: z.string().nonempty("El nombre es obligatorio"),
  tipo: z.string().nonempty("La tipo es obligatoria"),
  titulo: z.string().nonempty("El título es obligatoria"),
  region: z.string().nonempty("La región es obligatorio"),
  numero_varillas: z.string().nonempty("La numero_varillas es obligatoria"),
  peso: z.string().nonempty("La peso es obligatoria"),
  unidades_paquetes: z.string().nonempty("La unidades_paquete es obligatoria"),
  lote: z.string().nonempty("La lote es obligatoria"),
  numero_paquetes: z.string().nonempty("La numero_paquetes es obligatoria"),
});

const PlantillaForm = ({
  data,
  handleConfirm = () => {},
  handleCancel = () => {},
}) => {
  const [regions, setRegions] = React.useState([]);

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: data?.nombre ? `${data?.nombre}` : "",
      titulo: data?.titulo ? `${data?.titulo}` : "",
      region: data?.region ? `${data?.region}` : "",
      tipo: data?.tipo ? `${data?.tipo}` : "",
      numero_varillas: data?.numero_varillas ? `${data?.numero_varillas}` : "",
      peso: data?.peso ? `${data?.peso}` : "",
      unidades_paquetes: data?.unidades_paquetes
        ? `${data?.unidades_paquetes}`
        : "",
      lote: data?.lote ? `${data?.lote}` : "",
      numero_paquetes: data?.numero_paquetes ? `${data?.numero_paquetes}` : "",
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
      const regionsOptions = (regionsResult?.data || []).map((r) => ({
        label: r,
        value: r,
      }));
      setRegions(regionsOptions);
    };

    fetchData();
  }, []);

  return (
    <FormProvider {...methods}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ width: "100%" }}>
          <Typography sx={{ mb: 1 }} gutterBottom>
            Datos Generales
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField fullWidth name="nombre" label="Nombre" size="small" />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Select
                size="small"
                name={"region"}
                label={"Región"}
                options={regions}
                onChange={(value) => {
                  setValue("region", value);
                }}
              />
            </Grid>
          </Grid>
        </Box>
        <Box mt={2} sx={{ width: "100%" }}>
          <Typography sx={{ mb: 1 }} gutterBottom>
            Título Superior de la Plantilla
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth name="titulo" label="Título" size="small" />
            </Grid>
          </Grid>
        </Box>
        <Box mt={2} sx={{ width: "100%" }}>
          <Typography sx={{ mb: 1 }} gutterBottom>
            Campos de la Plantilla
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                name="tipo"
                label="Designación"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                name="numero_varillas"
                label="Número de varillas"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                name="peso"
                label="Peso teórico"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                name="unidades_paquetes"
                label="Número unidades por paquete"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField fullWidth name="lote" label="Lote" size="small" />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                name="numero_paquetes"
                label="Número de paquete"
                size="small"
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

export default PlantillaForm;
