import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './renderer/theme/theme';
import { Bounce, ToastContainer } from 'react-toastify';
import MainLayout from './renderer/layouts/MainLayout';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import paths from './renderer/routes/paths';
import React from 'react';
import Home from './renderer/views/home/Home';
import PlanesCorteCrud from './renderer/views/planesCorte/PlanesCorte';
import { DataProvider } from './renderer/contexts/DataContext';
import BobinasCrud from './renderer/views/bobinas/BobinasCrud';
import Flejes from './renderer/views/flejes/Flejes';
import Tubos from './renderer/views/tubos/Tubos';
import SalidaPaqs from './renderer/views/salidaPaqs/SalidaPaqs';
import ProdTubosView from './renderer/views/prodTubos/ProdTubosView';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <ThemeProvider theme={theme}>
      <DataProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Bounce}
        />
        <Routes>
          <Route path={paths.home} element={<MainLayout />}>
            <Route path={paths.home} element={<Home />} />
            <Route path={paths.cuttingPlan} element={<PlanesCorteCrud />} />
            <Route path={paths.prodTubos} element={<ProdTubosView />} />
            <Route path={paths.salesPackages} element={<SalidaPaqs />} />
            <Route path={paths.bobinas} element={<BobinasCrud />} />
            <Route path={paths.flejes} element={<Flejes />} />
            <Route path={paths.tubos} element={<Tubos />} />
          </Route>
        </Routes>
      </DataProvider>
    </ThemeProvider>
  </Router>,
);
