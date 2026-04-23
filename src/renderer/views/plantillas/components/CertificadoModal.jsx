import React from "react";
import Modal from "../../../components/common/Modal";
import CertificadoPreForm from "./CertificadoPreForm";

const CertificadoModal = ({
  data = null,
  open = false,
  handleConfirm = () => {},
  handleCancel = () => {},
}) => {
  return (
    <Modal
      title={"Modificar certificado"}
      maxWidth="lg"
      open={open}
      handleClose={handleCancel}
    >
      <CertificadoPreForm
        initData={data}
        handleConfirm={handleConfirm}
        handleCancel={handleCancel}
      />
    </Modal>
  );
};

export default CertificadoModal;
