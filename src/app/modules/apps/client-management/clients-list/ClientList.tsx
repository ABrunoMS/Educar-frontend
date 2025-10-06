import { ListView } from '@components/list-view/ListView'
import { ClientType } from '@interfaces/Client'
import { useQuery, UseQueryResult } from 'react-query'
import { Column } from 'react-table'
import { getList } from './core/_requests'
import { usePagination } from '@contexts/PaginationContext'
import { useState } from 'react'

import  ClientDetailsModal  from '../../../../components/list-view/components/modals/ClientDetailsModal'
import { Link } from 'react-router-dom'


// Definimos uma interface para a resposta do Metronic
interface MetronicResponse<T> {
  data: T[];
  payload: {
    pagination: {
      totalCount: number;
    };
  };
}

const ClientListWrapper = () => {
  const {page, pageSize, sortBy, sortOrder, filter, search} = usePagination()
  
  // A chamada useQuery agora espera o tipo MetronicResponse
  const {data, isLoading}: UseQueryResult<MetronicResponse<ClientType>> = useQuery(
    ['client-list', page, sortBy, sortOrder, filter, search],
    () => getList(page, pageSize, sortBy, sortOrder, filter, search),
    {
      keepPreviousData: true,
    }
  )
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  
  const handleOpenModal = (clientId: string) => {
    setSelectedClientId(clientId)
    setIsModalOpen(true)
  }
  
  const handleCloseModal = () => {
    setSelectedClientId(null)
    setIsModalOpen(false)
  }
  
  // As colunas usam camelCase, que é o formato dentro do array 'data'
  const columns: Column<ClientType>[] = [
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
    { Header: 'Total de contas', accessor: 'totalAccounts' },
    { Header: 'Contas restantes', accessor: 'remainingAccounts' },
    { Header: 'Parceiro', accessor: 'partner' },
  ]

  return (
    <>
      <ListView 
        // 1. CORREÇÃO: Buscando a lista de 'data.data'
        data={data?.data || []}
        columns={columns}
        isLoading={isLoading}
        // 2. CORREÇÃO: Buscando o total de 'data.payload.pagination.totalCount'
        totalItems={data?.payload?.pagination?.totalCount || 0}
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