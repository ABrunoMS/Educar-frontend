import { useQuery, UseQueryResult } from 'react-query'
import { Column } from 'react-table'
import { getUsers, UsersQueryResponse } from './core/_requests'
import { usePagination } from '@contexts/PaginationContext'
import { useState, useEffect } from 'react'
import { User } from './core/_models'
import { UserEditModal } from './user-edit-modal/UserEditModal'
import { KTCard } from '@metronic/helpers'
import { ToolbarWrapper } from '@metronic/layout/components/toolbar'
import { Content } from '@metronic/layout/components/content'
import { ActionsCell } from '@components/list-view/table/columns/ActionsCell'
import { ID, KTIcon } from '@metronic/helpers'
import { ListViewProvider, useListView } from './core/ListViewProvider'
import { MenuComponent } from '@metronic/assets/ts/components'
import { FC } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { deleteAccount } from '@services/Accounts'
import { QueryRequestProvider, useQueryRequest } from '@components/list-view/core/QueryRequestProvider'
import { QueryResponseProvider } from '@components/list-view/core/QueryResponseProvider'
import { useDebounce } from '@metronic/helpers'
import { ListViewHeader } from '@components/list-view/components/header/ListViewHeader'
import { ListTable } from '@components/list-view/table/ListTable'
import { getClients } from '@services/Clients'
import { ClientType } from '@interfaces/Client'
import ALL_ROLES, { Role } from '@contexts/roles.generated'


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
  const { page, pageSize, setPage } = usePagination()
  const { state } = useQueryRequest()
  const searchFromContext = state.search || ''
  const debouncedSearch = useDebounce(searchFromContext, 300)
  const { itemIdForUpdate } = useListView()
  const [clients, setClients] = useState<ClientType[]>([])
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedRole, setSelectedRole] = useState('')

  // Carregar clientes ao montar
  useEffect(() => {
    getClients().then(res => {
      const items = res.data?.data || res.data || [];
      setClients(Array.isArray(items) ? items : []);
    }).catch(err => console.error('Erro ao carregar clientes:', err));
  }, []);

  // Resetar para página 1 quando filtros mudarem
  useEffect(() => {
    setPage(1);
  }, [selectedClient, selectedRole, debouncedSearch]);

  const { data, isLoading }: UseQueryResult<UsersQueryResponse> = useQuery(
    ['users-list', page, pageSize, debouncedSearch, selectedClient, selectedRole],
    () => getUsers(page, pageSize, '', 'asc', '', debouncedSearch, selectedClient, selectedRole),
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
      Header: 'Cliente',
      id: 'clientName',
      Cell: ({ row }) => <span>{row.original.clientName || '-'}</span>,
    },
    {
      Header: '',
      id: 'actions',
      Cell:({ row }) => <UserActionsCell id={row.original.id} />,
    },
  ]

  const customFiltersContent = (
    <>
      {/* Filtro por Cliente */}
      <div className='mb-5'>
        <label className='form-label fs-6 fw-bold'>Cliente:</label>
        <select
          className='form-select form-select-solid fw-bolder'
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
        >
          <option value=''>Todos os clientes</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      {/* Filtro por Role */}
      <div className='mb-5'>
        <label className='form-label fs-6 fw-bold'>Cargo (Role):</label>
        <select
          className='form-select form-select-solid fw-bolder'
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value=''>Todos os cargos</option>
          {ALL_ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>
    </>
  );

  const handleResetFilters = () => {
    setSelectedClient('');
    setSelectedRole('');
  };

  return (
    <>
      <ToolbarWrapper />
      <Content>
        <KTCard>
          <ListViewHeader 
            customFilters={customFiltersContent}
            onResetFilters={handleResetFilters}
          />
          <ListTable
            data={Array.isArray(data?.data) ? data.data : []}
            columns={columns}
            isLoading={isLoading}
            totalItems={data?.payload?.pagination?.totalCount || 0}
          />
        </KTCard>
      </Content>
      {itemIdForUpdate !== undefined && <UserEditModal />}
    </>
  )
}

const UsersListWrapper = () => (
  <ListViewProvider>
    <QueryRequestProvider>
      <QueryResponseProvider>
        <UsersList />
      </QueryResponseProvider>
    </QueryRequestProvider>
  </ListViewProvider>
)

export { UsersListWrapper }
