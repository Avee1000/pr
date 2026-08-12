import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  columnSizingFeature,
  columnResizingFeature,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
  columnPinningFeature,
  rowPinningFeature,
} from "@tanstack/react-table"

export const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  columnResizingFeature,
  columnPinningFeature,
  rowPaginationFeature,
  rowPinningFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
})

export type DataTableFeatures = typeof features
