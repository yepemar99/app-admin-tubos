import React, { useContext } from 'react';
import useDataTable from '../../hooks/useDataTable';
import { Box, Button, Typography } from '@mui/material';
import LoadingModal from '../../components/common/LoadingModal';
import ViewHeaderLayout from '../../layouts/ViewHeaderLayout';
import { flex } from '../../utils/styles';
import { Add } from '@mui/icons-material';
import FlejesTable from './components/Table';
import { PAGE_SIZE } from '../../../utils/constants';
import FlejesModal from './components/Modal';
import Modal from '../../components/common/Modal';
import TubosModal from './components/Modal';
import TubosTable from './components/Table';
import DataFilters from '../../components/common/DataFilters';
import { initFilters } from './init';
import { DataContext } from '../../contexts/DataContext';
import { resolveSortParams } from '../../utils/functions';
import { toast } from 'react-toastify';
import MenuButton from '../../components/common/MenuButton';

const Tubos = () => {
  const { tiposCalidad, tiposTubos } = useContext(DataContext);

  const sortFieldMap = {
    Calidad: 'calidad',
    Tipo: 'tipo',
    Unidades: 'unidades',
  };
  const loadTubos = async (
    page = 1,
    pageSize = PAGE_SIZE,
    searchTerm = '',
    filters,
    sortModel,
  ) => {
    const { orderBy, orderDir } = resolveSortParams(sortModel, sortFieldMap);
    const hasFilters =
      searchTerm ||
      filters.find((f) => f.name === 'calidad')?.value ||
      filters.find((f) => f.name === 'tipo')?.value;
    return await window.api.tubos.getAll({
      page,
      pageSize,
      searchTerm,
      calidad_id: filters.find((f) => f.name === 'calidad')?.value || 0,
      tipo_id: filters.find((f) => f.name === 'tipo')?.value || 0,
      orderBy,
      orderDir: orderBy ? orderDir : hasFilters ? 'ASC' : 'DESC',
    });
  };

  const onCreateConfirm = async (data) => {
    return await window.api.tubos.create(data);
  };

  const onEditConfirm = async (data) => {
    return await window.api.tubos.update({
      id: data?.id,
      tubo: data,
    });
  };

  const onDeleteConfirm = async (id) => {
    return await window.api.tubos.delete(id);
  };

  const loadFilters = async () => {
    return {
      calidad:
        tiposCalidad?.map((calidad) => ({
          value: calidad.id,
          label: calidad.nombre,
        })) || [],
      tipo:
        tiposTubos?.map((tipo) => ({
          value: tipo.id,
          label: tipo.nombre,
        })) || [],
    };
  };

  const {
    data: tubos,
    total,
    loading,
    handleFilterChange,
    handlePageChange,
    page,
    filters,
    searchTerm,
    loadingFilters,
    showDeleteConfirm,
    sortModel,
    handleSortModel,
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
    handleSelectItems,
    selectedIds,
    setInitFilters,
  } = useDataTable({
    fetchData: loadTubos,
    fetchFilters: loadFilters,
    onDeleteConfirm: onDeleteConfirm,
    onCreateConfirm: onCreateConfirm,
    onEditConfirm: onEditConfirm,
    initFilters: [...initFilters],
  });

  const generarInventario = async (ids = []) => {
    try {
      const result = await window.api.actions.selectDirectory();
      const response = await window.api.tubos.report({
        path: result.path,
        ids: ids,
      });
      toast.success(`Inventario generado exitosamente.`);
    } catch (error) {
      console.error('Error al seleccionar directorio:', error);
    }
  };

  const options = [
    {
      value: 'report',
      label: 'Todos los elementos',
      action: generarInventario,
    },
    {
      value: 'report-selected',
      label: 'Elementos seleccionados',
      action: () => {
        if (selectedIds.length === 0) {
          toast.warning('No hay elementos seleccionados.');
          return;
        }
        generarInventario(selectedIds);
      },
    },
  ];

  console.log('tubos', tubos);

  return (
    <Box sx={{ width: '100%' }}>
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
      <TubosModal
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
      <ViewHeaderLayout
        title="Tubos"
        sx={{ mb: 2 }}
        actions={
          <Box sx={flex}>
            <MenuButton
              color="secondary"
              label="Generar Inventario"
              options={options}
            />
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => handleCreate(false)}
            >
              Nuevo Tubo
            </Button>
          </Box>
        }
      />
      <DataFilters
        sx={{ mb: 2 }}
        loading={loadingFilters}
        filters={filters}
        handleFilterChange={handleFilterChange}
        handleCleanFilters={handleClearAllFilters}
      />
      <TubosTable
        loading={loading}
        rows={tubos}
        total={total}
        page={page}
        sortModel={sortModel}
        handleChangePage={handlePageChange}
        handleDelete={(row) => {
          handleDelete(row);
        }}
        handleDetail={() => {}}
        handleEdit={(row) => {
          handleEdit({ ...row, maquina_ids: row.maquinas.map((m) => m.id) });
        }}
        handleSelect={handleSelectItems}
        handleSortChange={handleSortModel}
        checkboxSelection
      />
    </Box>
  );
};

export default Tubos;
