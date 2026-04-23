import React from "react";
import Modal from "../../../components/common/Modal";
import MallasForm from "./Form";

const MallaModal = ({
  data = null,
  open = false,
  handleConfirm = () => {},
  handleCancel = () => {},
}) => {
  return (
    <Modal
      title={!data?.id ? "Agregar Nueva Malla" : "Actualizar Malla"}
      maxWidth="lg"
      open={open}
      handleClose={handleCancel}
    >
      <MallasForm
        data={data}
        handleConfirm={handleConfirm}
        handleCancel={handleCancel}
      />
    </Modal>
  );
};

export default MallaModal;
