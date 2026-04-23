import React, { useState } from "react";
import { Box, Button, Card, Typography } from "@mui/material";
import MallasTable from "./components/Table";
import { Add } from "@mui/icons-material";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { flex } from "../../utils/styles";
import ViewHeaderLayout from "../../layouts/ViewHeaderLayout";
import DataFilters from "../../components/common/DataFilters";
import {
  initFilters,
  loadDiametros,
  loadLongitudinales,
  loadRegions,
  loadTransversales,
} from "./utils";
import useDataTable from "../../hooks/useDataTable";
import Modal from "../../components/common/Modal";
import LoadingModal from "../../components/common/LoadingModal";
import MallaModal from "./components/Modal";
import { toast } from "react-toastify";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { PAGE_SIZE } from "../../../utils/constants";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";

const MallasCrud = () => {
  const [open, setOpen] = useState(false);

  // Función para cargar las mallas desde la API
  const loadMallas = async (page, pageSize, searchTerm = "", filters = []) => {
    const regionFilter = filters.find((f) => f.name === "region");
    const diametroFilter = filters.find((f) => f.name === "diametro");
    const longitudinalFilter = filters.find((f) => f.name === "longitud");
    const transversalFilter = filters.find((f) => f.name === "transversal");
    const data = await window.api.mallas.getAll({
      page: page,
      pageSize: pageSize,
      searchText: searchTerm || "",
      region: regionFilter?.value || "",
      longitudinal: longitudinalFilter?.value || "",
      transversal: transversalFilter?.value || "",
      diametro: diametroFilter?.value || "",
    });
    return data;
  };

  const onDeleteMalla = async (id) => {
    return await window.api.mallas.delete(id);
  };

  const onCreateMalla = async (mallaData) => {
    return await window.api.mallas.create({
      ...mallaData,
      art_concepto: mallaData.concepto,
      dimensiones: `${mallaData?.dimensionX} x ${mallaData?.dimensionY}`,
      unidades_por_paquete: mallaData.unidades,
      peso_por_paquete: mallaData.peso,
    });
  };

  const onUpdateMalla = async (mallaData) => {
    return await window.api.mallas.update({
      malla: {
        ...mallaData,
        art_concepto: mallaData.concepto,
        dimensiones: `${mallaData?.dimensionX} x ${mallaData?.dimensionY}`,
        unidades_por_paquete: mallaData.unidades,
        peso_por_paquete: mallaData.peso,
      },
      id: selectedItem.id,
    });
  };

  const loadFilters = async () => {
    const regions = await loadRegions();
    const diametros = await loadDiametros();
    const transversales = await loadTransversales();
    const longitudinales = await loadLongitudinales();
    return {
      region: regions?.data || [],
      diametro: diametros?.data || [],
      longitud: longitudinales?.data || [],
      transversal: transversales?.data || [],
    };
  };

  const {
    data: mallas,
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
    showForm,
    handleEdit,
    handleCreate,
    actionLoading,
    setActionLoading,
    handleDeleteConfirm,
    handleCreateConfirm,
    handleEditConfirm,
    handleClearAllFilters,
    setInitFilters,
  } = useDataTable({
    fetchData: loadMallas,
    fetchFilters: loadFilters,
    onDeleteConfirm: onDeleteMalla,
    onCreateConfirm: onCreateMalla,
    onEditConfirm: onUpdateMalla,
    initFilters: initFilters,
  });

  const onExportData = async (all = false) => {
    try {
      setActionLoading(true);
      const result = await window.api.actions.selectDirectory();

      if (!result?.success) {
        throw new Error("Fallo al seleccionar el directorio.");
      }
      const resultExport = await window.api.actions.export({
        path: result?.path || "-",
        all: all,
      });

      if (!resultExport?.success) {
        throw new Error(
          result?.error ? result?.error : "Fallo al exportar el archivo excel."
        );
      }
      setActionLoading(false);
      toast.success("Datos exportados correctamente");
    } catch (error) {
      setActionLoading(false);
      console.log("Error en la exportación de datos", error);
      toast.error(
        error?.message ? error?.message : "Error en la exportación de dato"
      );
    }
  };

  const onImportData = async () => {
    try {
      setActionLoading(true);
      const result = await window.api.actions.selectFile();
      if (!result?.success) {
        throw new Error("Fallo al seleccionar el directorio.");
      }
      const resultImport = await window.api.actions.import({
        filePath: result?.filePath || "",
      });

      if (!resultImport?.success) {
        throw new Error(
          result?.error
            ? result?.error
            : "Fallo al importar datos desde el archivo excel."
        );
      }
      setInitFilters();
      setActionLoading(false);
      toast.success("Datos importados correctamente");
    } catch (error) {
      setActionLoading(false);
      console.log("Error en la importacion de datos", error);
      toast.error(
        error?.message ? error?.message : "Error en la importación de dato"
      );
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <MallaModal
        data={selectedItem}
        open={showForm}
        handleConfirm={
          !selectedItem?.id ? handleCreateConfirm : handleEditConfirm
        }
        handleCancel={() => {
          handleCreate(true);
        }}
      />
      <LoadingModal open={actionLoading} />
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
        title="Gestión de Mallas"
        sx={{ mb: 2 }}
        actions={
          <Box sx={flex}>
            <Button
              size="small"
              variant="contained"
              color="secondary"
              startIcon={<UploadFileIcon />}
              onClick={() => {
                onImportData();
              }}
            >
              Importar Datos
            </Button>
            <Button
              size="small"
              variant="contained"
              color="secondary"
              startIcon={<FileCopyIcon />}
              onClick={() => {
                onExportData(false);
              }}
            >
              Exportar Listado de Mallas
            </Button>
            <Button
              size="small"
              variant="contained"
              color="secondary"
              startIcon={<FileCopyIcon />}
              onClick={() => {
                onExportData(true);
              }}
            >
              Exportar Base de Datos
            </Button>
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => handleCreate(false)}
            >
              Nueva Malla
            </Button>
          </Box>
        }
      />
      <DataFilters
        sx={{ mb: 1 }}
        searchTerm={searchTerm}
        filters={filters}
        loading={loadingFilters}
        handleFilterChange={handleFilterChange}
        handleCleanFilters={handleClearAllFilters}
      />
      <MallasTable
        loading={loading}
        rows={mallas}
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

export default MallasCrud;
