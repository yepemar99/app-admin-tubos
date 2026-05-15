export const orderQuery = ({
  secondaryOrderCols = [],
  safeOrderBy,
  safeOrderDir,
}) => {
  let orderBySQL;
  const orderParts = [];
  if (safeOrderBy && safeOrderDir)
    orderParts.push(`${safeOrderBy} ${safeOrderDir}`);
  for (const col of secondaryOrderCols) {
    if (col !== safeOrderBy && !orderParts.some((p) => p.startsWith(col))) {
      orderParts.push(`${col} ${safeOrderDir || 'ASC'}`);
    }
  }
  return orderParts.join(', ');
};

export const formatDateForInput = (dateValue) => {
  if (!dateValue) return null;
  const date = new Date();
  const baseDate = dateValue.fecha
    ? new Date(`${dateValue.fecha}T00:00:00`)
    : date.toISOString();
  const dd = String(baseDate.getDate()).padStart(2, '0');
  const mm = String(baseDate.getMonth() + 1).padStart(2, '0');
  const aa = String(baseDate.getFullYear()).slice(-2);

  const createdAt = dateValue.creado
    ? `${dateValue.fecha}T${date.toTimeString().slice(0, 8)}`
    : null;

  return {
    createdAt: createdAt,
    dd: dd,
    mm: mm,
    aa: aa,
    formatted: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
  };
};
