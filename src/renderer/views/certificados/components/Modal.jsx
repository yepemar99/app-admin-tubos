import React from "react";
import Modal from "../../../components/common/Modal";
import MallaCertificadoForm from "./Form";

const MallaCertificadoModal = ({
  data,
  open = false,
  handleConfirm = () => {},
  handleCancel = () => {},
}) => {
  return (
    <Modal
      title={data?.id ? "Actualizar Certificado" : "Agregar Nuevo Certificado"}
      maxWidth="lg"
      open={open}
      handleClose={handleCancel}
    >
      <MallaCertificadoForm
        data={data}
        handleCancel={handleCancel}
        handleSave={handleConfirm}
      />
    </Modal>
  );
};

export default MallaCertificadoModal;
