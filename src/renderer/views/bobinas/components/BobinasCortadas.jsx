import React from 'react';
import {
  Avatar,
  Box,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Inventory2,
  Engineering,
  Description,
  Layers,
  CheckCircle,
  HourglassEmpty,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import DataGridFooter from '../../../components/common/DataGridFooter';

const PAGE_SIZE = 20;
const ROW_HEIGHT = 52;

const BobinasCortadas = ({ id = 0 }) => {
  const [bobinas, setBobinas] = React.useState([]);
  const [loadingBobinas, setLoadingBobinas] = React.useState(false);
  const [pageBobinas, setPageBobinas] = React.useState(1);
  const [totalBobinas, setTotalBobinas] = React.useState(0);
  const [sortModelBobinas, setSortModelBobinas] = React.useState([]);

  const loadBobinas = async ({ page = 1, orderBy = '', orderDir = '' }) => {
    return await window.api.bobinas.getAllCortadas({
      page: page,
      pageSize: PAGE_SIZE,
      bobina_id: id,
      orderBy,
      orderDir,
    });
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const resultBobinas = await loadBobinas({ page: pageBobinas });

        if (resultBobinas.success) {
          setBobinas(resultBobinas.data);
          setTotalBobinas(resultBobinas.total);
        } else {
          console.error(
            'Error al cargar bobinas cortadas:',
            resultBobinas.error,
          );
        }
      } catch (error) {
        console.error('Error al cargar datos de las bobinas cortadas:', error);
      }
    };
    fetchData();
  }, [id, pageBobinas]);

  // Columnas para Bobinas
  const bobinaColumns = [
    {
      field: 'plan_num',
      headerName: 'Plan de Corte',
      flex: 1,
      minWidth: 150,
      sortable: true,
    },
    {
      field: 'calidad',
      headerName: 'Calidad',
      width: 120,
      sortable: true,
    },
    {
      field: 'turno',
      headerName: 'Turno',
      width: 100,
      sortable: false,
      renderCell: (params) => {
        return (
          <Box>
            {params.row.turno_entrada || 'N/A'} -{' '}
            {params.row.turno_salida || 'N/A'}
          </Box>
        );
      },
    },
    {
      field: 'ancho',
      headerName: 'Ancho Inicial / Final (mm)',
      width: 200,
      sortable: false,
      renderCell: (params) => {
        return (
          <Box>
            {params.row?.ancho_inicial || 'N/A'} /{' '}
            {params.row?.ancho_final || 'N/A'}
          </Box>
        );
      },
    },
    {
      field: 'espesor',
      headerName: 'Espesor Inicial / Final  (mm)',
      width: 210,
      sortable: false,
      renderCell: (params) => {
        return (
          <Box>
            {params.row?.espesor_inicial || 'N/A'} /{' '}
            {params.row?.espesor_final || 'N/A'}
          </Box>
        );
      },
    },
    {
      field: 'peso_real',
      headerName: 'Peso (kg)',
      width: 100,
      sortable: false,
    },
    {
      field: 'creado',
      headerName: 'Fecha',
      width: 120,
      sortable: false,
    },
  ];

  const handleChangeBobinasPage = (newPage) => {
    setPageBobinas(newPage + 1);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Paper sx={{ mb: 3, p: 0 }}>
        <DataGrid
          sx={{ maxHeight: 'calc(100vh - 200px)', width: '100%' }}
          density="standard"
          loading={loadingBobinas}
          rowCount={totalBobinas}
          paginationMode="server"
          columns={bobinaColumns}
          rows={bobinas}
          rowHeight={ROW_HEIGHT}
          disableColumnResize
          disableColumnMenu
          disableColumnSelector
          disableRowSelectionOnClick
          onSortModelChange={(model) => {
            setSortModelBobinas(model);
            loadBobinas({
              page: pageBobinas,
              orderBy: model[0]?.field || '',
              orderDir: model[0]?.sort || '',
            });
          }}
          paginationModel={{
            page: pageBobinas - 1,
            pageSize: PAGE_SIZE,
          }}
          slots={{
            pagination: DataGridFooter,
          }}
          onPaginationModelChange={(model) => {
            handleChangeBobinasPage(model.page);
          }}
          pageSizeOptions={[]}
        />
      </Paper>
    </Box>
  );
};

export default BobinasCortadas;
