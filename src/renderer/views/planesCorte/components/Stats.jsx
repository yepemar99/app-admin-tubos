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

const PlanCorteMultiView = ({ id = 0 }) => {
  const [tabValue, setTabValue] = React.useState(0);
  const [bobinas, setBobinas] = React.useState([]);
  const [flejes, setFlejes] = React.useState([]);
  const [loadingBobinas, setLoadingBobinas] = React.useState(false);
  const [loadingFlejes, setLoadingFlejes] = React.useState(false);
  const [pageBobinas, setPageBobinas] = React.useState(1);
  const [pageFlejes, setPageFlejes] = React.useState(1);
  const [totalBobinas, setTotalBobinas] = React.useState(0);

  // CÁLCULOS AGREGADOS
  const pesoTotalEntrada = bobinas.reduce((acc, b) => acc + b.peso_real, 0);
  const pesoTotalSalida = flejes.reduce(
    (acc, f) => acc + f.factor_proporcional_peso,
    0,
  );
  const scrap = pesoTotalEntrada - pesoTotalSalida;
  const porcentajeEficiencia = !pesoTotalEntrada
    ? 0
    : ((pesoTotalSalida / pesoTotalEntrada) * 100).toFixed(1);
  const isFinalizado = bobinas.length > 0 && flejes.length > 0;

  const loadBobinas = async ({ page = 1 }) => {
    return await window.api.bobinas.getAllCortadas({
      page: page,
      pageSize: PAGE_SIZE,
      plan_id: id,
    });
  };

  const loadFlejes = async () => {
    return await window.api.flejes.getAllPlanesCorte({ corte_id: id });
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const resultBobinas = await loadBobinas({ page: pageBobinas });
        const resultFlejes = await loadFlejes();
        if (resultBobinas.success) {
          console.log('Bobinas cortadas del plan de corte:', resultBobinas);
          setBobinas(resultBobinas.data);
          setTotalBobinas(resultBobinas.total);
        } else {
          console.error(
            'Error al cargar bobinas cortadas:',
            resultBobinas.error,
          );
        }
        if (resultFlejes.success) {
          setFlejes(resultFlejes.data);
        } else {
          console.error(
            'Error al cargar flejes por corte:',
            resultFlejes.error,
          );
        }
      } catch (error) {
        console.error('Error al cargar datos del plan de corte:', error);
      }
    };
    fetchData();
  }, [id, pageBobinas]);

  // Columnas para Bobinas
  const bobinaColumns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 40,
      sortable: false,
    },
    {
      field: 'bobina_concepto',
      headerName: 'Bobina',
      flex: 1,
      minWidth: 150,
      sortable: false,
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

  // Columnas para Flejes
  const flejeColumns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      sortable: false,
    },
    {
      field: 'fleje_concepto',
      headerName: 'Concepto',
      flex: 1,
      minWidth: 200,
      sortable: false,
    },
    {
      field: 'num_flejes',
      headerName: 'Cantidad',
      width: 100,
      sortable: false,
    },
    {
      field: 'peso_unit_definido',
      headerName: 'Peso Unit (Kg)',
      width: 130,
      sortable: false,
    },
    {
      field: 'factor_proporcional_peso',
      headerName: 'Subtotal (Kg)',
      width: 130,
      sortable: false,
      renderCell: (params) => params.value?.toFixed(2) || 0,
    },
  ];

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChangeBobinasPage = (newPage) => {
    setPageBobinas(newPage + 1);
  };

  const handleChangeFlejesPage = (newPage) => {
    setPageFlejes(newPage + 1);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Tabs */}
      <Paper sx={{ p: 0, mb: 1 }}>
        <Tabs
          value={tabValue}
          onChange={handleChangeTab}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label={`Bobinas Procesadas (${bobinas.length})`}
            icon={<Layers fontSize="small" />}
            iconPosition="start"
            sx={{ fontSize: '14px', height: 10, fontWeight: 'bold' }}
          />
          <Tab
            label={`Flejes a Cortar (${flejes.length})`}
            icon={<Inventory2 />}
            iconPosition="start"
            sx={{ fontSize: '14px', height: 10, fontWeight: 'bold' }}
          />
        </Tabs>
      </Paper>

      {/* Tab 1: Bobinas */}
      {tabValue === 0 && (
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
      )}

      {/* Tab 2: Flejes */}
      {tabValue === 1 && (
        <Paper sx={{ mb: 3, p: 0 }}>
          <DataGrid
            sx={{ maxHeight: 'calc(100vh - 200px)', width: '100%' }}
            density="standard"
            loading={loadingFlejes}
            rowCount={flejes.length}
            paginationMode="server"
            columns={flejeColumns}
            rows={flejes}
            rowHeight={ROW_HEIGHT}
            disableColumnResize
            disableColumnMenu
            disableColumnSelector
            disableRowSelectionOnClick
            paginationModel={{
              page: pageFlejes - 1,
              pageSize: PAGE_SIZE,
            }}
            slots={{
              pagination: DataGridFooter,
            }}
            onPaginationModelChange={(model) => {
              handleChangeFlejesPage(model.page);
            }}
            pageSizeOptions={[]}
          />
        </Paper>
      )}
    </Box>
  );
};

export default PlanCorteMultiView;
