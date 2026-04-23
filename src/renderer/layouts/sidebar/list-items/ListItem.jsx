import Link from "@mui/material/Link";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import React from "react";
import { muiIcons } from "../../../icons";

const ListItem = ({ subheader, icon = "", path, active }) => {
  const IconComponent = muiIcons[icon];

  return (
    <ListItemButton
      component={Link}
      href={path}
      sx={{
        mb: 1,
        ".MuiListItemIcon-root": {
          color: !active ? "text.primary" : "primary.main",
        },
        "&:hover": {
          ".MuiListItemIcon-root": {
            color: "primary.main",
          },
        },
      }}
    >
      <ListItemIcon>{IconComponent && <IconComponent />}</ListItemIcon>
      <ListItemText primary={subheader} sx={{}} />
    </ListItemButton>
  );
};

export default ListItem;
