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
  readOnly?: boolean;
}

const SchoolUsersList: React.FC<SchoolUsersListProps> = ({ schoolId, readOnly = false }) => {
  const { page, pageSize } = usePagination();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState<'Teacher' | 'Student' | null>(null);

  const { data: schoolData } = useQuery(['school-detail', schoolId], () => getSchoolById(schoolId), { enabled: !!schoolId });
  const { data, isLoading, refetch } = useQuery(['school-users', schoolId, page, pageSize], () => getAccountsBySchool(schoolId, page, pageSize, ''), { enabled: !!schoolId, keepPreviousData: true });

  const removeUserMutation = useMutation((userId: string) => axios.delete(`${API_URL}/api/Schools/${schoolId}/accounts/${userId}`), {
    onSuccess: () => { toast.success('Usuário removido da escola com sucesso!'); queryClient.invalidateQueries(['school-users', schoolId]); refetch(); },
    onError: (error: any) => { toast.error(`Erro ao remover usuário: ${error.response?.data?.message || error.message}`); }
  });

  const handleRemoveUser = (userId: string, userName: string) => {
    if (window.confirm(`Tem certeza que deseja remover ${userName} da escola?`)) removeUserMutation.mutate(userId);
  };

  const groupColumns: Column<Account>[] = [
    {
      Header: 'Nome',
      id: 'fullName',
      Cell: ({ row }) => (
        <div className='d-flex align-items-center'>
          <div className='symbol symbol-circle symbol-40px overflow-hidden me-3'>
            <div className='symbol-label'>
              <div className='symbol-label fs-3 bg-light-primary text-primary'>{row.original.name?.charAt(0)?.toUpperCase()}</div>
            </div>
          </div>
          <div className='d-flex flex-column'>
            <span className='text-gray-800 fw-bold mb-1'>{row.original.name} {row.original.lastName}</span>
            <span className='text-muted fs-7'>{row.original.email}</span>
          </div>
        </div>
      )
    },
    {
      Header: 'Turmas',
      id: 'classes',
      Cell: ({ row }) => {
        const userClasses = (row.original as any).Classes || (row.original as any).classes || [];
        if (!userClasses.length) return <span className='text-muted fs-7'>Nenhuma turma</span>;
        return <div className='d-flex flex-wrap gap-1'>{userClasses.map((c: any) => <span key={c.id} className='badge badge-light' title={c.description || c.name}>{c.name}</span>)}</div>;
      }
    },
    ...(!readOnly ? [{
      Header: 'Ações',
      id: 'actions',
      Cell: ({ row }: any) => (
        <button className='btn btn-icon btn-bg-light btn-active-color-danger btn-sm' onClick={() => handleRemoveUser(row.original.id || '', row.original.name)} disabled={removeUserMutation.isLoading} title='Remover da escola'>
          <KTIcon iconName='trash' className='fs-3' />
        </button>
      )
    }] : [])
  ];

  const usersAll: Account[] = data?.data?.data || [];
  const teachers = usersAll.filter(u => u.role === 'Teacher');
  const students = usersAll.filter(u => u.role === 'Student');
  const admins = usersAll.filter(u => u.role === 'Admin');

  return (
    <>
      <div className='card-body py-3'>
        <div className='d-flex justify-content-between align-items-center mb-7'>
          <div>
            <h3 className='card-title fw-bold mb-1'>Usuários da Escola</h3>
            <span className='text-muted fs-7'>{data?.data?.payload?.pagination?.totalCount || 0} usuário(s) vinculado(s)</span>
          </div>
          {!readOnly && (
            <div className='d-flex gap-2'>
              <button className='btn btn-outline-primary btn-sm' onClick={() => setShowAddModal('Teacher')}><KTIcon iconName='plus' className='fs-3' /> Adicionar Professores</button>
              <button className='btn btn-outline-secondary btn-sm' onClick={() => setShowAddModal('Student')}><KTIcon iconName='plus' className='fs-3' /> Adicionar Alunos</button>
            </div>
          )}
        </div>

        {readOnly && (
          <div className='alert alert-info mb-5'>
            <i className='fas fa-info-circle me-2'></i>
            Você está visualizando os usuários em modo somente leitura.
          </div>
        )}

        {!readOnly && (
          <div className='alert alert-secondary mb-5 d-flex align-items-start gap-3'>
            <KTIcon iconName='information-2' className='fs-2 text-muted' />
            <div><strong>Nota:</strong> Use os botões acima para adicionar professores ou alunos separadamente. Apenas usuários do mesmo cliente da escola serão exibidos.</div>
          </div>
        )}

        {usersAll && usersAll.length > 0 ? (
          <>
            {teachers.length > 0 && (<div className='mb-6'><h4 className='fw-semibold mb-3'>Professores</h4><ListView data={teachers} columns={groupColumns as any} isLoading={isLoading} totalItems={teachers.length} /></div>)}
            {students.length > 0 && (<div className='mb-6'><h4 className='fw-semibold mb-3'>Alunos</h4><ListView data={students} columns={groupColumns as any} isLoading={isLoading} totalItems={students.length} /></div>)}
            {admins.length > 0 && (<div className='mb-6'><h4 className='fw-semibold mb-3'>Administradores</h4><ListView data={admins} columns={groupColumns as any} isLoading={isLoading} totalItems={admins.length} /></div>)}
          </>
        ) : (
          <div className='card bg-light'>
            <div className='card-body text-center py-10'>
              <KTIcon iconName='people' className='fs-3x text-muted mb-5' />
              <h4 className='text-gray-800 mb-3'>Nenhum usuário vinculado</h4>
              {!readOnly ? (
                <>
                  <p className='text-muted mb-5'>Adicione professores e alunos à escola usando os botões acima</p>
                  <div className='d-flex gap-2 justify-content-center'>
                    <button className='btn btn-outline-primary' onClick={() => setShowAddModal('Teacher')}><KTIcon iconName='plus' className='fs-2' /> Adicionar Professores</button>
                    <button className='btn btn-outline-secondary' onClick={() => setShowAddModal('Student')}><KTIcon iconName='plus' className='fs-2' /> Adicionar Alunos</button>
                  </div>
                </>
              ) : (
                <p className='text-muted mb-0'>Esta escola não possui usuários vinculados.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {!readOnly && showAddModal && schoolData?.data?.clientId && (
        <AddUsersModal schoolId={schoolId} clientId={schoolData.data.clientId} roleType={showAddModal} onClose={() => setShowAddModal(null)} />
      )}
    </>
  );
};

export { SchoolUsersList };
