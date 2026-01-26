import { useQuery, useQueryClient, UseQueryResult } from 'react-query';
import { Column } from 'react-table';
import { deleteItem, getList } from './core/_requests';
import { PaginatedResponse, usePagination } from '@contexts/PaginationContext';
import { Class } from '@interfaces/Class';
import { ClientType } from '@interfaces/Client';
import { SchoolType } from '@interfaces/School';
import { ActionsCell } from '@components/list-view/table/columns/ActionsCell';
import { useState, useEffect } from 'react';
import { ID, KTCard } from '@metronic/helpers';
import DeleteDialog from '@components/delete-dialog/DeleteDialog';
import { toast } from 'react-toastify';
import { useQueryRequest, QueryRequestProvider } from '@components/list-view/core/QueryRequestProvider';
import { QueryResponseProvider } from '@components/list-view/core/QueryResponseProvider';
import { useDebounce } from '@metronic/helpers';
import { ListViewHeader } from '@components/list-view/components/header/ListViewHeader';
import { ListTable } from '@components/list-view/table/ListTable';
import { ToolbarWrapper } from '@metronic/layout/components/toolbar';
import { Content } from '@metronic/layout/components/content';
import { getClients } from '@services/Clients';
import { getSchoolsByClient } from '@services/Schools';

const ClassListContent = () => {
  const {page, pageSize, setPage} = usePagination();
  const {state} = useQueryRequest();
  const searchFromContext = state.search || '';
  const debouncedSearch = useDebounce(searchFromContext, 300);
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<ID>();
  const [showLoading, setShowLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [clients, setClients] = useState<ClientType[]>([]);
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);

  // Carregar clientes ao montar
  useEffect(() => {
    getClients().then(res => {
      const items = res.data?.data || res.data || [];
      setClients(Array.isArray(items) ? items : []);
    }).catch(err => console.error('Erro ao carregar clientes:', err));
  }, []);

  // Carregar escolas quando o cliente é selecionado
  useEffect(() => {
    if (!selectedClient) {
      setSchools([]);
      setSelectedSchool('');
      return;
    }
    setIsLoadingSchools(true);
    getSchoolsByClient(selectedClient).then(res => {
      const items = res.data?.data || res.data || [];
      setSchools(Array.isArray(items) ? items : []);
      // Limpar escola selecionada se não estiver na lista
      if (selectedSchool && !items.some((s: SchoolType) => s.id === selectedSchool)) {
        setSelectedSchool('');
      }
    }).catch(err => console.error('Erro ao carregar escolas:', err))
    .finally(() => setIsLoadingSchools(false));
  }, [selectedClient]);

  // Resetar para página 1 e invalidar query quando filtros mudarem
  useEffect(() => {
    setPage(1);
    // Invalidar a query para forçar uma nova busca
    queryClient.invalidateQueries(['class-list']);
  }, [selectedClient, selectedSchool, debouncedSearch, setPage, queryClient]);

  const columns: Column<Class>[] = [
    {
      Header: 'Nome',
      accessor: 'name',
    },
    {
      Header: 'Descrição',
      accessor: 'description',
    },
    {
      Header: 'Propósito',
      accessor: 'purpose',
    },
    {
      Header: '',
      id: 'actions',
      Cell: ({ ...props }) => (
        <ActionsCell
          editPath='/apps/class-management/class'
          id={props.data[props.row.index].id}
          callbackFunction={deleteActionCallback}
        />
      ),
    },
  ];

  const {
    data,
    isLoading,
    refetch,
  }: UseQueryResult<PaginatedResponse<Class>> = useQuery(
    ['class-list', page, pageSize, debouncedSearch, selectedClient, selectedSchool],
    () => getList(page, pageSize, '', 'asc', '', debouncedSearch, selectedClient, selectedSchool),
    {
      keepPreviousData: true,
    }
  );

  const deleteActionCallback = (id: ID) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const deleteCallback = async () => {
    setShowLoading(true);

    try {
      deleteItem(deleteId).then(() => {
        setShowLoading(false);
        setShowDeleteDialog(false);
        toast.success('Item excluído com sucesso');
        refetch();
      });
    } catch (error) {
      toast.error('Ocorreu um erro ao solicitar exclusão');
      setShowDeleteDialog(false);
      setShowLoading(false);
    }
  };

  const customFiltersContent = (
    <>
      {/* Indicador de filtros ativos */}
      {(selectedClient || selectedSchool) && (
        <div className='alert alert-primary d-flex align-items-center mb-5'>
          <span className='me-2'>
            <i className='bi bi-funnel-fill fs-3'></i>
          </span>
          <div className='flex-grow-1'>
            <strong>Filtros aplicados:</strong>
            {selectedClient && (
              <div className='text-muted fs-7'>
                Cliente: {clients.find(c => c.id === selectedClient)?.name}
              </div>
            )}
            {selectedSchool && (
              <div className='text-muted fs-7'>
                Escola: {schools.find(s => s.id === selectedSchool)?.name}
              </div>
            )}
          </div>
        </div>
      )}

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

      {/* Filtro por Escola */}
      <div className='mb-5'>
        <label className='form-label fs-6 fw-bold'>Escola:</label>
        <select
          className='form-select form-select-solid fw-bolder'
          value={selectedSchool}
          onChange={(e) => setSelectedSchool(e.target.value)}
          disabled={!selectedClient || isLoadingSchools}
        >
          <option value=''>
            {isLoadingSchools 
              ? 'Carregando...' 
              : !selectedClient 
                ? 'Selecione um cliente primeiro' 
                : 'Todas as escolas'}
          </option>
          {schools.map((school) => (
            <option key={school.id} value={school.id}>
              {school.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );

  const handleResetFilters = () => {
    setSelectedClient('');
    setSelectedSchool('');
    setPage(1);
    // Invalidar query para garantir que a lista seja recarregada
    queryClient.invalidateQueries(['class-list']);
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
  );
};

const ClassListWrapper = () => {
  return (
    <QueryRequestProvider>
      <QueryResponseProvider>
        <ClassListContent />
      </QueryResponseProvider>
    </QueryRequestProvider>
  )
}

export { ClassListWrapper };