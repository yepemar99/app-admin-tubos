import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Grid,
  Typography,
} from "@mui/material";
import { flex, flexEnd, flexSpaceBetween } from "../../../utils/styles";
import { loadDiametros } from "../../mallas/utils";
import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import UploadImage from "../../../components/image/UploadImage";
import { toast } from "react-toastify";
import TextField from "../../../components/common/Textfield";
import { getImagePath } from "../../../utils/functions";
import useGetImage from "../../../hooks/useGetImage";

const schema = z.object({
  certificado: z.string().nonempty("El nombre es obligatorio"),
  imagen: z.string(),
});

const MallaCertificadoForm = ({
  data,
  handleSave = () => {},
  handleCancel = () => {},
}) => {
  const { loading, imagePath } = useGetImage(data?.imagen);

  const [fileImage, setFileImage] = useState(null);
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      certificado: data?.certificado ? `${data?.certificado}` : "",
      imagen: data?.imagen ? data?.imagen : "",
    },
  });
  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
    setValue,
  } = methods;

  const onChangeFile = (file = null) => {
    setFileImage(file);
  };

  const onSubmit = (data) => {
    if (!data?.imagen && !fileImage) {
      toast.error("Debe insertar una imagen.");
      return;
    }
    handleSave({ ...data, file: fileImage });
  };

  return (
    <FormProvider {...methods}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ width: "100%" }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                name="certificado"
                label="Nombre"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <UploadImage
                initialImage={imagePath}
                onChange={onChangeFile}
                loading={loading}
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

export default MallaCertificadoForm;
