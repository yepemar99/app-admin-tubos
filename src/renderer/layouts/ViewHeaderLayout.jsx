import { Box, Card, Typography } from "@mui/material";
import { flexSpaceBetween } from "../utils/styles";
import React from "react";

const ViewHeaderLayout = ({ title = "", actions, sx = {} }) => {
  return (
    <Box sx={{ ...flexSpaceBetween, ...sx }}>
      <Typography variant="h4" fontWeight={600}>
        {title}
      </Typography>
      {actions}
    </Box>
  );
};

export default ViewHeaderLayout;
