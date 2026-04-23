import { Box, Button, Grid } from "@mui/material";
import React from "react";
import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "../../../components/common/Textfield";
import { flexEnd } from "../../../utils/styles";

const schema = z.object({
  horario: z.string().nonempty("El horario es obligatorio"),
});

const TurnoForm = ({
  data,
  handleConfirm = () => {},
  handleCancel = () => {},
}) => {
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      horario: data?.horario ? `${data?.horario}` : "",
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

  return (
    <FormProvider {...methods}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ width: "100%" }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                name="horario"
                label="Horario"
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

export default TurnoForm;
