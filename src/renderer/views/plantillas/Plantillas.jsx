import { Box, Button, Typography } from "@mui/material";
import React, { useState } from "react";
import ViewHeaderLayout from "../../layouts/ViewHeaderLayout";
import { Add } from "@mui/icons-material";
import { flex } from "../../utils/styles";
import useDataTable from "../../hooks/useDataTable";
import PlantillasTable from "./components/Table";
import DataFilters from "../../components/common/DataFilters";
import { initFilters } from "./utils";
import { loadRegions } from "../mallas/utils";
import LoadingModal from "../../components/common/LoadingModal";
import PlantillaModal from "./components/Modal";
import Modal from "../../components/common/Modal";
import CertificadoModal from "./components/CertificadoModal";
import { toast } from "react-toastify";

const PlantillasCrud = () => {
  const [certificateOpen, setCertificateOpen] = useState(false);
  const [loadingCertificado, setLoadingCertificado] = useState(false);

  const toggleCertificateOpen = () => {
    setCertificateOpen(!certificateOpen);
  };

  // Función para cargar las mallas desde la API
  const loadPlantillas = async (
    page,
    pageSize,
    searchTerm = "",
    filters = []
  ) => {
    const regionFilter = filters.find((f) => f.name === "region");
    const data = await window.api.plantillas.getAll({
      page: page,
      pageSize: pageSize,
      region: regionFilter?.value || "",
    });
    return data;
  };

  const loadFilters = async () => {
    const regions = await window.api.plantillas.getRegions();
    return {
      region: regions?.data || [],
    };
  };

  const onUpdatePlantilla = async (data) => {
    return await window.api.plantillas.update({
      plantilla: {
        ...data,
      },
      id: selectedItem.id,
    });
  };

  const onCreatePlantilla = async (data) => {
    return await window.api.plantillas.create({
      ...data,
    });
  };

  const onDeletePlantilla = async (id) => {
    return await window.api.plantillas.delete(id);
  };

  const onUpdateCertificado = async (data) => {
    toggleCertificateOpen();
    setLoadingCertificado(true);
    try {
      console.log("onSubmit", data);
      await window.api.mallasCertificados.update({
        certificado_id: data?.certificado_id,
        plantilla_id: data?.id,
        diametros: data?.diametros,
      });
      setLoadingCertificado(false);
      toast.success("Datos actualizados correctamente.");
    } catch (error) {
      setLoadingCertificado(false);
      toggleCertificateOpen();
      toast.error("Error actualizando certificado");
      console.log("Error actualizando certificado:", error);
    }
  };

  const {
    data: plantillas,
    total,
    loading,
    handleFilterChange,
    handlePageChange,
    page,
    filters,
    searchTerm,
    loadingFilters,
    showDeleteConfirm,
    handleDelete,
    showDetail,
    selectedItem,
    handleDetail,
    handleSelectItem,
    showForm,
    handleEdit,
    handleCreate,
    actionLoading,
    handleDeleteConfirm,
    handleCreateConfirm,
    handleEditConfirm,
  } = useDataTable({
    fetchData: loadPlantillas,
    fetchFilters: loadFilters,
    onDeleteConfirm: onDeletePlantilla,
    onCreateConfirm: onCreatePlantilla,
    onEditConfirm: onUpdatePlantilla,
    initFilters: initFilters,
  });

  const onCancel = () => {
    handleSelectItem(null);
    toggleCertificateOpen();
  };

  console.log("selectedItem", selectedItem);

  return (
    <Box sx={{ width: "100%" }}>
      <PlantillaModal
        data={selectedItem}
        open={showForm}
        handleConfirm={
          !selectedItem?.id ? handleCreateConfirm : handleEditConfirm
        }
        handleCancel={() => {
          handleCreate(true);
        }}
      />
      <CertificadoModal
        data={selectedItem}
        open={certificateOpen}
        handleConfirm={onUpdateCertificado}
        handleCancel={onCancel}
      />
      <LoadingModal open={actionLoading || loadingCertificado} />
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
        title="Gestión de Plantillas"
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
              Nueva Plantilla
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
      <PlantillasTable
        loading={loading}
        rows={plantillas}
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
        handleEditCertificate={(data) => {
          handleSelectItem(data);
          toggleCertificateOpen();
        }}
      />
    </Box>
  );
};

export default PlantillasCrud;
