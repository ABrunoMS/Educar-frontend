import { ListView } from '@components/list-view/ListView'
import { SchoolType } from '@interfaces/School'
import { useMutation, useQuery, UseQueryResult } from 'react-query'
import { Column } from 'react-table'
import { deleteSchool, getList } from './core/_requests'
import { PaginatedResponse, usePagination } from '@contexts/PaginationContext'
import { ActionsCell } from '@components/list-view/table/columns/ActionsCell'
import { useState } from 'react'
import { ID } from '@metronic/helpers'
import DeleteDialog from '@components/delete-dialog/DeleteDialog'
import { toast } from 'react-toastify'

const SchoolListWrapper = () => {
  const [deleteId, setDeleteId] = useState<ID>();
  const [showLoading, setShowLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const columns: Column<SchoolType>[] = [
    { Header: 'Nome', accessor: 'name' },
    { Header: 'Descrição', accessor: 'description' },
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
        />
      ),
    },
  ]

  const {page, pageSize, sortBy, sortOrder, filter, search} = usePagination()
  const {data, isLoading, refetch}: UseQueryResult<PaginatedResponse<SchoolType>> = useQuery(
    ['school-list', page, sortBy, sortOrder, filter, search],
    () => getList(page, pageSize, sortBy, sortOrder, filter, search),
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

  return (
    <>
      <ListView 
        data={data?.data || []}
        columns={columns}
        isLoading={isLoading}
        totalItems={data?.payload.pagination.totalCount || 0}
      />
      <DeleteDialog
        open={showDeleteDialog}
        loading={showLoading}
        closeCallback={() => setShowDeleteDialog(false)}
        actionCallback={deleteCallback}
      />
    </>
  )
}

export {SchoolListWrapper}
