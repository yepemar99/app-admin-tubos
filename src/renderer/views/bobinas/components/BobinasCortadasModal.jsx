import React from 'react';
import Modal from '../../../components/common/Modal';
import BobinasCortadas from './BobinasCortadas';

const BobinasCortadasModal = ({
  id = 0,
  concepto = '',
  open = false,
  handleCancel = () => {},
}) => {
  return (
    <Modal
      title={concepto}
      maxWidth="xl"
      open={open}
      handleClose={handleCancel}
    >
      <BobinasCortadas id={id} />
    </Modal>
  );
};

export default BobinasCortadasModal;
