import React from "react";
import Modal from "../../../components/common/Modal";
import PlanesForm from "./Form";


const PlanCorteModal = ({
    data = null,
    open = false,
    handleConfirm = () => { },
    handleCancel = () => { },
}) => {
    return (
        <Modal
            title={!data?.id ? "Crear Nuevo Plan" : "Actualizar Plan"}
            maxWidth="lg"
            open={open}
            handleClose={handleCancel}
        >
            <PlanesForm
                data={data}
                handleConfirm={handleConfirm}
                handleCancel={handleCancel}
            />
        </Modal>
    );
};

export default PlanCorteModal;