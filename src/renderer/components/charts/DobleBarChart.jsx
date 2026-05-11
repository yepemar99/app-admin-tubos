import Box from '@mui/material/Box';
import { BarChart } from '@mui/x-charts/BarChart';
import React from 'react';

const defaultUData = [4000, 3000, 2000, 2780, 1890, 2390, 3490];
const defaultPData = [2400, 1398, 9800, 3908, 4800, 3800, 4300];
const defaultXLabels = [
  'Page A',
  'Page B',
  'Page C',
  'Page D',
  'Page E',
  'Page F',
  'Page G',
];

export default function SimpleBarChart({
  uData = defaultUData,
  pData = defaultPData,
  xLabels = defaultXLabels,
  uLabel = 'uv',
  pLabel = 'pv',
}) {
  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <BarChart
        series={[
          {
            data: uData,
            label: uLabel,
            id: 'uvId',
            colorGetter: () => '#00C49F',
            color: '#00C49F',
          },
          {
            data: pData,
            label: pLabel,
            id: 'pvId',
            colorGetter: () => '#E4665D',
            color: '#E4665D',
          },
        ]}
        xAxis={[{ data: xLabels, height: 28 }]}
        yAxis={[{ width: 50 }]}
      />
    </Box>
  );
}
