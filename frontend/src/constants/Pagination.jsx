import BpkPagination from '@skyscanner/backpack-web/bpk-component-pagination';

export const Pagination = () => (
  <BpkPagination
    pageCount={20}
    selectedPageIndex={0}
    onPageChange={pageIndex => alert(`page ${pageIndex + 1}`)}
    previousLabel="previous"
    nextLabel="next"
    visibleRange={3}
    pageLabel={(page, isSelected) => `page ${page}`}
  />
);