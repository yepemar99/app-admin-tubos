import React, { useContext, useState } from 'react';
import BobinasTable from './components/Table';
import { Box, Button, Menu, MenuItem, Typography } from '@mui/material';
import useDataTable from '../../hooks/useDataTable';
import { PAGE_SIZE } from '../../../utils/constants';
import ViewHeaderLayout from '../../layouts/ViewHeaderLayout';
import { Add } from '@mui/icons-material';
import { flex } from '../../utils/styles';
import LoadingModal from '../../components/common/LoadingModal';
import BobinasModal from './components/Modal';
import Modal from '../../components/common/Modal';
import MenuButton from '../../components/common/MenuButton';
import { toast } from 'react-toastify';
import DataFilters from '../../components/common/DataFilters';
import { initFilters } from './utils';
import { DataContext } from '../../contexts/DataContext';
import { resolveSortParams } from '../../utils/functions';

const BobinasCrud = () => {
  const { tiposCalidad, handleReloadFabricantes } = useContext(DataContext);
  const [alertDelete, setAlertDelete] = useState(false);

  const sortFieldMap = {
    Calidad: 'calidad',
    Unidades: 'unidades',
    peso_medio: 'peso_medio',
  };

  const loadBobinas = async (
    page = 1,
    pageSize = PAGE_SIZE,
    searchTerm = '',
    filters,
    sortModel,
  ) => {
    const calidadFilter = filters.find((f) => f.name === 'calidad');
    const { orderBy, orderDir } = resolveSortParams(sortModel, sortFieldMap);
    const hasFilters = searchTerm || filters.some((f) => f.value);
    return await window.api.bobinas.getAll({
      page,
      pageSize,
      searchTerm,
      calidad_id: calidadFilter?.value || 0,
      orderBy,
      orderDir: orderBy ? orderDir : hasFilters ? 'ASC' : 'DESC',
    });
  };

  const onCreate = async (data) => {
    return await window.api.bobinas.create({
      ...data,
      art_concepto: data.concepto,
    });
  };

  const onEdit = async (data) => {
    console.log('Update:', data);
    return await window.api.bobinas.update({
      bobina: { ...data, art_concepto: data.concepto },
      id: data?.id,
    });
  };

  const onDelete = async (id) => {
    return await window.api.bobinas.delete({ id });
  };

  const loadFilters = async () => {
    return {
      calidad:
        tiposCalidad?.map((calidad) => ({
          value: calidad.id,
          label: calidad.nombre,
        })) || [],
    };
  };

  const initFilters = [
    {
      name: 'calidad',
      label: 'Calidad',
      value: '',
      type: 'select',
      options:
        tiposCalidad?.map((calidad) => ({
          value: calidad.id,
          label: calidad.nombre,
        })) || [],
    },
  ];

  const {
    data: bobinas,
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
    selectedIds,
    handleSelectItems,
    handleFetchData,
  } = useDataTable({
    handleAfterCreate: handleReloadFabricantes,
    handleAfterUpdate: handleReloadFabricantes,
    fetchData: loadBobinas,
    fetchFilters: loadFilters,
    onDeleteConfirm: onDelete,
    onCreateConfirm: onCreate,
    onEditConfirm: onEdit,
    initFilters: [...initFilters],
  });

  const onCancel = async () => {
    if (selectedItem) {
      const payload = { ...selectedItem };
      delete payload.fabricante;
      delete payload.calidad;
      await window.api.bobinas.update({
        bobina: { ...payload, activa: 0 },
        id: selectedItem?.id,
      });
      handleFetchData(page, searchTerm, filters);
      setAlertDelete(false);
      toast.success('Bobina marcada como inactiva.');
    } else {
      setAlertDelete(false);
      toast.error(
        'No se pudo guardar la bobina. Por favor, inténtelo manualmente.',
      );
    }
    setSelectedItem(null);
  };

  const handleManualSort = (model) => {
    handleSortModel(model);
  };

  const handleValidDelete = async (row) => {
    const id = row?.id;
    if (!id) return false;
    const bobinasCortadasData = await window.api.bobinas.getAllCortadas({
      bobina_id: id,
    });
    if (bobinasCortadasData?.data?.length > 0) {
      setAlertDelete(true);
      setSelectedItem(row);
      return false;
    } else {
      return true;
    }
  };

  const generarInventario = async (ids = []) => {
    try {
      const result = await window.api.actions.selectDirectory();
      const response = await window.api.bobinas.report({
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
      <Modal
        showCancel
        showCustom
        title="Este bobina no se puede eliminar porque ya se ha usado en un plan de corte. ¿Desea marcarlo como inactiva en su lugar?"
        open={alertDelete}
        handleCustom={() => {
          onCancel();
        }}
        handleCancel={() => {
          setAlertDelete(false);
        }}
      >
        <Typography>Esta acción no se puede deshacer.</Typography>
      </Modal>

      <BobinasModal
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
        title="Bobinas"
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
              Nueva Bobina
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
      <BobinasTable
        checkboxSelection
        loading={loading}
        rows={bobinas}
        total={total}
        page={page}
        sortModel={sortModel}
        handleChangePage={handlePageChange}
        handleDelete={(row) => {
          handleValidDelete(row || null).then((canDelete) => {
            if (canDelete) {
              handleDelete(row);
            }
          });
        }}
        handleDetail={() => {}}
        handleEdit={(row) => {
          handleEdit(row);
        }}
        handleSelect={handleSelectItems}
        handleSortChange={handleManualSort}
      />
    </Box>
  );
};

export default BobinasCrud;
