import { ListView } from '@components/list-view/ListView';
import { useQuery, useQueryClient, UseQueryResult } from 'react-query';
import { Column } from 'react-table';
import { deleteItem, getList } from './core/_requests';
import { PaginatedResponse, usePagination } from '@contexts/PaginationContext';
import { Grade } from '@interfaces/Grade';
import { ActionsCell } from '@components/list-view/table/columns/ActionsCell';
import { useState } from 'react';
import { ID } from '@metronic/helpers';
import DeleteDialog from '@components/delete-dialog/DeleteDialog';
import { toast } from 'react-toastify';

const GradeListWrapper = () => {
  const [deleteId, setDeleteId] = useState<ID>();
  const [showLoading, setShowLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const columns: Column<Grade>[] = [
    {
      Header: 'Nome',
      accessor: 'name',
    },
    {
      Header: 'Descrição',
      accessor: 'description',
    },
    {
      Header: '',
      id: 'actions',
      Cell: ({ ...props }) => (
        <ActionsCell
          editPath='/apps/grade-management/grade'
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
  }: UseQueryResult<PaginatedResponse<Grade>> = useQuery(
    ['grade-list', page, sortBy, sortOrder, filter, search],
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
        data={data?.items || []}
        columns={columns}
        isLoading={isLoading}
        totalItems={data?.totalPages || 1}
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

export { GradeListWrapper };