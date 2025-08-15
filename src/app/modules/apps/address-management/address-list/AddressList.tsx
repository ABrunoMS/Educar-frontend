import { ListView } from '@components/list-view/ListView';
import { useQuery, UseQueryResult } from 'react-query';
import { Column } from 'react-table';
import { getList, AddressesQueryResponse, AddressType } from './core/_requests';
import { usePagination } from '@contexts/PaginationContext';

// Defina as colunas da sua tabela de endereços usando a interface AddressType
const columns: Column<AddressType>[] = [
  { Header: 'Rua', accessor: 'street' },
  { Header: 'Cidade', accessor: 'city' },
  { Header: 'Estado', accessor: 'state' },
  { Header: 'CEP', accessor: 'postalCode' }, // Mudado para 'postalCode' de acordo com sua interface
  { Header: 'País', accessor: 'country' },
];

const AddressListWrapper = () => {
  // Use o hook de paginação para obter os parâmetros da URL
  const { page, pageSize, sortBy, sortOrder, filter, search } = usePagination();

  // Use useQuery para buscar os dados da API
  const { data, isLoading }: UseQueryResult<AddressesQueryResponse> = useQuery(
    ['address-list', page, sortBy, sortOrder, filter, search],
    () => getList(page, pageSize, sortBy, sortOrder, filter, search),
    {
      keepPreviousData: true,
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

export { AddressListWrapper };