import { SchoolType } from '@interfaces/School'
import { ClientType } from '@interfaces/Client'
import { useMutation, useQuery, UseQueryResult } from 'react-query'
import { Column } from 'react-table'
import { deleteSchool, getList } from './core/_requests'
import { PaginatedResponse, usePagination } from '@contexts/PaginationContext'
import { ActionsCell } from '@components/list-view/table/columns/ActionsCell'
import { useState, useEffect } from 'react'
import { ID, KTCard } from '@metronic/helpers'
import DeleteDialog from '@components/delete-dialog/DeleteDialog'
import { toast } from 'react-toastify'
import { useQueryRequest, QueryRequestProvider } from '@components/list-view/core/QueryRequestProvider'
import { QueryResponseProvider } from '@components/list-view/core/QueryResponseProvider'
import { useDebounce } from '@metronic/helpers'
import { ListViewHeader } from '@components/list-view/components/header/ListViewHeader'
import { ListTable } from '@components/list-view/table/ListTable'
import { ToolbarWrapper } from '@metronic/layout/components/toolbar'
import { Content } from '@metronic/layout/components/content'
import { getClients } from '@services/Clients'
import { useRole } from '@contexts/RoleContext'

const SchoolListContent = () => {
  const {page, pageSize, setPage} = usePagination();
  const {state} = useQueryRequest();
  const { canEdit, isReadOnly } = useRole();
  const searchFromContext = state.search || '';
  const debouncedSearch = useDebounce(searchFromContext, 300);
  const [deleteId, setDeleteId] = useState<ID>();
  const [showLoading, setShowLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [clients, setClients] = useState<ClientType[]>([]);
  const [selectedClient, setSelectedClient] = useState('');

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
  }, [selectedClient, debouncedSearch]);

  const columns: Column<SchoolType>[] = [
    { Header: 'Nome', accessor: 'name' },
    { Header: 'Descrição', accessor: 'description' },
    { 
      Header: 'Regional', 
      accessor: 'regional',
      Cell: ({ value }) => value ? value.name : '-'
    },
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
    {
      Header: '',
      id: 'actions',
      Cell: ({ ...props }) => (
        <ActionsCell
          editPath='/apps/school-management/school'
          id={props.data[props.row.index].id}
          callbackFunction={deleteActionCallback}
          readOnly={isReadOnly()}
        />
      ),
    },
  ]

  const {data, isLoading, refetch}: UseQueryResult<PaginatedResponse<SchoolType>> = useQuery(
    ['school-list', page, pageSize, debouncedSearch, selectedClient],
    () => getList(page, pageSize, '', 'asc', '', debouncedSearch, selectedClient),
    {
      keepPreviousData: true,
    }
  )

  const deleteActionCallback = (id: ID) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const deleteCallback = async () => {
    setShowLoading(true);

    try {
      await deleteSchool(deleteId);
      setShowLoading(false);
      setShowDeleteDialog(false);
      toast.success('Escola excluída com sucesso');
      refetch();
    } catch (error) {
      console.error('Erro ao excluir escola:', error);
      toast.error('Ocorreu um erro ao solicitar exclusão');
      setShowDeleteDialog(false);
      setShowLoading(false);
    }
  };

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
    </>
  );

  const handleResetFilters = () => {
    setSelectedClient('');
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
      <DeleteDialog
        open={showDeleteDialog}
        loading={showLoading}
        closeCallback={() => setShowDeleteDialog(false)}
        actionCallback={deleteCallback}
      />
    </>
  )
}

const SchoolListWrapper = () => {
  return (
    <QueryRequestProvider>
      <QueryResponseProvider>
        <SchoolListContent />
      </QueryResponseProvider>
    </QueryRequestProvider>
  )
}

export {SchoolListWrapper}
