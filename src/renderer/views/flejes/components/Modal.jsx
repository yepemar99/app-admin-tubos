import React from "react";
import Modal from "../../../components/common/Modal";
import BobinaForm from "./Form";
import FlejeForm from "./Form";

const FlejesModal = ({
  data = null,
  open = false,
  handleConfirm = () => {},
  handleCancel = () => {},
}) => {
  return (
    <Modal
      title={!data?.id ? "Crear Nuevo Fleje" : "Actualizar Fleje"}
      maxWidth="lg"
      open={open}
      handleClose={handleCancel}
    >
      <FlejeForm
        data={data}
        handleConfirm={handleConfirm}
        handleCancel={handleCancel}
      />
    </Modal>
  );
};

export default FlejesModal;
