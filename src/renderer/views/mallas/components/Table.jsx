import { IconButton, Stack, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DataGridFooter from "../../../components/common/DataGridFooter";
import { PAGE_SIZE, ROW_HEIGHT } from "../../../../utils/constants";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ActionMenu from "../../../components/common/ActionMenu";
import React from "react";

const MallasTable = ({
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

export default MallasTable;

const getColumns = (handleDetail, handleEdit, handleDelete) => [
  {
    field: "art_codigo",
    headerName: "Id",
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
          {params?.row?.art_codigo || "-"}
        </Typography>
      </Stack>
    ),
  },
  {
    field: "codigo",
    headerName: "Código",
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
          {params?.row?.codigo || "-"}
        </Typography>
      </Stack>
    ),
  },
  {
    field: "art_concepto",
    headerName: "Concepto",
    editable: false,
    align: "left",
    minWidth: 350,
    flex: 2,
    renderCell: (params) => (
      <Stack
        height={1}
        direction="column"
        alignSelf="center"
        justifyContent="center"
      >
        <Typography variant="body2" fontWeight={500}>
          {params?.row?.art_concepto || "-"}
        </Typography>
      </Stack>
    ),
  },
  {
    field: "region",
    headerName: "Región",
    editable: false,
    align: "left",
    flex: 1,
    maxWidth: 100,
    renderCell: (params) => (
      <Stack
        height={1}
        direction="column"
        alignSelf="center"
        justifyContent="center"
      >
        <Typography variant="body2" fontWeight={500}>
          {params?.row?.region || "-"}
        </Typography>
      </Stack>
    ),
  },
  {
    field: "diametro",
    headerName: "Diámetro",
    editable: false,
    align: "left",
    flex: 1,
    maxWidth: 80,
    renderCell: (params) => {
      return (
        <Stack
          height={1}
          direction="column"
          alignSelf="center"
          justifyContent="center"
        >
          <Typography variant="body2" textAlign={"center"} fontWeight={500}>
            {params?.row?.diametro || "-"}
          </Typography>
        </Stack>
      );
    },
  },
  {
    field: "longitud",
    headerName: "Longutudinales",
    editable: false,
    align: "left",
    flex: 1,
    maxWidth: 120,
    renderCell: (params) => {
      return (
        <Stack
          height={1}
          direction="column"
          alignSelf="center"
          justifyContent="center"
        >
          <Typography variant="body2" textAlign={"center"} fontWeight={500}>
            {params?.row?.longitud || "-"}
          </Typography>
        </Stack>
      );
    },
  },
  {
    field: "transversal",
    headerName: "Transversales",
    editable: false,
    align: "left",
    flex: 1,
    maxWidth: 120,
    renderCell: (params) => {
      return (
        <Stack
          height={1}
          direction="column"
          alignSelf="center"
          justifyContent="center"
        >
          <Typography variant="body2" textAlign={"center"} fontWeight={500}>
            {params?.row?.transversal || "-"}
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
