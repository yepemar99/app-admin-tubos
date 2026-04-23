import paths from "./paths";

export const sitemap = [
  {
    id: "home",
    subheader: "Inicio",
    path: paths.home,
    icon: "malla",
  },
  {
    id: "cutting_plan",
    subheader: "Plan de Corte",
    path: paths.cuttingPlan,
    icon: "malla",
  },
  {
    id: "sales_packages",
    subheader: "Salidas de paquetes",
    path: paths.salesPackages,
    icon: "malla",
  },
  {
    id: "inventory",
    subheader: "Inventario",
    icon: "malla",
    items: [
      {
        id: "bobinas",
        subheader: "Bobinas",
        path: paths.bobinas,
        icon: "malla",
      },
      {
        id: "flejes",
        subheader: "Flejes",
        path: paths.flejes,
        icon: "malla",
      },
      {
        id: "tubos",
        subheader: "Tubos",
        path: paths.tubos,
        icon: "malla",
      },
    ],
  },
];
