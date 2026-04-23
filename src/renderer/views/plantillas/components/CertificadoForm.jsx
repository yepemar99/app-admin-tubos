import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import Select from "../../../components/common/Select";
import { flex, flexEnd, flexSpaceBetween } from "../../../utils/styles";
import { loadDiametros } from "../../mallas/utils";

const schema = z.object({
  certificado_id: z.number().min(1, "Certificado no válido"),
  diametros: z
    .array(z.number({ invalid_type_error: "Cada diámetro debe ser un número" }))
    .min(1, "Debes incluir al menos un diámetro"), // Valida que no esté vacío
});

const CertificadoForm = ({
  initData,
  handleConfirm = () => {},
  handleCancel = () => {},
}) => {
  const [certificados, setCertificados] = useState([]);
  const [diametros, setDiametros] = useState([]);
  const [diametrosSeleccionados, setDiametrosSeleccionados] = useState(
    initData?.diametros || []
  );

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      certificado_id: initData?.certificado_id,
      diametros: initData?.diametros,
    },
  });

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
    setValue,
    getValues,
  } = methods;

  const onSubmit = (data) => {
    handleConfirm({ ...data, id: initData?.id });
  };

  React.useEffect(() => {
    const fetchData = async () => {
      const certificadosResult = await window.api.certificados.getAll();
      const certificadoOptions = (certificadosResult?.data || []).map((c) => ({
        label: c.certificado,
        value: c.id,
      }));

      if (!initData?.region) {
        toast.error("Error Certificado Formulario: No se encontró la región");
        return;
      }
      const diametrosResult = await loadDiametros(initData?.region);
      const diametroOptions = (diametrosResult?.data || []).map((d) => ({
        label: `${d}`,
        value: d,
      }));
      setCertificados(certificadoOptions);
      setDiametros(diametroOptions);
    };

    fetchData();
  }, []);

  const handleSelect = (newOption) => {
    console.log("evento");
    const findD = diametrosSeleccionados.find((d) => d == newOption);
    if (findD) {
      const newDs = diametrosSeleccionados.filter((d) => d !== newOption);
      setDiametrosSeleccionados(newDs);
      setValue("diametros", newDs);
    } else {
      const findDO = diametros.find((DO) => DO.value == parseFloat(newOption));
      if (findDO) {
        const diamterosCopy = diametrosSeleccionados;
        diamterosCopy.push(parseFloat(newOption));
        const newDs = diamterosCopy.sort((a, b) => a - b);
        console.log("newDs", newDs);
        setDiametrosSeleccionados([...newDs]);
        setValue("diametros", newDs);
      }
    }
  };

  return (
    <FormProvider {...methods}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <Select
              size="small"
              name={"certificado_id"}
              label={"Certificado"}
              options={certificados}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Box sx={flexSpaceBetween}>
              <Box sx={flex}>
                <Typography sx={{ mb: 0, fontWeight: 600 }} gutterBottom>
                  Diámetros
                </Typography>
                {errors?.diametros?.message && (
                  <Typography color={"error"} sx={{ mb: 0 }} gutterBottom>
                    {errors?.diametros?.message}
                  </Typography>
                )}
              </Box>
              <Autocomplete
                size="small"
                disablePortal
                options={diametros}
                getOptionKey={(option) => option.id}
                onInputChange={(event, newInputValue) => {
                  if (newInputValue) {
                    handleSelect(newInputValue);
                  }
                }}
                sx={{ width: 300 }}
                ListboxProps={{
                  style: {
                    padding: 0,
                    maxHeight: 200, // altura máxima en px
                    overflow: "auto",
                  },
                }}
                renderInput={(params) => (
                  <TextField size="small" {...params} label="Seleccionar" />
                )}
              />
            </Box>
            <Box
              sx={{
                mt: 1,
                border: "1px solid",
                borderRadius: "10px",
                height: "200px",
                overflowY: "auto",
                padding: 1,
                ...flex,
              }}
            >
              {diametrosSeleccionados.map((selectedD, index) => {
                return (
                  <Chip
                    key={"selectedDs" + selectedD + index}
                    label={selectedD || "-"}
                    sx={{
                      "& .MuiChip-label": {
                        display: "block",
                        mr: 1,
                        whiteSpace: "normal",
                      },
                    }}
                    onDelete={() => {
                      handleSelect(selectedD);
                    }}
                  ></Chip>
                );
              })}
            </Box>
          </Grid>
        </Grid>
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

export default CertificadoForm;
