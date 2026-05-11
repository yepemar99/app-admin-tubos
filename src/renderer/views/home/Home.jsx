import { Box, Typography, Grid } from '@mui/material';
import React, { useContext } from 'react';
import PieChart from '../../components/charts/PieChart';
import ProdTubosChart from './components/ProdTubosChart';
import { DataContext } from '../../contexts/DataContext';
import Loading from '../Loading/Loading';

const Home = () => {
  const { loading } = useContext(DataContext);
  return <Box>{loading ? <Loading /> : <ProdTubosChart />}</Box>;
};

export default Home;
