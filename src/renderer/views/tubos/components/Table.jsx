import { DataGrid } from '@mui/x-data-grid';
import React from 'react';
import { PAGE_SIZE, ROW_HEIGHT } from '../../../../utils/constants';
import { Stack, Typography } from '@mui/material';
import ActionMenu from '../../../components/common/ActionMenu';
import DataGridFooter from '../../../components/common/DataGridFooter';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { StatusIndicator } from '../../../components/common/Indicator';
import { formatFecha } from '../../../../server/utils/functions';

const TubosTable = ({
  loading = false,
  rows = [],
  total = 0,
  page = 1,
  sortModel = [],
  checkboxSelection = false,
  handleDelete = () => {},
  handleDetail = () => {},
  handleEdit = () => {},
  handleChangePage = () => {},
  handleSelect = () => {},
  handleSortChange = () => {},
}) => {
  return (
    <DataGrid
      sx={{ maxHeight: 'calc(100vh - 200px)', width: '100%' }}
      density="standard"
      loading={loading}
      rowCount={total}
      paginationMode="server"
      columns={getColumns(handleDetail, handleEdit, handleDelete)}
      rows={rows}
      rowHeight={ROW_HEIGHT}
      disableColumnResize
      disableColumnMenu
      disableColumnSelector
      disableRowSelectionOnClick
      sortModel={sortModel}
      onSortModelChange={(model) => {
        handleSortChange(model);
      }}
      paginationModel={{
        page: page - 1,
        pageSize: PAGE_SIZE,
      }}
      autosizeOptions={{
        includeOutliers: true,
        includeHeaders: false,
        outliersFactor: 1,
        expand: true,
      }}
      slots={{
        pagination: DataGridFooter,
      }}
      onPaginationModelChange={(model) => {
        handleChangePage(model.page + 1);
      }}
      onRowSelectionModelChange={(row) => {
        handleSelect(row?.ids || [], row?.type);
      }}
      checkboxSelection={checkboxSelection}
      pageSizeOptions={[]}
    />
  );
};

export default TubosTable;

const getColumns = (handleDetail, handleEdit, handleDelete) => [
  {
    field: 'id',
    headerName: 'ID',
    editable: false,
    align: 'left',
    width: 5,
    renderCell: (params) => (
      <Stack
        height={1}
        direction="column"
        alignSelf="center"
        justifyContent="center"
      >
        <Typography variant="body2" fontWeight={500}>
          {params?.row?.id || '-'}
        </Typography>
      </Stack>
    ),
  },
  {
    field: 'art_concepto',
    headerName: 'Concepto',
    editable: false,
    align: 'left',
    flex: 1,
    renderCell: (params) => (
      <Stack
        height={1}
        direction="column"
        alignSelf="center"
        justifyContent="center"
      >
        <Typography variant="body2" fontWeight={500}>
          {params?.row?.art_concepto || '-'}
        </Typography>
        <Typography variant="body2" fontWeight={500}>
          Máquina: {params?.row?.maquina || '-'}
        </Typography>
      </Stack>
    ),
  },
  {
    field: 'fleje_concepto',
    headerName: 'Fleje',
    editable: false,
    align: 'left',
    flex: 1,
    renderCell: (params) => (
      <Stack
        height={1}
        direction="column"
        alignSelf="center"
        justifyContent="center"
      >
        <Typography variant="body2" fontWeight={500}>
          {params?.row?.fleje_concepto || '-'}
        </Typography>
      </Stack>
    ),
  },
  {
    field: 'activa',
    headerName: 'Activa',
    editable: false,
    align: 'center',
    renderCell: (params) => (
      <Stack
        sx={{
          py: 1,
          px: 2,
        }}
      >
        <StatusIndicator status={params?.row?.activo ? 'active' : 'inactive'} />
      </Stack>
    ),
  },
  {
    field: 'tipo_nombre',
    headerName: 'Tipo',
    editable: false,
    align: 'left',
    renderCell: (params) => (
      <Stack
        height={1}
        direction="column"
        alignSelf="center"
        justifyContent="center"
      >
        <Typography variant="body2" fontWeight={500}>
          {params?.row?.tipo_nombre || '-'}
        </Typography>
      </Stack>
    ),
  },
  {
    field: 'calidad_nombre',
    headerName: 'Calidad',
    editable: false,
    align: 'left',
    renderCell: (params) => (
      <Stack
        height={1}
        direction="column"
        alignSelf="center"
        justifyContent="center"
      >
        <Typography variant="body2" fontWeight={500}>
          {params?.row?.calidad_nombre || '-'}
        </Typography>
      </Stack>
    ),
  },
  {
    field: 'unidades',
    headerName: 'Stock',
    editable: false,
    align: 'left',
    width: 180,
    renderCell: (params) => (
      <Stack
        height={1}
        direction="column"
        alignSelf="center"
        justifyContent="center"
      >
        <Typography variant="body2" fontWeight={500}>
          Cant. paquetes: {params?.row?.num_paquetes || '0'}
        </Typography>
        <Typography variant="body2" fontWeight={500}>
          Unidades: {params?.row?.unidades || '0'}
        </Typography>
      </Stack>
    ),
  },
  {
    field: 'creado',
    headerName: 'Fecha de creación',
    editable: false,
    align: 'center',
    width: 150,
    renderCell: (params) => {
      return (
        <Stack
          height={1}
          direction="column"
          alignSelf="center"
          justifyContent="center"
        >
          <Typography variant="body2" textAlign={'start'} fontWeight={500}>
            {formatFecha(params?.row?.creado)}
          </Typography>
        </Stack>
      );
    },
  },
  {
    field: 'actions',
    headerName: 'Actions',
    editable: false,
    align: 'center',
    renderCell: (params) => (
      <Stack
        height={1}
        direction="column"
        alignSelf="center"
        justifyContent="center"
      >
        <ActionMenu
          hideDetail
          onDelete={() => {
            handleDelete(params.row);
          }}
          onEdit={() => {
            handleEdit(params.row);
          }}
          onDetail={() => {
            handleDetail(params.row);
          }}
        >
          <MoreHorizIcon />
        </ActionMenu>
      </Stack>
    ),
  },
];
