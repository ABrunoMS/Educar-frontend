
import { ListView } from '@components/list-view/ListView'
import { ClientType } from '@interfaces/Client'
import { useMutation, useQuery, UseQueryResult } from 'react-query'
import { Column } from 'react-table'
import { deleteClient, getList } from './core/_requests'
import { PaginatedResponse, usePagination } from '@contexts/PaginationContext'
import { useState } from 'react'
import { ClientDetailsModal } from '@components/list-view/components/modals/ClientDetailsModal'


const clients: ClientType[] = [
  { name: 'Cliente - Escola 1', total_accounts: 10, remaining_accounts: 3, partner: 'Parceiro 1' },
  { name: 'Cliente - Escola 2', total_accounts: 2, remaining_accounts: 0, partner: 'Parceiro 2' },
  { name: 'Cliente - Escola 3', total_accounts: 63, remaining_accounts: 23, partner: 'Parceiro 3' },
]

const ClientListWrapper = () => {
  const {page, pageSize, sortBy, sortOrder, filter, search} = usePagination()
  const {data, isLoading}: UseQueryResult<PaginatedResponse<ClientType>> = useQuery(
    ['client-list', page, sortBy, sortOrder, filter, search],
    () => getList(page, pageSize, sortBy, sortOrder, filter, search),
    {
      keepPreviousData: true,
    }
  )
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  
  const handleOpenModal = (cLientId: string) => {
    setSelectedClientId(cLientId)
    setIsModalOpen(true)
  }
  
  const handleCloseModal = () => {
    console.log("A função handleCloseModal FOI CHAMADA!");
    setSelectedClientId(null)
    setIsModalOpen(false)
  }
  
  const columnsFake: Column<ClientType>[] = [
  { 
    Header: 'Nome', 
    accessor: 'name',
    Cell: ({ row }) => (
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          if (row.original.id) {
            handleOpenModal(row.original.id);
          }
        }}
        className='text-primary fw-bold'
      >
        {row.original.name}
      </a>
    )
  },
    { Header: 'Total de contas', accessor: 'total_accounts' },
    { Header: 'Contas restantes', accessor: 'remaining_accounts' },
    { Header: 'Parceiro', accessor: 'partner' },
  ]

  return (
    <>
    <ListView 
    data={data?.items || []}
      columns={columnsFake}
      isLoading={isLoading}
      totalItems={data?.totalCount || 0}
    />
     {isModalOpen && (
        <ClientDetailsModal
          clientId={selectedClientId!} 
          onClose={handleCloseModal}
        />
      )}
    </>
  )
}

export {ClientListWrapper}
