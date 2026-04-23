import { Box, Button, Typography } from "@mui/material";
import React from "react";
import useDataTable from "../../hooks/useDataTable";
import LoadingModal from "../../components/common/LoadingModal";
import ViewHeaderLayout from "../../layouts/ViewHeaderLayout";
import { flex } from "../../utils/styles";
import { Add } from "@mui/icons-material";
import DataFilters from "../../components/common/DataFilters";
import MaquinasTable from "./components/Table";
import { initFilters } from "./utils";
import MaquinaModal from "./components/Modal";
import Modal from "../../components/common/Modal";

const MaquinasCrud = () => {
  const loadMaquinasCertificados = async (
    page,
    pageSize,
    searchTerm = "",
    filters = []
  ) => {
    const fabricaFilter = filters.find((f) => f.name === "fabrica");
    const data = await window.api.maquinas.getAll({
      page: page,
      pageSize: pageSize,
      fabrica: fabricaFilter?.value || "",
    });
    return data;
  };

  const loadFilters = async () => {
    const fabricas = await window.api.maquinas.getFabricas();
    return {
      fabrica:
        fabricas?.data.map((fabrica) => ({
          label: fabrica?.nombre,
          value: fabrica?.id,
        })) || [],
    };
  };

  const onDeleteMaquina = async (id) => {
    return await window.api.maquinas.delete(id);
  };

  const onUpdateMaquinas = async (data) => {
    return await window.api.maquinas.update({
      maquina: {
        ...data,
      },
      id: selectedItem.id,
    });
  };

  const onCreateMaquina = async (data) => {
    return await window.api.maquinas.create({
      ...data,
    });
  };

  const {
    data: maquinas,
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
    fetchData: loadMaquinasCertificados,
    fetchFilters: loadFilters,
    onDeleteConfirm: onDeleteMaquina,
    onCreateConfirm: onCreateMaquina,
    onEditConfirm: onUpdateMaquinas,
    initFilters: initFilters,
  });

  return (
    <Box sx={{ width: "100%" }}>
      <LoadingModal open={actionLoading} />
      <MaquinaModal
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
        title="Gestión de Máquinas"
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
              Nueva Máquina
            </Button>
          </Box>
        }
      />
      <DataFilters
        hiddenSearch
        sx={{ mb: 1 }}
        searchTerm={""}
        filters={filters}
        loading={loadingFilters}
        handleFilterChange={handleFilterChange}
      />
      <MaquinasTable
        loading={loading}
        rows={maquinas}
        total={total}
        page={page}
        handleChangePage={handlePageChange}
        handleDelete={(row) => {
          handleDelete(row);
        }}
        handleDetail={() => {}}
        handleEdit={(row) => {
          handleEdit(row);
        }}
      />
    </Box>
  );
};

export default MaquinasCrud;
