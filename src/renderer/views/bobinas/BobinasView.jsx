import React, { useContext } from 'react';
import { DataContext } from '../../contexts/DataContext';
import BobinasCrud from './BobinasCrud';
import Loading from '../Loading/Loading';

const BobinasView = () => {
  const { loading } = useContext(DataContext);
  return <>{loading ? <Loading /> : <BobinasCrud />}</>;
};

export default BobinasView;
