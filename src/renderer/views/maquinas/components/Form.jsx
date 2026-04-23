import { Box, Button, Grid } from "@mui/material";
import React from "react";
import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "../../../components/common/Textfield";
import Select from "../../../components/common/Select";
import { loadFabricas, loadRegions } from "../../mallas/utils";
import { flexEnd } from "../../../utils/styles";

const schema = z.object({
  nombre: z.string().nonempty("El nombre es obligatorio"),
  fabrica: z.string().nonempty("La fabrica es obligatoria"),
  fabrica_id: z.number({
    invalid_type_error: "La fabrica es obligatoria",
  }),
});

const MaquinaForm = ({
  data,
  handleConfirm = () => {},
  handleCancel = () => {},
}) => {
  const [fabricas, setFabricas] = React.useState([]);
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: data?.nombre ? `${data?.nombre}` : "",
      fabrica_id: data?.fabrica_id ? data?.fabrica_id : "",
      fabrica: data?.fabrica ? `${data?.fabrica}` : "",
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
      const fabricasResult = await loadFabricas();
      const fabricassOptions = (fabricasResult?.data || []).map((f) => ({
        label: f.nombre,
        value: f.id,
      }));
      setFabricas(fabricassOptions);
    };

    fetchData();
  }, []);

  return (
    <FormProvider {...methods}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ width: "100%" }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField fullWidth name="nombre" label="Nombre" size="small" />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Select
                size="small"
                name={"fabrica_id"}
                label={"Fábrica"}
                options={fabricas}
                onChange={(value) => {
                  const findFab = fabricas.find((f) => f.value == value);

                  if (findFab) {
                    setValue("fabrica", findFab?.label || "");
                    setValue("fabrica_id", value || "");
                  }
                }}
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

export default MaquinaForm;
