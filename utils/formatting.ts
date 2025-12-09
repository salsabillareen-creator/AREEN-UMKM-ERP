// utils/formatting.ts
export const formatCurrency = (value: number): string => {
  // Using 'id-ID' locale for appropriate number grouping (dots for thousands).
  // Prepending 'Rp ' manually to ensure consistency across all browsers and environments.
  return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;
};
