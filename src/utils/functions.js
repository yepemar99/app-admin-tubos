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
