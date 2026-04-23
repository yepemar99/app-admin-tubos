import Modal from "../../../components/common/Modal";
import React from "react";
import MaquinaForm from "./Form";

const MaquinaModal = ({
  data = null,
  open = false,
  handleConfirm = () => {},
  handleCancel = () => {},
}) => {
  return (
    <Modal
      title={!data?.id ? "Agregar Nueva Máquina" : "Actualizar Máquina"}
      maxWidth="lg"
      open={open}
      handleClose={handleCancel}
    >
      <MaquinaForm
        data={data}
        handleConfirm={handleConfirm}
        handleCancel={handleCancel}
      />
    </Modal>
  );
};

export default MaquinaModal;
