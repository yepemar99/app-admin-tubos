import React from "react";
import Modal from "../../../components/common/Modal";
import TuboForm from "./Form";

const TubosModal = ({
  data = null,
  open = false,
  handleConfirm = () => {},
  handleCancel = () => {},
}) => {
  return (
    <Modal
      title={!data?.id ? "Crear Nuevo Tubo" : "Actualizar Tubo"}
      maxWidth="lg"
      open={open}
      handleClose={handleCancel}
    >
      <TuboForm
        data={data}
        handleConfirm={handleConfirm}
        handleCancel={handleCancel}
      />
    </Modal>
  );
};

export default TubosModal;
