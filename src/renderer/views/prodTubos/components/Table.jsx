import { IconButton, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DataGridFooter from '../../../components/common/DataGridFooter';
import { PAGE_SIZE, ROW_HEIGHT } from '../../../../utils/constants';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ActionMenu from '../../../components/common/ActionMenu';
import React from 'react';
import { formatFecha } from '../../../../server/utils/functions';

const ProdTubosTable = ({
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
      sx={{
        maxHeight: 'calc(100vh - 200px)',
        width: '100%',
      }}
      density="standard"
      loading={loading}
      rowCount={total}
      paginationMode="server"
      sortingMode="server"
      sortModel={sortModel}
      onSortModelChange={(model) => {
        handleSortChange(model);
      }}
      onRowSelectionModelChange={(row) => {
        handleSelect(row?.ids || [], row?.type);
      }}
      columns={getColumns(handleDetail, handleEdit, handleDelete)}
      rows={rows}
      rowHeight={ROW_HEIGHT}
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
      checkboxSelection={checkboxSelection}
      pageSizeOptions={[]}
    />
  );
};

export default ProdTubosTable;

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
    field: 'tubo',
    headerName: 'Tubo',
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
          {params?.row?.tubo || '-'}
        </Typography>
        <Typography variant="body2" fontWeight={500}>
          {params?.row?.maquina_nombre || '-'}
        </Typography>
      </Stack>
    ),
  },
  {
    field: 'lote',
    headerName: 'Lote',
    editable: false,
    align: 'left',
    sorteable: false,
    width: 150,
    renderCell: (params) => (
      <Stack
        height={1}
        direction="column"
        alignSelf="center"
        justifyContent="center"
      >
        <Typography variant="body2" fontWeight={500}>
          {params?.row?.lote || '-'}
        </Typography>
      </Stack>
    ),
  },
  {
    field: 'operario',
    headerName: 'Operario',
    editable: false,
    align: 'left',
    sorteable: false,
    width: 150,
    renderCell: (params) => (
      <Stack
        height={1}
        direction="column"
        alignSelf="center"
        justifyContent="center"
      >
        <Typography variant="body2" fontWeight={500}>
          {params?.row?.operario || '-'}
        </Typography>
      </Stack>
    ),
  },
  {
    field: 'cantidad',
    headerName: ' Cantidad (buenos/malos)',
    editable: false,
    align: 'center',
    sorteable: false,
    width: 150,
    renderCell: (params) => (
      <Stack
        height={1}
        direction="column"
        alignSelf="center"
        justifyContent="center"
      >
        <Typography variant="body2" fontWeight={500}>
          <Typography variant="span" sx={{ color: 'success.main' }}>
            {params?.row?.cant_tubos_buenos || '-'}
          </Typography>{' '}
          /{' '}
          <Typography variant="span" sx={{ color: 'error.main' }}>
            {params?.row?.cant_tubos_malos || '-'}
          </Typography>
        </Typography>
      </Stack>
    ),
  },
  {
    field: 'paqs_buenos',
    headerName: 'Paquetes',
    editable: false,
    align: 'center',
    sorteable: false,
    width: 150,
    renderCell: (params) => (
      <Stack
        height={1}
        direction="column"
        alignSelf="center"
        justifyContent="center"
      >
        <Typography variant="body2" fontWeight={500}>
          {params?.row?.paqs_buenos || '-'}
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
