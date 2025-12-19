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
import { ID, KTIcon } from '@metronic/helpers'
import { ListViewProvider, useListView } from './core/ListViewProvider'
import { MenuComponent } from '@metronic/assets/ts/components'
import { FC, useEffect } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { deleteAccount } from '@services/Accounts'


const UserActionsCell: FC<{ id: ID }> = ({ id }) => {
  const { setItemIdForUpdate } = useListView()
  const queryClient = useQueryClient()

  // Hook para deletar usuário
  const deleteItem = useMutation(() => deleteAccount(String(id)), {
    onSuccess: () => {
      // Recarrega a lista após deletar
      queryClient.invalidateQueries(['users-list'])
      alert('Usuário removido com sucesso!')
    },
    onError: (error: any) => {
    const mensagem = error.response?.data?.message || 'Erro ao remover usuário.';
    alert(mensagem);
    console.error(error);
    }
  })

  // REINICIALIZAÇÃO DO MENU: Essencial para o Dropdown abrir após trocar de página na tabela
  useEffect(() => {
    MenuComponent.reinitialization()
  }, [])

  return (
    <>
      <a
        href='#'
        className='btn btn-light btn-active-light-primary btn-sm'
        data-kt-menu-trigger='click'
        data-kt-menu-placement='bottom-end'
      >
        Ações
        <KTIcon iconName='down' className='fs-5 m-0' />
      </a>
      
      {/* MENU DROPDOWN */}
      <div
        className='menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-bold fs-7 w-125px py-4'
        data-kt-menu='true'
      >
        {/* ITEM: EDITAR */}
        <div className='menu-item px-3'>
          <a
            className='menu-link px-3'
            onClick={(e) => {
              e.preventDefault()
              setItemIdForUpdate(id) // <--- Abre o Modal
            }}
          >
            <i className="bi bi-pencil-square fs-5 me-2"></i>Editar
          </a>
        </div>

        {/* ITEM: REMOVER */}
        <div className='menu-item px-3'>
          <a
            className='menu-link px-3 text-danger'
            onClick={(e) => {
              e.preventDefault()
              if (window.confirm('Tem certeza que deseja deletar este usuário?')) {
                 deleteItem.mutate()
              }
            }}
          >
            <i className="bi bi-trash-fill fs-5 me-2 text-danger"></i>Remover
          </a>
        </div>
      </div>
    </>
  )
}



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
      Cell:({ row }) => <UserActionsCell id={row.original.id} />,
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
