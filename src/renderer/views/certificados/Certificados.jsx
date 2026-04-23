import React from "react";
import ViewHeaderLayout from "../../layouts/ViewHeaderLayout";
import { Box, Button, Typography } from "@mui/material";
import { flex } from "../../utils/styles";
import { Add } from "@mui/icons-material";
import useDataTable from "../../hooks/useDataTable";
import MallasCertificadosTable from "./components/Table";
import { toast } from "react-toastify";
import MallaCertificadoModal from "./components/Modal";
import { PAGE_SIZE } from "../../../utils/constants";
import LoadingModal from "../../components/common/LoadingModal";
import Modal from "../../components/common/Modal";

const CertificadosCrud = () => {
  const loadMallasCertificados = async (page) => {
    const data = await window.api.certificados.getAll();
    return {
      ...data,
      data: data.data.map((row) => ({
        ...row,
      })),
      total: data.data.length,
    };
  };

  const onUpdate = async (newRow) => {
    if (!newRow) {
      toast.error("Elemento no encontrado");
      return null;
    }

    const response = await window.api.certificados.update({
      certificado: {
        certificado: newRow?.certificado,
        imagen: newRow?.imagen,
        filePath: newRow.file?.path,
      },
      id: selectedItem.id,
    });

    return { success: response?.success || false };
  };

  const onDelete = async (id) => {
    return await window.api.certificados.delete(id);
  };

  const onCreate = async (newRow) => {
    console.log("data create", newRow);
    return await window.api.certificados.create({
      certificado: newRow?.certificado,
      imagen: newRow?.imagen,
      filePath: newRow.file?.path,
    });
  };

  const {
    data: mallasCertificados,
    total,
    loading,
    handleFilterChange,
    handlePageChange,
    page,
    selectedItem,
    filters,
    searchTerm,
    loadingFilters,
    showDeleteConfirm,
    handleDelete,
    showDetail,
    handleDetail,
    showForm,
    handleEdit,
    handleCreate,
    actionLoading,
    handleDeleteConfirm,
    handleCreateConfirm,
    handleEditConfirm,
  } = useDataTable({
    fetchData: loadMallasCertificados,
    fetchFilters: () => {},
    onDeleteConfirm: onDelete,
    onCreateConfirm: onCreate,
    onEditConfirm: onUpdate,
    initFilters: [],
  });

  return (
    <Box sx={{ width: "100%" }}>
      <LoadingModal open={actionLoading} />
      <MallaCertificadoModal
        data={selectedItem}
        open={showForm}
        handleConfirm={
          !selectedItem?.id ? handleCreateConfirm : handleEditConfirm
        }
        handleCancel={() => {
          handleCreate(true);
        }}
      />
      <Modal
        showCancel
        showCustom
        title="¿Seguro que desea eliminar este elemento?"
        open={showDeleteConfirm}
        handleCustom={() => {
          handleDeleteConfirm();
        }}
        handleCancel={() => {
          handleDelete(null);
        }}
      >
        <Typography>Esta acción no se puede deshacer.</Typography>
      </Modal>
      <ViewHeaderLayout
        title="Gestión de Certificados"
        sx={{ mb: 2 }}
        actions={
          <Box sx={flex}>
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => {
                handleCreate();
              }}
            >
              Nuevo Certificado
            </Button>
          </Box>
        }
      />
      <MallasCertificadosTable
        loading={loading}
        rows={mallasCertificados}
        total={total}
        page={page}
        handleChangePage={handlePageChange}
        handleDelete={handleDelete}
        handleDetail={() => {}}
        handleEdit={handleEdit}
      />
    </Box>
  );
};

export default CertificadosCrud;
