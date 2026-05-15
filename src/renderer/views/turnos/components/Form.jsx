import { Box, Button, Grid } from '@mui/material';
import React from 'react';
import { z } from 'zod';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import TextField from '../../../components/common/Textfield';
import { flexEnd } from '../../../utils/styles';

const schema = z.object({
  entrada: z.string().nonempty('La entrada es obligatoria'),
  salida: z.string().nonempty('La salida es obligatoria'),
});

const TurnoForm = ({
  data,
  handleConfirm = () => {},
  handleCancel = () => {},
}) => {
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      entrada: data?.entrada ? `${data?.entrada}` : '',
      salida: data?.salida ? `${data?.salida}` : '',
    },
  });
  const { handleSubmit } = methods;

  const onSubmit = (data) => {
    handleConfirm(data);
  };

  return (
    <FormProvider {...methods}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ width: '100%' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                name="entrada"
                label="Entrada"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth name="salida" label="Salida" size="small" />
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
