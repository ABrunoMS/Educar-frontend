import { ListView } from '@components/list-view/ListView'
import { SchoolType } from '@interfaces/School'
import { useMutation, useQuery, UseQueryResult } from 'react-query'
import { Column } from 'react-table'
import { deleteSchool, getList } from './core/_requests'
import { PaginatedResponse, usePagination } from '@contexts/PaginationContext'

const columns: Column<SchoolType>[] = [
  { Header: 'Nome', accessor: 'name' },
  { Header: 'Descrição', accessor: 'description' },
  { 
    Header: 'Endereço', 
    accessor: 'address',
    Cell: ({ value }) => value ? `${value.street}, ${value.city} - ${value.state}` : '-'
  },
  { 
    Header: 'Cliente', 
    accessor: 'client',
    Cell: ({ value }) => value ? value.name : '-'
  },
]

const SchoolListWrapper = () => {
  const {page, pageSize, sortBy, sortOrder, filter, search} = usePagination()
  const {data, isLoading}: UseQueryResult<PaginatedResponse<SchoolType>> = useQuery(
    ['school-list', page, sortBy, sortOrder, filter, search],
    () => getList(page, pageSize, sortBy, sortOrder, filter, search),
    {
      keepPreviousData: true,
    }
  )

  return (
    <ListView 
      data={data?.data || []}
      columns={columns}
      isLoading={isLoading}
      totalItems={data?.payload.pagination.totalCount || 0}
    />
  )
}

export {SchoolListWrapper}
