export function paginateRows<T>(rows: T[], rowsPerPage: number): T[][] {
  if (!rows || rows.length === 0) return [];
  const pages: T[][] = [];
  for (let i = 0; i < rows.length; i += rowsPerPage) {
    pages.push(rows.slice(i, i + rowsPerPage));
  }
  return pages;
}
