import React, { useState } from 'react';
import useDataTable from '../../hooks/useDataTable';
import { Box, Button, Typography } from '@mui/material';
import LoadingModal from '../../components/common/LoadingModal';
import { flex } from '../../utils/styles';
import ViewHeaderLayout from '../../layouts/ViewHeaderLayout';
import { Add } from '@mui/icons-material';
import PlanesCorteTable from './components/Table';
import PlanCorteModal from './components/Modal';
import { PAGE_SIZE } from '../../../utils/constants';
import Modal from '../../components/common/Modal';
import { toast } from 'react-toastify';
import PlanCorteModalStats from './components/ModalStats';
import DataFilters from '../../components/common/DataFilters';
import { initFilters } from './init';

const PlanesCorteCrud = () => {
  const [preLoading, setPreLoading] = useState(false);
  // Forumulario de stats
  const [openStats, setOpenStats] = useState(false);

  const handleConfirm = async (data) => {
    return await window.api.planes.create(data);
  };

  const handleConfirmDelete = async (id) => {
    return await window.api.planes.delete({ id });
  };

  const handlePreEdit = async (row) => {
    try {
      setPreLoading(true);
      const result = await window.api.planes.getFlejesPorCortes(row.id);
      if (result?.data.length > 0) {
        console.log('Flejes del plan de corte:', result.data);
        handleEdit({
          ...row,
          flejes_cortes:
            result?.data.map((f) => ({
              ...f,
              id: Number(f?.id),
              fleje_id: Number(f.fleje_id),
              calidad: Number(f.calidad_id),
            })) || [],
        });
      } else {
        toast.error('Error al cargar los flejes del plan de corte');
      }
    } catch (error) {
      console.error('Error al cargar el plan de corte:', error);
    } finally {
      setPreLoading(false);
    }
  };

  const handleConfirmEdit = async (data) => {
    return await window.api.planes.update({ plan: data, id: data?.id });
  };

  const loadPlanes = async (
    page = 1,
    pageSize = PAGE_SIZE,
    searchTerm = '',
    filters,
  ) => {
    return await window.api.planes.getAll({
      page,
      pageSize,
      searchTerm,
      estado: filters.find((f) => f.name === 'estado')?.value || null,
    });
  };

  const {
    data: planes,
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
    setSelectedItem,
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
    fetchData: loadPlanes,
    fetchFilters: () => {
      return {
        estado: [
          {
            value: 1,
            label: 'Completado',
          },
          {
            value: 0,
            label: 'Pendiente',
          },
        ],
      };
    },
    onDeleteConfirm: handleConfirmDelete,
    onCreateConfirm: handleConfirm,
    onEditConfirm: handleConfirmEdit,
    initFilters: initFilters,
  });

  const handleToggleStats = (row) => {
    setSelectedItem(row);
    setOpenStats((prev) => !prev);
  };

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
      <PlanCorteModal
        data={selectedItem}
        open={showForm}
        handleConfirm={
          !selectedItem?.id ? handleCreateConfirm : handleEditConfirm
        }
        handleCancel={() => {
          handleCreate(true);
        }}
      />
      <PlanCorteModalStats
        id={selectedItem?.id || 0}
        open={openStats}
        handleCancel={() => setOpenStats(false)}
      />
      <LoadingModal open={actionLoading || preLoading} />
      <ViewHeaderLayout
        title="Planes de Corte"
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
              Nuevo Plan
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
      <PlanesCorteTable
        loading={loading}
        rows={planes}
        total={total}
        page={page}
        handleChangePage={handlePageChange}
        handleDelete={(row) => {
          handleDelete(row);
        }}
        handleDetail={() => {}}
        handleEdit={(row) => {
          handlePreEdit(row);
        }}
        handleToggleStats={(row) => {
          handleToggleStats(row);
        }}
      />
    </Box>
  );
};

export default PlanesCorteCrud;
