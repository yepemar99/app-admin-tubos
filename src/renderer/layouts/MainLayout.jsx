import { useState } from "react";
import Stack from "@mui/material/Stack";
import Sidebar from "./sidebar/SideBar";
// import Topbar from "layouts/main-layout/topbar";
// import Footer from "./footer";
import { Outlet } from "react-router-dom";
import React from "react";
import { Box } from "@mui/material";

const MainLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  return (
    <Stack width={1} minHeight="100vh">
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        setIsClosing={setIsClosing}
      />
      <Box sx={{ p: 3, width: { xs: 1, lg: `calc(100% - 300px)` } }}>
        <Outlet />
      </Box>
    </Stack>
  );
};

export default MainLayout;
