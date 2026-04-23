import { DataGrid } from "@mui/x-data-grid";
import React from "react";
import { PAGE_SIZE, ROW_HEIGHT } from "../../../../utils/constants";
import { Stack, Typography } from "@mui/material";
import ActionMenu from "../../../components/common/ActionMenu";
import DataGridFooter from "../../../components/common/DataGridFooter";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { formatFecha } from "../../../../server/utils/functions";

const SalidasPaqsTable = ({
  loading = false,
  rows = [],
  total = 0,
  page = 1,
  handleDelete = () => {},
  handleDetail = () => {},
  handleEdit = () => {},
  handleChangePage = () => {},
}) => {
  return (
    <DataGrid
      sx={{ maxHeight: "calc(100vh - 200px)", width: "100%" }}
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

export default SalidasPaqsTable;

const getColumns = (handleDetail, handleEdit, handleDelete) => [
  {
    field: "id",
    headerName: "ID",
    editable: false,
    align: "left",
    width: 5,
    renderCell: (params) => (
      <Stack
        height={1}
        direction="column"
        alignSelf="center"
        justifyContent="center"
      >
        <Typography variant="body2" fontWeight={500}>
          {params?.row?.id || "-"}
        </Typography>
      </Stack>
    ),
  },
  {
    field: "tubo_medida",
    headerName: "Tubo",
    editable: false,
    align: "left",
    flex: 1,
    renderCell: (params) => (
      <Stack
        height={1}
        direction="column"
        alignSelf="center"
        justifyContent="center"
      >
        <Typography variant="body2" fontWeight={500}>
          {params?.row?.tubo_medida || "-"}
        </Typography>
      </Stack>
    ),
  },
  {
    field: "operario_nombre",
    headerName: "Operario",
    editable: false,
    align: "left",
    flex: 1,
    renderCell: (params) => (
      <Stack
        height={1}
        direction="column"
        alignSelf="center"
        justifyContent="center"
      >
        <Typography variant="body2" fontWeight={500}>
          {params?.row?.operario_nombre || "-"}{" "}
          {params?.row?.operario_apellido1 || ""}{" "}
          {params?.row?.operario_apellido2 || ""}
        </Typography>
      </Stack>
    ),
  },
  {
    field: "num_paqs",
    headerName: "Número de Paquetes",
    editable: false,
    align: "left",
    width: 200,
    renderCell: (params) => (
      <Stack
        height={1}
        direction="column"
        alignSelf="center"
        justifyContent="center"
      >
        <Typography variant="body2" fontWeight={500}>
          {params?.row?.num_paqs || "0"}
        </Typography>
      </Stack>
    ),
  },
  {
    field: "creado",
    headerName: "Fecha de creación",
    editable: false,
    align: "center",
    width: 200,
    renderCell: (params) => {
      return (
        <Stack
          height={1}
          direction="column"
          alignSelf="center"
          justifyContent="center"
        >
          <Typography variant="body2" textAlign={"start"} fontWeight={500}>
            {formatFecha(params?.row?.creado)}
          </Typography>
        </Stack>
      );
    },
  },
  {
    field: "actions",
    headerName: "Actions",
    editable: false,
    align: "center",
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
