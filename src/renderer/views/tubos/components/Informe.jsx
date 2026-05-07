import React, { useState } from 'react';
import Modal from '../../../components/common/Modal';
import { Button, Box, TextField } from '@mui/material';

const InformePaqs = ({ onGenerate = () => {} }) => {
  const [open, setOpen] = useState(false);
  const [fechaInicial, setFechaInicial] = useState('');
  const [fechaFinal, setFechaFinal] = useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setFechaInicial('');
    setFechaFinal('');
    setOpen(false);
  };

  const handleAccept = () => {
    try {
      onGenerate({ fechaInicial, fechaFinal });
    } finally {
      handleClose();
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="secondary"
        size="small"
        onClick={handleOpen}
      >
        Generar Informe
      </Button>

      <Modal
        title={
          'Selecciona el rango de fecha para tu informe de salida de paquetes'
        }
        open={open}
        handleClose={handleClose}
        showCustom
        showCancel
        customText="Aceptar"
        cancelText="Cancelar"
        handleCustom={handleAccept}
        handleCancel={handleClose}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexDirection: 'column',
            minWidth: 300,
          }}
        >
          <TextField
            label="Fecha inicial"
            size="small"
            type="date"
            value={fechaInicial}
            onChange={(e) => setFechaInicial(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Fecha final"
            size="small"
            type="date"
            value={fechaFinal}
            onChange={(e) => setFechaFinal(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </Modal>
    </>
  );
};

export default InformePaqs;
