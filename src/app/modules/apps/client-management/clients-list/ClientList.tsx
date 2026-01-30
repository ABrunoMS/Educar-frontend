import { ClientType } from '@interfaces/Client'
import { useQuery, UseQueryResult, useQueryClient } from 'react-query'
import { Column } from 'react-table'
import { getList, deleteClient } from './core/_requests'
import { useQueryRequest, QueryRequestProvider } from '@components/list-view/core/QueryRequestProvider'
import { QueryResponseProvider } from '@components/list-view/core/QueryResponseProvider'
import { usePagination } from '@contexts/PaginationContext'
import { useState, useEffect } from 'react'
import { useDebounce } from '@metronic/helpers'
import { ListViewHeader } from '@components/list-view/components/header/ListViewHeader'
import { ListTable } from '@components/list-view/table/ListTable'
import { KTCard } from '@metronic/helpers'
import { ToolbarWrapper } from '@metronic/layout/components/toolbar'
import { Content } from '@metronic/layout/components/content'

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

const ClientListContent = () => {
  const {page, pageSize} = usePagination()
  const {state} = useQueryRequest()
  const searchFromContext = state.search || ''
  const debouncedSearch = useDebounce(searchFromContext, 300)
  const [deleteId, setDeleteId] = useState<ID>();
  const [showLoading, setShowLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

  const deleteActionCallback = (id: ID) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const handleOpenModal = (clientId: string) => {
    setSelectedClientId(clientId)
    setIsModalOpen(true)
  }
  
  const handleCloseModal = () => {
    setSelectedClientId(null)
    setIsModalOpen(false)
  }

  // A chamada useQuery agora espera o tipo MetronicResponse
  const {data, isLoading, refetch}: UseQueryResult<MetronicResponse<ClientType>> = useQuery(
    [
      'client-list',
      page,
      pageSize,
      debouncedSearch,
      state.filter?.macroRegionId,
      state.filter?.partner,
      state.filter?.contact,
    ],
    () => {
      return getList(
        page,
        pageSize,
        '',
        'asc',
        '',
        debouncedSearch,
        state.filter?.macroRegionId,
        state.filter?.partner,
        state.filter?.contact,
      )
    },
    {
      keepPreviousData: true,
    }
  )


  
  const deleteCallback = async () => {
    setShowLoading(true);
    try {
      await deleteClient(deleteId as string);
      setShowLoading(false);
      setShowDeleteDialog(false);
      toast.success('Cliente excluído com sucesso');
      refetch();
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
    { Header: 'Macro Região', accessor: 'macroRegionName' },
    { Header: 'Parceiro', accessor: 'partnerName' },
    { Header: 'Contato', accessor: 'contacts' },
    {
      Header: '',
      id: 'actions',
      Cell: ({ ...props }) => (
        <ActionsCell
          editPath='/apps/client-management/client'
          id={props.data[props.row.index].id}
          callbackFunction={deleteActionCallback}
        />
      ),
    }
  ]

  return (
    <>
      <ToolbarWrapper />
      <Content>
        <KTCard>
          <ListViewHeader />
          <ListTable
            data={Array.isArray(data?.data) ? data.data : []}
            columns={columns}
            isLoading={isLoading}
            totalItems={data?.payload?.pagination?.totalCount || 0}
          />
        </KTCard>
      </Content>
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

const ClientListWrapper = () => {
  return (
    <QueryRequestProvider>
      <QueryResponseProvider>
        <ClientListContent />
      </QueryResponseProvider>
    </QueryRequestProvider>
  )
}

export {ClientListWrapper}