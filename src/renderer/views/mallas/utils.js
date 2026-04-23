export const initFilters = [
  {
    name: "region",
    label: "Región",
    value: "",
    type: "select",
    options: [],
  },
  {
    name: "diametro",
    label: "Diámetro",
    value: "",
    type: "select",
    options: [],
  },
  {
    name: "longitud",
    label: "Longitudinal",
    value: "",
    type: "select",
    options: [],
    minWidth: 130,
  },
  {
    name: "transversal",
    label: "Transversal",
    value: "",
    type: "select",
    options: [],
    minWidth: 130,
  },
];

export const loadRegions = async () => {
  const regions = await window.api.mallas.getRegions();
  return regions || [];
};

export const loadDiametros = async (region = null) => {
  const diametros = await window.api.mallas.getDiametros({ region: region });
  return diametros || [];
};

export const loadLongitudinales = async () => {
  const longitudinales = await window.api.mallas.getLongitudinales();
  return longitudinales || [];
};

export const loadTransversales = async () => {
  const transversales = await window.api.mallas.getTransversales();
  return transversales || [];
};

export const loadFabricas = async () => {
  const fabricas = await window.api.fabricas.getAll();
  return fabricas;
};
