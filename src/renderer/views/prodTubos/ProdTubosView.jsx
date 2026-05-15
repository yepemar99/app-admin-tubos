import React, { useContext } from 'react';
import { DataContext } from '../../contexts/DataContext';
import { Box } from '@mui/material';
import Loading from '../Loading/Loading';
import ProdTubos from './ProdTubos';

const ProdTubosView = () => {
  const { loading } = useContext(DataContext);
  return <Box>{loading ? <Loading /> : <ProdTubos />}</Box>;
};

export default ProdTubosView;
