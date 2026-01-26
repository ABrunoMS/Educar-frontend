import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getAccountsBySchool, getSchoolById } from '@services/Schools';
import { Account } from '@interfaces/Account';
import { Column } from 'react-table';
import { ListView } from '@components/list-view/ListView';
import { usePagination } from '@contexts/PaginationContext';
import { toast } from 'react-toastify';
import { KTIcon } from '@metronic/helpers';
import { AddUsersModal } from './AddUsersModal';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

interface SchoolUsersListProps {
  schoolId: string;
}

const SchoolUsersList: React.FC<SchoolUsersListProps> = ({ schoolId }) => {
  const { page, pageSize } = usePagination();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState<'Teacher' | 'Student' | null>(null);

  // Buscar dados da escola para obter o clientId
  const { data: schoolData } = useQuery(
    ['school-detail', schoolId],
    () => getSchoolById(schoolId),
    {
      enabled: !!schoolId,
    }
  );

  // Buscar usuários da escola
  const { data, isLoading, refetch } = useQuery(
    ['school-users', schoolId, page, pageSize],
    () => getAccountsBySchool(schoolId, page, pageSize, ''),
    {
      enabled: !!schoolId,
      keepPreviousData: true,
    }
  );

  // Mutation para remover usuário da escola
  const removeUserMutation = useMutation(
    (userId: string) => axios.delete(`${API_URL}/api/Schools/${schoolId}/accounts/${userId}`),
    {
      onSuccess: () => {
        toast.success('Usuário removido da escola com sucesso!');
        queryClient.invalidateQueries(['school-users', schoolId]);
        refetch();
      },
      onError: (error: any) => {
        toast.error(`Erro ao remover usuário: ${error.response?.data?.message || error.message}`);
      },
    }
  );

  const handleRemoveUser = (userId: string, userName: string) => {
    if (window.confirm(`Tem certeza que deseja remover ${userName} da escola?`)) {
      removeUserMutation.mutate(userId);
    }
  };

  const columns: Column<Account>[] = [
    {
      Header: 'Nome',
      id: 'fullName',
      Cell: ({ row }) => (
        <div className='d-flex align-items-center'>
          <div className='symbol symbol-circle symbol-40px overflow-hidden me-3'>
            <div className='symbol-label'>
              <div className='symbol-label fs-3 bg-light-primary text-primary'>
                {row.original.name?.charAt(0)?.toUpperCase()}
              </div>
            </div>
          </div>
          <div className='d-flex flex-column'>
            <span className='text-gray-800 fw-bold mb-1'>
              {row.original.name} {row.original.lastName}
            </span>
            <span className='text-muted fs-7'>{row.original.email}</span>
          </div>
        </div>
      ),
    },
    {
      Header: 'Role',
      id: 'role',
      Cell: ({ row }) => {
        const roleColors: Record<string, string> = {
          Admin: 'danger',
          Teacher: 'primary',
          Student: 'success',
        };
        const color = roleColors[row.original.role] || 'secondary';
        return (
          <span className={`badge badge-light-${color}`}>
            {row.original.role}
          </span>
        );
      },
    },
    {
      Header: 'Turmas',
      id: 'classes',
      Cell: ({ row }) => {
        // O backend retorna Classes como array de objetos, não classIds
        const userClasses = (row.original as any).Classes || 
                           (row.original as any).classes || 
                           [];
        
        if (userClasses.length === 0) {
          return <span className='text-muted fs-7'>Nenhuma turma</span>;
        }

        return (
          <div className='d-flex flex-wrap gap-1'>
            {userClasses.map((cls: any) => (
              <span 
                key={cls.id} 
                className='badge badge-light-info'
                title={cls.description || cls.name}
              >
                {cls.name}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      Header: 'Ações',
      id: 'actions',
      Cell: ({ row }) => (
        <button
          className='btn btn-icon btn-bg-light btn-active-color-danger btn-sm'
          onClick={() => handleRemoveUser(row.original.id || '', row.original.name)}
          title='Remover da escola'
          disabled={removeUserMutation.isLoading}
        >
          <KTIcon iconName='trash' className='fs-3' />
        </button>
      ),
    },
  ];

  return (
    <>
      <div className='card-body py-3'>
        {/* Header com botões de adicionar */}
        <div className='d-flex justify-content-between align-items-center mb-7'>
          <div>
            <h3 className='card-title fw-bold mb-1'>Usuários da Escola</h3>
            <span className='text-muted fs-7'>
              {data?.data?.payload?.pagination?.totalCount || 0} usuário(s) vinculado(s)
            </span>
          </div>
          <div className='d-flex gap-2'>
            <button
              className='btn btn-primary btn-sm'
              onClick={() => setShowAddModal('Teacher')}
            >
              <KTIcon iconName='plus' className='fs-3' />
              Adicionar Professores
            </button>
            <button
              className='btn btn-success btn-sm'
              onClick={() => setShowAddModal('Student')}
            >
              <KTIcon iconName='plus' className='fs-3' />
              Adicionar Alunos
            </button>
          </div>
        </div>

        {/* Nota explicativa */}
        <div className='alert alert-info mb-5'>
          <KTIcon iconName='information-2' className='fs-2 me-2' />
          <strong>Nota:</strong> Use os botões acima para adicionar professores ou alunos separadamente. 
          Apenas usuários do mesmo cliente da escola serão exibidos.
        </div>

        {/* Lista de usuários ou mensagem vazia */}
        {data?.data?.data && data.data.data.length > 0 ? (
          <ListView
            data={data.data.data}
            columns={columns}
            isLoading={isLoading}
            totalItems={data.data.payload?.pagination?.totalCount || 0}
          />
        ) : (
          <div className='card bg-light-info'>
            <div className='card-body text-center py-10'>
              <KTIcon iconName='people' className='fs-3x text-info mb-5' />
              <h4 className='text-gray-800 mb-3'>Nenhum usuário vinculado</h4>
              <p className='text-muted mb-5'>
                Adicione professores e alunos à escola usando os botões acima
              </p>
              <div className='d-flex gap-2 justify-content-center'>
                <button
                  className='btn btn-primary'
                  onClick={() => setShowAddModal('Teacher')}
                >
                  <KTIcon iconName='plus' className='fs-2' />
                  Adicionar Professores
                </button>
                <button
                  className='btn btn-success'
                  onClick={() => setShowAddModal('Student')}
                >
                  <KTIcon iconName='plus' className='fs-2' />
                  Adicionar Alunos
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de adicionar usuários */}
      {showAddModal && schoolData?.data?.clientId && (
        <AddUsersModal
          schoolId={schoolId}
          clientId={schoolData.data.clientId}
          roleType={showAddModal}
          onClose={() => setShowAddModal(null)}
        />
      )}
    </>
  );
};

export { SchoolUsersList };