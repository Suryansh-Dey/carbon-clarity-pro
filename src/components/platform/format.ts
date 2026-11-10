/** Indian-grouped number with a fixed number of decimals. */
export const fmt = (x: number, d = 1) =>
  (+x).toLocaleString("en-IN", { maximumFractionDigits: d, minimumFractionDigits: d });
