import React from "react";
import Modal from "../../../components/common/Modal";
import BobinaForm from "./Form";

const BobinasModal = ({
  data = null,
  open = false,
  handleConfirm = () => {},
  handleCancel = () => {},
}) => {
  return (
    <Modal
      title={!data?.id ? "Crear Nueva Bobina" : "Actualizar Bobina"}
      maxWidth="lg"
      open={open}
      handleClose={handleCancel}
    >
      <BobinaForm
        data={data}
        handleConfirm={handleConfirm}
        handleCancel={handleCancel}
      />
    </Modal>
  );
};

export default BobinasModal;
