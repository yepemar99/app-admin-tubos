import React, { useContext } from 'react';
import useDataTable from '../../hooks/useDataTable';
import ProdTubosTable from './components/Table';
import { initFilters } from './init';
import { Box, Button, Typography } from '@mui/material';
import DataFilters from '../../components/common/DataFilters';
import { DataContext } from '../../contexts/DataContext';
import LoadingModal from '../../components/common/LoadingModal';
import ViewHeaderLayout from '../../layouts/ViewHeaderLayout';
import { Add } from '@mui/icons-material';
import { flex } from '../../utils/styles';
import { resolveSortParams } from '../../utils/functions';
import ProdTubosModal from './components/Modal';
import Modal from '../../components/common/Modal';
import { formatDateForInput } from '../../../utils/functions';

const sortFieldMap = {
  tubo: 'tubo',
  operario: 'operario',
  lote: 'lote',
  cantidad: 'cantidad_buenos',
  paqs_buenos: 'paquetes',
};

const ProdTubos = () => {
  const { tiposCalidad, operarios, maquinas, turnos } = useContext(DataContext);
  const loadProdTubos = async (
    page = 1,
    pageSize = PAGE_SIZE,
    searchTerm = '',
    filters,
    sortModel,
  ) => {
    const calidadFilter = filters.find((f) => f.name === 'calidad');
    const operarioFilter = filters.find((f) => f.name === 'operario');
    const maquinaFilter = filters.find((f) => f.name === 'maquina');

    const { orderBy, orderDir } = resolveSortParams(sortModel, sortFieldMap);
    return await window.api.prodTubos.getAll({
      page,
      pageSize,
      searchTerm,
      calidad_id: calidadFilter?.value || 0,
      operario_id: operarioFilter?.value || 0,
      maquina_id: maquinaFilter?.value || 0,
      orderBy,
      orderDir: orderBy ? orderDir : 'DESC',
    });
  };

  const loadFilters = async () => {
    return {
      calidad:
        tiposCalidad
          ?.filter((c) => c.mostrar_tubos)
          .map((calidad) => ({
            value: calidad.id,
            label: calidad.nombre,
          })) || [],
      operario:
        operarios?.map((o) => ({
          value: o.id,
          label: o.nombre_completo,
        })) || [],
      maquina:
        maquinas?.map((m) => ({
          value: m.id,
          label: m.maquina,
        })) || [],
    };
  };

  const handleManualSort = (model) => {
    handleSortModel(model);
  };

  const onCreate = async (data) => {
    const dateData = formatDateForInput(data);
    const fechaLote = `${dateData?.dd || ''}${dateData?.mm || ''}${dateData?.aa || ''}`;

    const maquina = maquinas.find((m) => m.id === data.maquina_id);
    const turno = turnos.find((t) => t.id === data.turno_id);
    return await window.api.prodTubos.create({
      ...data,
      creado: dateData?.createdAt,
      lote: `L${maquina?.maquina}${fechaLote}${turno?.prefijo}`,
    });
  };

  const onEdit = async (data) => {
    const now = new Date();
    console.log('Data before formatting:', data);
    const dateData = formatDateForInput(data);
    const fechaLote = `${dateData?.dd || ''}${dateData?.mm || ''}${dateData?.aa || ''}`;

    const maquina = maquinas.find((m) => m.id === data.maquina_id);
    const turno = turnos.find((t) => t.id === data.turno_id);
    return await window.api.prodTubos.update({
      ...data,
      creado: dateData?.createdAt,
      lote: `L${maquina?.maquina}${fechaLote}${turno?.prefijo}`,
    });
  };

  const onDelete = async (id) => {
    return await window.api.prodTubos.delete({ id });
  };

  const {
    data: prodTubos,
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
    fetchData: loadProdTubos,
    fetchFilters: loadFilters,
    onDeleteConfirm: onDelete,
    onCreateConfirm: onCreate,
    onEditConfirm: onEdit,
    initFilters: [...initFilters],
  });

  return (
    <Box>
      <LoadingModal open={actionLoading} />
      <ViewHeaderLayout
        title="Producción de Tubos"
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
              Nueva Producción
            </Button>
          </Box>
        }
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
      <ProdTubosModal
        data={selectedItem}
        open={showForm}
        handleConfirm={
          !selectedItem?.id ? handleCreateConfirm : handleEditConfirm
        }
        handleCancel={() => {
          handleCreate(true);
        }}
      />
      <DataFilters
        sx={{ mb: 2 }}
        loading={loadingFilters}
        filters={filters}
        handleFilterChange={handleFilterChange}
        handleCleanFilters={handleClearAllFilters}
      />
      <ProdTubosTable
        loading={loading}
        rows={prodTubos}
        total={total}
        page={page}
        sortModel={sortModel}
        checkboxSelection={false}
        handleChangePage={handlePageChange}
        handleSortChange={handleManualSort}
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

export default ProdTubos;
