import { range } from 'lodash';
import { Pagination as BootstrapPagination } from 'react-bootstrap';
import React from 'react';

export interface PaginationProps
  extends Omit<React.HTMLProps<HTMLDivElement>, 'onChange'> {
  activePage: number;
  pageCount: number;
  onChange: (page: number) => void;
}

export const Pagination = ({
  activePage,
  pageCount,
  onChange,
}: PaginationProps): JSX.Element => {
  // How many buttons per page
  const numPaginationButtons = 5;
  // How many pagination buttons there are
  const numPaginationPages = Math.max(
    1,
    Math.ceil(pageCount / numPaginationButtons),
  );
  // The 0-indexed current pagination button page
  const currentPaginationPage = Math.floor(
    (activePage - 1) / numPaginationButtons,
  );

  return (
    <BootstrapPagination>
      {/* BootstrapPagination.Item calls onClick even when disabled, so we have to guard the onClick */}
      <BootstrapPagination.Item
        disabled={activePage === 1}
        onClick={() => activePage !== 1 && onChange(activePage - 1)}
      >
        Previous
      </BootstrapPagination.Item>
      {currentPaginationPage > 0 && (
        <BootstrapPagination.Item
          key="pageBack"
          onClick={() =>
            onChange((currentPaginationPage - 1) * numPaginationButtons + 1)
          }
        >
          …
        </BootstrapPagination.Item>
      )}
      {range(
        currentPaginationPage * numPaginationButtons + 1,
        Math.min(
          (currentPaginationPage + 1) * numPaginationButtons + 1,
          pageCount + 1,
        ),
      ).map((page) => (
        <BootstrapPagination.Item
          key={page}
          active={page === activePage}
          onClick={() => onChange(page)}
        >
          {page}
        </BootstrapPagination.Item>
      ))}
      {currentPaginationPage < numPaginationPages - 1 && (
        <BootstrapPagination.Item
          key="pageForward"
          onClick={() =>
            onChange((currentPaginationPage + 1) * numPaginationButtons + 1)
          }
        >
          …
        </BootstrapPagination.Item>
      )}
      {/* BootstrapPagination.Item calls onClick even when disabled, so we have to guard the onClick */}
      <BootstrapPagination.Item
        disabled={activePage === pageCount}
        onClick={() => activePage !== pageCount && onChange(activePage + 1)}
      >
        Next
      </BootstrapPagination.Item>
    </BootstrapPagination>
  );
};
