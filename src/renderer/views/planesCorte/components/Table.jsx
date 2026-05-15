import { IconButton, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DataGridFooter from '../../../components/common/DataGridFooter';
import { PAGE_SIZE, ROW_HEIGHT } from '../../../../utils/constants';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ActionMenu from '../../../components/common/ActionMenu';
import React from 'react';
import { formatFecha } from '../../../../server/utils/functions';

const PlanesCorteTable = ({
  loading = false,
  rows = [],
  total = 0,
  page = 1,
  handleDelete = () => {},
  handleDetail = () => {},
  handleEdit = () => {},
  handleChangePage = () => {},
  handleToggleStats = () => {},
}) => {
  return (
    <DataGrid
      sx={{ maxHeight: 'calc(100vh - 200px)', width: '100%' }}
      density="standard"
      loading={loading}
      rowCount={total}
      paginationMode="server"
      columns={getColumns(
        handleDetail,
        handleEdit,
        handleDelete,
        handleToggleStats,
      )}
      rows={rows}
      rowHeight={ROW_HEIGHT}
      disableColumnResize
      disableColumnMenu
      disableColumnSelector
      disableRowSelectionOnClick
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
      checkboxSelection
      pageSizeOptions={[]}
    />
  );
};

export default PlanesCorteTable;

const getColumns = (
  handleDetail,
  handleEdit,
  handleDelete,
  handleToggleStats = () => {},
) => [
  {
    field: 'id',
    headerName: 'No. Plan',
    editable: false,
    align: 'left',
    width: 100,
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
    field: 'ancho_estipulado',
    headerName: 'Ancho Estipulado (mm)',
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
          {params?.row?.ancho_estipulado || '0'}
        </Typography>
      </Stack>
    ),
  },
  {
    field: 'cantidad_flejes_cortes',
    headerName: 'Cantidad de Flejes a Cortar',
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
          {params?.row?.cantidad_flejes_cortes || '0'}
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
          options={[
            {
              icon: 'stats',
              label: 'Estadísticas',
              onHandle: () => {
                handleToggleStats(params.row);
              },
              id: 'stats',
            },
          ]}
        >
          <MoreHorizIcon />
        </ActionMenu>
      </Stack>
    ),
  },
];
