import Modal from "../../../components/common/Modal";
import React from "react";
import TurnoForm from "./Form";

const TurnoModal = ({
  data = null,
  open = false,
  handleConfirm = () => {},
  handleCancel = () => {},
}) => {
  return (
    <Modal
      title={!data?.id ? "Agregar Nuevo Turno" : "Actualizar Turno"}
      maxWidth="lg"
      open={open}
      handleClose={handleCancel}
    >
      <TurnoForm
        data={data}
        handleConfirm={handleConfirm}
        handleCancel={handleCancel}
      />
    </Modal>
  );
};

export default TurnoModal;
