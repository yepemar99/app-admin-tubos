import React from "react";
import Modal from "../../../components/common/Modal";
import SalidaTuboForm from "./Form";

const SalidaPaqsModal = ({
  data = null,
  open = false,
  handleConfirm = () => {},
  handleCancel = () => {},
}) => {
  return (
    <Modal
      title={!data?.id ? "Agregar Salida" : "Actualizar Salida"}
      maxWidth="lg"
      open={open}
      handleClose={handleCancel}
    >
      <SalidaTuboForm
        data={data}
        handleConfirm={handleConfirm}
        handleCancel={handleCancel}
      />
    </Modal>
  );
};

export default SalidaPaqsModal;
