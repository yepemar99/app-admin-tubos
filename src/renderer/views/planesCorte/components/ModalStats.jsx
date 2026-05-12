import React from 'react';
import Modal from '../../../components/common/Modal';
import PlanCorteView from './Stats';

const PlanCorteModalStats = ({
  id = 0,
  open = false,
  handleCancel = () => {},
}) => {
  return (
    <Modal
      title={`Plan de Corte #${id}`}
      maxWidth="xl"
      open={open}
      handleClose={handleCancel}
    >
      <PlanCorteView id={id} />
    </Modal>
  );
};

export default PlanCorteModalStats;
