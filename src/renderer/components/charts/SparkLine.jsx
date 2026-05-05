import Stack from '@mui/material/Stack';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import React from 'react';

const settings = {
  height: 50,
  yAxis: { min: 0, max: 20 },
};

const defaultValues = [0, 2, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20, 5];

export default function ColorCustomization({ values = defaultValues }) {
  return (
    <Stack sx={{ width: '100%' }}>
      <SparkLineChart data={values} color="#88D4B7" {...settings} />
    </Stack>
  );
}
