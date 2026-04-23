import { Box, Button, Typography } from "@mui/material";
import Modal from "../../../components/common/Modal";
import React from "react";
import { flexEnd } from "../../../utils/styles";

const ExportModal = ({
  open = false,
  onConfirm = () => {},
  onCancel = () => {},
  onNoConfirm = () => {},
}) => {
  return (
    <Modal
      title={"Confirmar datos de exportación"}
      maxWidth="lg"
      open={open}
      handleClose={onCancel}
    >
      <Typography>
        ¿Desea importar el excel para actualizar una base de datos local o solo
        los datos de las mallas?
      </Typography>
      <Box sx={{ ...flexEnd, mt: 2 }}>
        <Button size="small" variant="contained" onClick={onConfirm}>
          Solo Mallas
        </Button>
        <Button size="small" variant="contained" onClick={onNoConfirm}>
          Actualizar base de datos local
        </Button>
        <Button
          size="small"
          variant="contained"
          color="secondary"
          onClick={onCancel}
        >
          Cancelar
        </Button>
      </Box>
    </Modal>
  );
};

export default ExportModal;
