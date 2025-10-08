import { ListView } from '@components/list-view/ListView';
import { useQuery, useQueryClient, UseQueryResult } from 'react-query';
import { Column } from 'react-table';
import { deleteItem, getList } from './core/_requests';
import { PaginatedResponse, usePagination } from '@contexts/PaginationContext';
import { Class } from '@interfaces/Class';
import { ActionsCell } from '@components/list-view/table/columns/ActionsCell';
import { useState } from 'react';
import { ID } from '@metronic/helpers';
import DeleteDialog from '@components/delete-dialog/DeleteDialog';
import { toast } from 'react-toastify';

const ClassListWrapper = () => {
  const [deleteId, setDeleteId] = useState<ID>();
  const [showLoading, setShowLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const queryClient = useQueryClient();
  const { page, pageSize, sortBy, sortOrder, filter, search } = usePagination();
  const {
    data,
    isLoading,
    refetch,
  }: UseQueryResult<PaginatedResponse<Class>> = useQuery(
    ['class-list', page, sortBy, sortOrder, filter, search],
    () => getList(page, pageSize, sortBy, sortOrder, filter, search),
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

  return (
    <>
      <ListView
        data={data?.data|| []}
        columns={columns}
        isLoading={isLoading}
        totalItems={data?.payload?.pagination?.totalCount || 1}
      />
      <DeleteDialog
        open={showDeleteDialog}
        loading={showLoading}
        closeCallback={() => setShowDeleteDialog(false)}
        actionCallback={deleteCallback}
      />
    </>
  );
};

export { ClassListWrapper };