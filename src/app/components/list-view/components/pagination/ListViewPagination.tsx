import { usePagination } from '@contexts/PaginationContext'

interface ListViewPaginationProps {
  isLoading: boolean;
  total: number;
}

const ListViewPagination = ({isLoading, total}: ListViewPaginationProps) => {
  const {page, pageSize, setPage} = usePagination()

  const totalPages = Math.ceil(total / pageSize)
  const maxPageNumbersToShow = 10
  const halfPageNumbersToShow = maxPageNumbersToShow / 2

  // Calculate the start and end page numbers
  let startPage = Math.max(page - halfPageNumbersToShow, 1)
  let endPage = Math.min(page + halfPageNumbersToShow - 1, totalPages)

  if (startPage > 1 && endPage - startPage < maxPageNumbersToShow - 1) {
    endPage = Math.min(startPage + maxPageNumbersToShow - 1, totalPages)
  }

  if (endPage < totalPages && endPage - startPage < maxPageNumbersToShow - 1) {
    startPage = Math.max(endPage - maxPageNumbersToShow + 1, 1)
  }

  const pageNumbers = []
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i)
  }

  return (
    <div className='row'>
      <div className='col-sm-12 col-md-5 d-flex align-items-center justify-content-center justify-content-md-start'></div>
      <div className='col-sm-12 col-md-7 d-flex align-items-center justify-content-center justify-content-md-end'>
        <div id='kt_table_users_paginate'>
          <ul className='pagination'>
            {/* <li
              className={clsx('page-item', {
                disabled: isLoading || pagination.page === 1,
              })}
            >
              <a onClick={() => setPage(1)} style={{cursor: 'pointer'}} className='page-link'>
                First
              </a>
            </li> */}
            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(1)} aria-label="First">
                &laquo;
              </button>
            </li>
            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(page - 1)} aria-label="Previous">
                &lsaquo;
              </button>
            </li>
            {/* {paginationLinks
              ?.map((link) => {
                return {...link, label: mappedLabel(link.label)}
              })
              .map((link) => (
                <li
                  key={link.label}
                  className={clsx('page-item', {
                    active: pagination.page === link.page,
                    disabled: isLoading,
                    previous: link.label === 'Previous',
                    next: link.label === 'Next',
                  })}
                >
                  <a
                    className={clsx('page-link', {
                      'page-text': link.label === 'Previous' || link.label === 'Next',
                      'me-5': link.label === 'Previous',
                    })}
                    onClick={() => setPage(link.page || 1)}
                    style={{cursor: 'pointer'}}
                  >
                    {mappedLabel(link.label)}
                  </a>
                </li>
              ))} */}
            {pageNumbers.map((pageNumber) => (
              <li key={pageNumber} className={`page-item ${page === pageNumber ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setPage(pageNumber)}>
                  {pageNumber}
                </button>
              </li>
            ))}
            {/* <li
              className={clsx('page-item', {
                disabled: isLoading || pagination.page === (pagination.links?.length || 3) - 2,
              })}
            >
              <a
                onClick={() => setPage((pagination.links?.length || 3) - 2)}
                style={{cursor: 'pointer'}}
                className='page-link'
              >
                Last
              </a>
            </li> */}
            <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(page + 1)} aria-label="Next">
                &rsaquo;
              </button>
            </li>
            <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(totalPages)} aria-label="Last">
                &raquo;
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export { ListViewPagination }
