import { Box, Stack, Typography } from '@mui/material';
import { PieChart, pieClasses } from '@mui/x-charts/PieChart';
import React from 'react';

// Paleta de 6 colores predefinidos (máximo 6 máquinas o categorías)
const PALETTE_COLORS = [
  '#4318FF', // Púrpura
  '#00C49F', // Verde
  '#E4665D', // Rojo
  '#FFB928', // Naranja
  '#5B7FEF', // Azul
  '#81C784', // Verde claro
];

const defaultData = [
  { label: 'Group A', value: 400 },
  { label: 'Group B', value: 300 },
  { label: 'Group C', value: 300 },
  { label: 'Group D', value: 200 },
];

const settings = {
  width: 200,
  height: 200,
};

export default function DonutChart({ data = defaultData }) {
  // Asignar colores automáticamente si no existen
  const dataWithColors = (data || []).map((item, index) => ({
    ...item,
    color: item.color || PALETTE_COLORS[index % PALETTE_COLORS.length],
  }));

  const total = dataWithColors.reduce(
    (sum, item) => sum + (Number(item.value) || 0),
    0,
  );
  return (
    <Stack direction="column" width="100%" spacing={2} alignItems="center">
      <Box flexGrow={1}>
        <PieChart
          series={[
            {
              innerRadius: 30,
              outerRadius: 100,
              paddingAngle: 5,
              cornerRadius: 5,
              startAngle: 0,
              endAngle: 360,
              data: dataWithColors,
            },
          ]}
          hideLegend
          {...settings}
        />
      </Box>

      <Box spacing={1} sx={{ width: '100%' }}>
        {dataWithColors.map((item) => (
          <Stack
            key={item.label}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ gap: 1 }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: item.color || '#ccc',
                }}
              />
              <Typography sx={{ fontSize: 13 }}>{item.label}</Typography>
            </Stack>

            <Typography sx={{ fontWeight: 'bold' }}>
              {(Number(item.value) || 0).toLocaleString()}
            </Typography>
          </Stack>
        ))}

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mt: 1 }}
        >
          <Typography sx={{ color: 'text.secondary' }}>Total</Typography>
          <Typography sx={{ fontWeight: 'bold' }}>
            {total.toLocaleString()}
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
}
