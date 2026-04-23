import { Box, CircularProgress, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { flexColumnCenter } from "../../../utils/styles";
import CertificadoForm from "./CertificadoForm";

const CertificadoPreForm = ({
  initData,
  handleConfirm = () => {},
  handleCancel = () => {},
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setdata] = useState(null);

  const loadData = async () => {
    setLoading(true);
    if (!initData?.id) {
      setLoading(false);
      toast.error("Error Formulario Certificado: ID no encontrado.");
      return;
    }
    try {
      const result = await window.api.plantillas.getCertificado({
        plantilla_id: initData?.id,
      });
      if (!result?.success) {
        setLoading(false);
        toast.error(
          `Error Formulario Certificado: ${result?.error || "Error inesperado"}`
        );
        return;
      }
      setdata({ ...result?.data, region: initData?.region, id: initData?.id });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("Error Formulario Certificado:", error);
      toast.error("Error Formulario Certificado: Ha ocurrido un error");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Box>
      {loading ? (
        <Box sx={{ ...flexColumnCenter, p: 2 }}>
          <CircularProgress />
          <Typography>Cargando datos...</Typography>
        </Box>
      ) : (
        <CertificadoForm
          initData={data}
          handleConfirm={handleConfirm}
          handleCancel={handleCancel}
        />
      )}
    </Box>
  );
};

export default CertificadoPreForm;
