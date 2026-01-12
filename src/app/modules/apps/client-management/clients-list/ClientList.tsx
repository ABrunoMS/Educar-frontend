import { ListView } from '@components/list-view/ListView'
import { ClientType } from '@interfaces/Client'
import { useQuery, UseQueryResult, useQueryClient } from 'react-query'
import { Column } from 'react-table'
import { getList, deleteClient } from './core/_requests'
import { usePagination } from '@contexts/PaginationContext'
import { useState } from 'react'

import ClientDetailsModal from '../../../../components/list-view/components/modals/ClientDetailsModal'
import DeleteDialog from '@components/delete-dialog/DeleteDialog'

import { Link } from 'react-router-dom'
import { ActionsCell } from '@components/list-view/table/columns/ActionsCell'
import { ID } from '@metronic/helpers'
import { toast } from 'react-toastify'


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
  const [deleteId, setDeleteId] = useState<ID>();
  const [showLoading, setShowLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  
  

  const deleteActionCallback = (id: ID) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };
  // A chamada useQuery agora espera o tipo MetronicResponse
  const {data, isLoading, refetch}: UseQueryResult<MetronicResponse<ClientType>> = useQuery(
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
  
  const deleteCallback = async () => {
    setShowLoading(true);
    try {
      await deleteClient(deleteId as string); // Chame a função de deletar cliente
      setShowLoading(false);
      setShowDeleteDialog(false);
      toast.success('Cliente excluído com sucesso');
      refetch(); // Atualiza a lista
    } catch (error) {
      toast.error('Ocorreu um erro ao excluir o cliente');
      setShowDeleteDialog(false);
      setShowLoading(false);
    }
  };
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
    { Header: 'Parceiro', accessor: 'partnerName' },
    { Header: 'Contato', accessor: 'contacts' },
    {
      Header: '',
      id: 'actions',
      Cell: ({ ...props }) => (
        <ActionsCell
          // Garanta que o 'editPath' está correto
          editPath='/apps/client-management/client' // A Célula irá adicionar o /:id
          id={props.data[props.row.index].id}
          callbackFunction={deleteActionCallback}
        />
      ),
    }
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
      <DeleteDialog
        open={showDeleteDialog}
        loading={showLoading}
        closeCallback={() => setShowDeleteDialog(false)}
        actionCallback={deleteCallback}
      />
    </>
  )
}

export {ClientListWrapper}