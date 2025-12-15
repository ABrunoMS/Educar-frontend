import { ListView } from '@components/list-view/ListView'
import { useQuery, UseQueryResult } from 'react-query'
import { Column } from 'react-table'
import { getUsers, UsersQueryResponse } from './core/_requests'
import { usePagination } from '@contexts/PaginationContext'
import { useState } from 'react'
import { User } from './core/_models'
import { UserEditModal } from './user-edit-modal/UserEditModal'
import { KTCard } from '@metronic/helpers'
import { ToolbarWrapper } from '@metronic/layout/components/toolbar'
import { Content } from '@metronic/layout/components/content'
import { ActionsCell } from '@components/list-view/table/columns/ActionsCell'
import { ID } from '@metronic/helpers'
import { ListViewProvider, useListView } from './core/ListViewProvider'

const UsersList = () => {
  const { page, pageSize, sortBy, sortOrder, filter, search } = usePagination()
  const { itemIdForUpdate } = useListView()

  const { data, isLoading }: UseQueryResult<UsersQueryResponse> = useQuery(
    ['users-list', page, pageSize, sortBy, sortOrder, filter, search],
    () => getUsers(page, pageSize, sortBy, sortOrder, filter, search),
    {
      keepPreviousData: true,
    }
  )

  const columns: Column<User>[] = [
    {
      Header: 'Nome',
      accessor: 'name',
    },
    {
      Header: 'Email',
      accessor: 'email',
    },
    {
      Header: 'Role',
      accessor: 'role',
    },
    {
      Header: '',
      id: 'actions',
      Cell: ({ ...props }) => (
        <ActionsCell
          editPath='/apps/user-management/users'
          id={props.data[props.row.index].id}
        />
      ),
    },
  ]

  return (
    <>
      <ListView
        data={data?.data || []}
        columns={columns}
        isLoading={isLoading}
        totalItems={data?.payload?.pagination?.totalCount || 0}
      />
      {itemIdForUpdate !== undefined && <UserEditModal />}
    </>
  )
}

const UsersListWrapper = () => (
  <ListViewProvider>
    <ToolbarWrapper />
    <Content>
      <UsersList />
    </Content>
  </ListViewProvider>
)

export { UsersListWrapper }
