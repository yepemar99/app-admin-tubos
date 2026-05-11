import { Card, Grid, Typography } from '@mui/material';
import React from 'react';

const cardStyles = {
  p: 2,
  borderLeft: '10px solid',
  borderLeftColor: 'primary.main',
};

const titleStyles = {
  fontWeight: 'bold',
  color: 'primary.main',
};

const Totals = ({ stats }) => {
  return (
    <Grid spacing={1} container>
      <Grid size={{ xs: 12, sm: 2.4 }}>
        <Card variant="outlined" sx={cardStyles}>
          <Typography textAlign={'center'} variant="h6" sx={{ mb: 1 }}>
            {stats?.bobinasCortadas ?? 0}
          </Typography>
          <Typography textAlign={'center'} sx={titleStyles}>
            Bobinas Cortadas
          </Typography>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 2.4 }}>
        <Card variant="outlined" sx={cardStyles}>
          <Typography textAlign={'center'} variant="h6" sx={{ mb: 1 }}>
            {stats?.totalFlejes ?? 0}
          </Typography>
          <Typography textAlign={'center'} sx={titleStyles}>
            Flejes Actuales
          </Typography>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 2.4 }}>
        <Card variant="outlined" sx={cardStyles}>
          <Typography textAlign={'center'} variant="h6" sx={{ mb: 1 }}>
            {stats?.tubosBuenos ?? 0}
          </Typography>
          <Typography textAlign={'center'} sx={titleStyles}>
            Tubos Buenos
          </Typography>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 2.4 }}>
        <Card variant="outlined" sx={cardStyles}>
          <Typography textAlign={'center'} variant="h6" sx={{ mb: 1 }}>
            {stats?.indiceMerma ?? 0}
          </Typography>
          <Typography textAlign={'center'} sx={titleStyles}>
            Índice de Merma
          </Typography>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 2.4 }}>
        <Card variant="outlined" sx={cardStyles}>
          <Typography textAlign={'center'} variant="h6" sx={{ mb: 1 }}>
            {stats?.totalSalidasPaqs ?? 0}
          </Typography>
          <Typography textAlign={'center'} sx={titleStyles}>
            Salidas de Paquetes
          </Typography>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Totals;
