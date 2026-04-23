import { useState } from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import Collapse from "@mui/material/Collapse";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import { useLocation } from "react-router-dom";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import React from "react";
import { muiIcons } from "../../../icons";
import ListItem from "./ListItem";

const CollapseListItem = ({ subheader, active, items, icon }) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(!open);
  };

  const IconComponent = muiIcons[icon];
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Box sx={{ pb: 1 }}>
      <ListItemButton onClick={handleClick}>
        <ListItemIcon>{IconComponent && <IconComponent />}</ListItemIcon>
        <ListItemText
          primary={subheader}
          sx={{
            "& .MuiListItemText-primary": {
              color: active ? "text.primary" : null,
            },
          }}
        />
        <KeyboardArrowUpIcon
          sx={{
            color: active ? "text.primary" : "text.disabled",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease-in-out",
          }}
        />
      </ListItemButton>

      <Collapse in={open} sx={{
        p: 0, m: 0, '& .MuiList-root': {
          m: 0
        }
      }} timeout="auto" unmountOnExit>
        <List sx={{ m: 0 }} component="div" disablePadding>
          {items?.map((route) => {
            return (
              <ListItem
                key={route.id}
                active={currentPath === route.path}
                {...route}
              />
            );
          })}
        </List>
      </Collapse>
    </Box>
  );
};

export default CollapseListItem;
