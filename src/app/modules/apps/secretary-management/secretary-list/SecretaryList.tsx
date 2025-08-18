import { ListView } from '@components/list-view/ListView';
import { useQuery, UseQueryResult } from 'react-query';
import { Column } from 'react-table';
import { getList, Secretary } from './core/_requests';
import { usePagination } from '@contexts/PaginationContext';

// Defina as colunas da tabela de secretarias
const columns: Column<Secretary>[] = [
  { Header: 'Nome', accessor: 'name' },
  { Header: 'Descrição', accessor: 'description' },
  { Header: 'Código', accessor: 'code' },
  { Header: 'Status', accessor: 'isActive' },
];

const SecretaryListWrapper = () => {
  // Use o hook de paginação para obter os parâmetros da URL
  const { page, pageSize, sortBy, sortOrder, filter, search } = usePagination();

  // Use useQuery para buscar os dados da API
  const { data, isLoading }: UseQueryResult<any> = useQuery(
    ['secretary-list', page, sortBy, sortOrder, filter, search],
    () => getList(page, pageSize, sortBy, sortOrder, filter, search),
    {
      keepPreviousData: true,
      retry: false, // Não tentar novamente se a API não existir
      onError: (error) => {
        console.error('Erro ao carregar secretarias:', error);
      }
    }
  );

  return (
    <ListView
      data={data?.items || []}
      columns={columns}
      isLoading={isLoading}
      totalItems={data?.totalCount || 0}
      // Você pode adicionar aqui as props para edição, exclusão e criação
      // Ex: onEdit={handleEdit} onDelete={handleDelete}
    />
  );
};

export { SecretaryListWrapper };
