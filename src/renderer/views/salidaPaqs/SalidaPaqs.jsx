import React from 'react';
import useDataTable from '../../hooks/useDataTable';
import { Box, Button, Modal, Typography } from '@mui/material';
import LoadingModal from '../../components/common/LoadingModal';
import ViewHeaderLayout from '../../layouts/ViewHeaderLayout';
import { Add } from '@mui/icons-material';
import { flex } from '../../utils/styles';
import { PAGE_SIZE } from '../../../utils/constants';
import SalidasPaqsTable from './components/Table';
import SalidaPaqsModal from './components/Modal';
import DataFilters from '../../components/common/DataFilters';
import { initFilters } from './utils';

const SalidaPaqs = () => {
  const loadSalidasPaqs = async (
    page = 1,
    pageSize = PAGE_SIZE,
    searchTerm = '',
    filters,
  ) => {
    const operarioFilter = filters?.find(
      (filter) => filter.name === 'operario_id',
    );
    const creadoFilter = filters?.find((filter) => filter.name === 'creado');
    return await window.api.salidasPaqs.getAll({
      page,
      pageSize,
      searchTerm,
      operario_id: operarioFilter?.value || '',
      fechaInicial: creadoFilter?.valueStart || '',
      fechaFinal: creadoFilter?.valueEnd || '',
    });
  };

  const onCreateConfirm = async (data) => {
    return await window.api.salidasPaqs.create(data);
  };

  const onEditConfirm = async (data) => {
    return await window.api.salidasPaqs.update({ id: data.id, data: data });
  };

  const onDeleteConfirm = async (id) => {
    return await window.api.salidasPaqs.delete(id);
  };

  const {
    data: salidasPaqs,
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
    fetchData: loadSalidasPaqs,
    fetchFilters: async () => {
      const result = await window.api.operarios.getAll();
      const operarios = result?.data || [];

      return {
        operario_id: operarios.map((operario) => ({
          value: operario.id,
          label:
            `${operario.nombre || ''} ${operario.apellido1 || ''} ${operario.apellido2 || ''}`.trim(),
        })),
        creado: [],
      };
    },
    onDeleteConfirm: onDeleteConfirm,
    onCreateConfirm: onCreateConfirm,
    onEditConfirm: onEditConfirm,
    initFilters: initFilters,
  });

  return (
    <Box sx={{ width: '100%' }}>
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
      <SalidaPaqsModal
        data={selectedItem}
        open={showForm}
        handleConfirm={
          !selectedItem?.id ? handleCreateConfirm : handleEditConfirm
        }
        handleCancel={() => {
          handleCreate(true);
        }}
      />
      <ViewHeaderLayout
        title="Salidas de Paquetes"
        sx={{ mb: 2 }}
        actions={
          <Box sx={flex}>
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => handleCreate(false)}
            >
              Agregar Salida
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
      <SalidasPaqsTable
        loading={loading}
        rows={salidasPaqs}
        total={total}
        page={page}
        handleChangePage={handlePageChange}
        handleDelete={(row) => {
          handleDelete(row);
        }}
        handleDetail={() => {}}
        handleEdit={async (row) => {
          const result = await window.api.tubos.getAll({
            pageSize: 1,
            tubo_id: row.tubo_id,
          });
          const tuboEncontrado = result.data[0];
          console.log('Row a editar:', tuboEncontrado);
          handleEdit({ ...row, calidad_id: tuboEncontrado.calidad_id });
        }}
      />
    </Box>
  );
};

export default SalidaPaqs;
