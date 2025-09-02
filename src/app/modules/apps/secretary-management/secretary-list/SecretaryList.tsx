import { ListView } from '@components/list-view/ListView';
import { useQuery, UseQueryResult } from 'react-query';
import { Column } from 'react-table';
import { getList } from './core/_requests';
import { Secretary } from '@interfaces/Secretary';
import { usePagination } from '@contexts/PaginationContext';

const columns: Column<Secretary>[] = [
  { Header: 'Nome', accessor: 'name' },
  { Header: 'Descrição', accessor: 'description' },
  { Header: 'Código', accessor: 'code' },
  { Header: 'Status', accessor: 'isActive' },
];

const SecretaryListWrapper = () => {
  
  const { page, pageSize, sortBy, sortOrder, filter, search } = usePagination();

  const { data, isLoading }: UseQueryResult<any> = useQuery(
    ['secretary-list', page, sortBy, sortOrder, filter, search],
    () => getList(page, pageSize, sortBy, sortOrder, filter, search),
    {
      keepPreviousData: true,
      retry: false,
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
     
    />
  );
};

export { SecretaryListWrapper };
