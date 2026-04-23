import { DataGrid } from "@mui/x-data-grid";
import React from "react";
import { PAGE_SIZE, ROW_HEIGHT } from "../../../../utils/constants";
import ActionMenu from "../../../components/common/ActionMenu";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import DataGridFooter from "../../../components/common/DataGridFooter";
import { Stack, Typography } from "@mui/material";

const PlantillasTable = ({
  loading = false,
  rows = [],
  total = 0,
  page = 1,
  handleDelete = () => {},
  handleDetail = () => {},
  handleEdit = () => {},
  handleEditCertificate = () => {},
  handleChangePage = () => {},
}) => {
  const options = [
    {
      id: "certificate.action",
      onHandle: handleEditCertificate,
      icon: "certificado",
      label: "Certificado",
    },
  ];
  return (
    <DataGrid
      sx={{ maxHeight: "calc(100vh - 200px)", width: "100%" }}
      //   apiRef={apiRef}
      density="standard"
      loading={loading}
      rowCount={total}
      paginationMode="server"
      columns={getColumns(handleDetail, handleEdit, handleDelete, options)}
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

export default PlantillasTable;

const getColumns = (handleDetail, handleEdit, handleDelete, options = []) => [
  {
    field: "id",
    headerName: "Id",
    editable: false,
    align: "left",
    flex: 1,
    maxWidth: 50,
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
    field: "nombre",
    headerName: "Nombre",
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
          {params?.row?.nombre || "-"}
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
          options={options.map((o) => {
            const newOnHandle = () => {
              o.onHandle(params.row);
            };
            return { ...o, onHandle: newOnHandle };
          })}
        >
          <MoreHorizIcon />
        </ActionMenu>
      </Stack>
    ),
  },
];
