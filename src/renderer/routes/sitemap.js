import paths from './paths';

export const sitemap = [
  {
    id: 'home',
    subheader: 'Inicio',
    path: paths.home,
    icon: 'home',
  },
  {
    id: 'cutting_plan',
    subheader: 'Plan de Corte',
    path: paths.cuttingPlan,
    icon: 'cutting_plan',
  },
  {
    id: 'sales_packages',
    subheader: 'Salidas de paquetes',
    path: paths.salesPackages,
    icon: 'sales_packages',
  },
  {
    id: 'inventory',
    subheader: 'Inventario',
    icon: 'inventory',
    items: [
      {
        id: 'bobinas',
        subheader: 'Bobinas',
        path: paths.bobinas,
        icon: 'bobinas',
      },
      {
        id: 'flejes',
        subheader: 'Flejes',
        path: paths.flejes,
        icon: 'flejes',
      },
      {
        id: 'tubos',
        subheader: 'Tubos',
        path: paths.tubos,
        icon: 'tubos',
      },
    ],
  },
];
