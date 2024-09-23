import {useMemo} from 'react'
import {useTable, ColumnInstance, Row} from 'react-table'
// import {CustomHeaderColumn} from './columns/CustomHeaderColumn'
import {CustomRow} from './columns/CustomRow'
// import {useQueryResponseData, useQueryResponseLoading} from '../core/QueryResponseProvider'
// import {usersColumns} from './columns/_columns'
import {User} from '../core/_models'
// import {UsersListLoading} from '../components/loading/UsersListLoading'
// import {UsersListPagination} from '../components/pagination/UsersListPagination'
import {KTCardBody} from '../../../../../../_metronic/helpers'
import {Column} from 'react-table'


const columnsFake: Column<User>[] = [
  { Header: 'ID', accessor: 'id' },
  { Header: 'Nome', accessor: 'name' },
  { Header: 'Role', accessor: 'role' },
  { Header: 'Email', accessor: 'email' },
]

const UsersTable = () => {
  const users: User[] = [
    { name: 'anderson', role: 'Admin', email: 'a@a.com', id: 1 },
    { name: 'Gilberto silva', role: 'Teacher', email: 'a@a.com', id: 2 },
    { name: 'Jão Sem Braço', role: 'Student', email: 'a@a.com', id: 3 },
  ]
  const isLoading = false;
  const data = useMemo(() => users, [users])
  const columns = useMemo(() => columnsFake, [])
  const {getTableProps, getTableBodyProps, headers, rows, prepareRow} = useTable({
    columns,
    data,
  })

  return (
    <KTCardBody className='py-4'>
      <div className='table-responsive'>
        <table
          id='kt_table_users'
          className='table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer'
          {...getTableProps()}
        >
          <thead>
            <tr className='text-start text-muted fw-bolder fs-7 text-uppercase gs-0'>
              {headers.map((column: ColumnInstance<User>) => (
                // <CustomHeaderColumn key={column.id} column={column} />
                <>
                  {
                    column.Header && typeof column.Header === 'string' ?
                    <th {...column.getHeaderProps()}>{column.render('Header')}</th> :
                    column.render('Header')
                  }
                </>
              ))}
            </tr>
          </thead>
          <tbody className='text-gray-600 fw-bold' {...getTableBodyProps()}>
            {rows.length > 0 ? (
              rows.map((row: Row<User>, i) => {
                prepareRow(row)
                return <CustomRow row={row} key={`row-${i}-${row.id}`} />
                // return <div>a</div>
              })
            ) : (
              <tr>
                <td colSpan={7}>
                  <div className='d-flex text-center w-100 align-content-center justify-content-center'>
                    No matching records found
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* <UsersListPagination />
      {isLoading && <UsersListLoading />} */}
    </KTCardBody>
  )
}

export {UsersTable}
