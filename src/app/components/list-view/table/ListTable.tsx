import { useMemo } from 'react'
import { useTable, ColumnInstance, Row } from 'react-table'
import { CustomHeaderColumn } from './columns/CustomHeaderColumn'
import { CustomRow } from './columns/CustomRow'
import { KTCardBody } from '@metronic/helpers'
import { presetColumns } from './columns/_columns'
import { Column } from 'react-table'
import { ListViewPagination } from '../components/pagination/ListViewPagination'

export interface ListViewType<T extends object> {
  totalItems: number;
  columns: Column<T>[];
  data: T[];
  isLoading: boolean;
}

const ListTable = <T extends object>({data, columns, isLoading, totalItems}: ListViewType<T>) => {
  const memoizedData = useMemo(() => data, [data])
  const memoizedColumns = useMemo(() => columns, [columns])
  const {getTableProps, getTableBodyProps, headers, rows, prepareRow} = useTable({
    columns: memoizedColumns,
    data: memoizedData,
  })

  return (
    <KTCardBody className='py-4'>
      <div className='table-responsive'>
        <table
          id='kt_table'
          className='table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer'
          {...getTableProps()}
        >
          <thead>
            <tr className='text-start text-muted fw-bolder fs-7 text-uppercase gs-0'>
                {headers.map((column: ColumnInstance<T>) => (
                  <CustomHeaderColumn key={column.id} column={column} />
                ))}
            </tr>
          </thead>
          <tbody className='text-gray-600 fw-bold' {...getTableBodyProps()}>
            {rows.length > 0 ? (
                rows.map((row: Row<T>, i) => {
                  prepareRow(row)
                  return <CustomRow row={row} key={`row-${i}-${row.id}`} />
                })
              ) : (
                <tr>
                  <td colSpan={memoizedColumns.length}>
                    <div className='d-flex text-center w-100 align-content-center justify-content-center'>
                      Nenhum resultado encontrado.
                    </div>
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
      <ListViewPagination isLoading={isLoading} total={totalItems} />
      {/* {isLoading && <UsersListLoading />} */}
    </KTCardBody>
  )
}

export {ListTable}
