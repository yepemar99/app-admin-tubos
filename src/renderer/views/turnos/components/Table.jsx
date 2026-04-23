import { Stack, Typography } from "@mui/material";
import React from "react";
import ActionMenu from "../../../components/common/ActionMenu";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { DataGrid } from "@mui/x-data-grid";
import { PAGE_SIZE, ROW_HEIGHT } from "../../../../utils/constants";
import DataGridFooter from "../../../components/common/DataGridFooter";

const TurnosTable = ({
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
      //   apiRef={apiRef}
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

export default TurnosTable;

const getColumns = (handleDetail, handleEdit, handleDelete) => [
  {
    field: "id",
    headerName: "Id",
    editable: false,
    align: "left",
    maxWidth: 50,
    flex: 1,
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
    field: "horario",
    headerName: "Horario",
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
          {params?.row?.horario || "-"}
        </Typography>
      </Stack>
    ),
  },

  {
    field: "fecha",
    headerName: "Fecha",
    editable: false,
    align: "left",
    flex: 1,
    renderCell: (params) => {
      const formatFechaHora = params?.row?.created_at
        ? params?.row?.created_at.split(".")[0]
        : "-";
      return (
        <Stack
          height={1}
          direction="column"
          alignSelf="center"
          justifyContent="center"
        >
          <Typography variant="body2" fontWeight={500}>
            {formatFechaHora}
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
    flex: 1,
    maxWidth: 70,
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
