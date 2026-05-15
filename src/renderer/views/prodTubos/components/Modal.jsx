import React from 'react';
import Modal from '../../../components/common/Modal';
import ProdTubosForm from './Form';

const ProdTubosModal = ({
  data = null,
  open = false,
  handleConfirm = () => {},
  handleCancel = () => {},
}) => {
  return (
    <Modal
      title={
        !data?.id
          ? 'Crear Nueva Producción de Tubos'
          : 'Actualizar Producción de Tubos'
      }
      maxWidth="lg"
      open={open}
      handleClose={handleCancel}
    >
      <ProdTubosForm
        data={data}
        handleConfirm={handleConfirm}
        handleCancel={handleCancel}
      />
    </Modal>
  );
};

export default ProdTubosModal;
