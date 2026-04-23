import React from "react";
import Modal from "../../../components/common/Modal";
import PlantillaForm from "./Form";

const PlantillaModal = ({
  data = null,
  open = false,
  handleConfirm = () => {},
  handleCancel = () => {},
}) => {
  return (
    <Modal
      title={!data?.id ? "Agregar Nueva Plantilla" : "Actualizar Plantilla"}
      maxWidth="lg"
      open={open}
      handleClose={handleCancel}
    >
      <PlantillaForm
        data={data}
        handleConfirm={handleConfirm}
        handleCancel={handleCancel}
      />
    </Modal>
  );
};

export default PlantillaModal;
