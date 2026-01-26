import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { getClassesBySchool } from '@services/Classes';
import { getAccountById } from '@services/Accounts';
import { Class } from '@interfaces/Class';
import { Account } from '@interfaces/Account';
import { usePagination } from '@contexts/PaginationContext';
import { KTIcon } from '@metronic/helpers';
import { ListView } from '@components/list-view/ListView';
import { Column } from 'react-table';
import { useNavigate } from 'react-router-dom';

interface SchoolClassesListProps {
  schoolId: string;
}

const SchoolClassesList: React.FC<SchoolClassesListProps> = ({ schoolId }) => {
  const { page, pageSize } = usePagination();
  const navigate = useNavigate();
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);

  // Buscar turmas da escola
  const { data, isLoading } = useQuery(
    ['school-classes', schoolId, page, pageSize],
    () => getClassesBySchool(schoolId, page, pageSize),
    {
      enabled: !!schoolId,
      keepPreviousData: true,
    }
  );

  const toggleExpanded = (classId: string) => {
    setExpandedClassId(expandedClassId === classId ? null : classId);
  };

  const columns: Column<Class>[] = [
    {
      Header: 'Nome',
      accessor: 'name',
      Cell: ({ row }) => (
        <div className='d-flex align-items-center'>
          <div className='symbol symbol-circle symbol-40px overflow-hidden me-3'>
            <div className='symbol-label fs-3 bg-light-info text-info'>
              <KTIcon iconName='book' className='fs-2' />
            </div>
          </div>
          <div className='d-flex flex-column'>
            <span className='text-gray-800 fw-bold mb-1'>{row.original.name}</span>
            {row.original.description && (
              <span className='text-muted fs-7'>{row.original.description}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      Header: 'Ano Letivo',
      accessor: 'schoolYear',
      Cell: ({ value }) => (
        <span className='badge badge-light-primary'>{value || '-'}</span>
      ),
    },
    {
      Header: 'Turno',
      accessor: 'schoolShift',
      Cell: ({ value }) => {
        const shiftLabels: Record<string, string> = {
          morning: 'Manhã',
          afternoon: 'Tarde',
          night: 'Noite',
        };
        const shiftColors: Record<string, string> = {
          morning: 'warning',
          afternoon: 'info',
          night: 'dark',
        };
        const label = shiftLabels[value] || '-';
        const color = shiftColors[value] || 'secondary';
        return <span className={`badge badge-light-${color}`}>{label}</span>;
      },
    },
    {
      Header: 'Status',
      accessor: 'isActive',
      Cell: ({ value }) => (
        <span className={`badge badge-light-${value ? 'success' : 'danger'}`}>
          {value ? 'Ativa' : 'Inativa'}
        </span>
      ),
    },
    {
      Header: 'Usuários',
      id: 'users',
      Cell: ({ row }) => {
        const teachersCount = row.original.teacherIds?.length || 0;
        const studentsCount = row.original.studentIds?.length || 0;
        const totalUsers = teachersCount + studentsCount;

        return (
          <div className='d-flex align-items-center'>
            <button
              className='btn btn-sm btn-light-primary'
              onClick={() => toggleExpanded(row.original.id)}
            >
              <KTIcon iconName='people' className='fs-3 me-1' />
              {totalUsers} usuário(s)
              <KTIcon 
                iconName={expandedClassId === row.original.id ? 'up' : 'down'} 
                className='fs-3 ms-1' 
              />
            </button>
          </div>
        );
      },
    },
    {
      Header: 'Ações',
      id: 'actions',
      Cell: ({ row }) => (
        <button
          className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm'
          onClick={() => navigate(`/apps/class-management/class/${row.original.id}`)}
          title='Ver detalhes da turma'
        >
          <KTIcon iconName='eye' className='fs-3' />
        </button>
      ),
    },
  ];

  // Função para buscar usuários de uma turma específica
  const ClassUsersDetail: React.FC<{ classItem: Class }> = ({ classItem }) => {
    const [usersData, setUsersData] = useState<(Account & { userRole: string })[]>([]);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
      const fetchUsers = async () => {
        if (!classItem.id) return;
        
        setLoading(true);
        try {
          const teacherIds = classItem.teacherIds || [];
          const studentIds = classItem.studentIds || [];
          const allUserIds = [...teacherIds, ...studentIds];

          if (allUserIds.length === 0) {
            setUsersData([]);
            setLoading(false);
            return;
          }

          // Buscar dados de todos os usuários usando o serviço
          const userPromises = allUserIds.map(async (userId) => {
            try {
              const userData = await getAccountById(userId);
              return {
                ...userData,
                userRole: teacherIds.includes(userId) ? 'Professor' : 'Aluno',
              };
            } catch (error) {
              console.error(`Erro ao buscar usuário ${userId}:`, error);
              return null;
            }
          });

          const users = await Promise.all(userPromises);
          setUsersData(users.filter((u): u is (Account & { userRole: string }) => u !== null));
        } catch (error) {
          console.error('Erro ao buscar usuários da turma:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchUsers();
    }, [classItem]);

    if (loading) {
      return (
        <div className='text-center py-5'>
          <span className='spinner-border spinner-border-sm'></span>
          <span className='ms-2'>Carregando usuários...</span>
        </div>
      );
    }

    if (usersData.length === 0) {
      return (
        <div className='alert alert-light-info'>
          <KTIcon iconName='information-2' className='fs-2 me-2' />
          Nenhum usuário vinculado a esta turma
        </div>
      );
    }

    return (
      <div className='table-responsive'>
        <table className='table table-row-bordered table-row-gray-100 align-middle gs-0 gy-3'>
          <thead>
            <tr className='fw-bold text-muted'>
              <th className='min-w-200px'>Nome</th>
              <th className='min-w-120px'>Email</th>
              <th className='min-w-100px'>Tipo</th>
            </tr>
          </thead>
          <tbody>
            {usersData.map((user, index) => (
              <tr key={user.id || index}>
                <td>
                  <div className='d-flex align-items-center'>
                    <div className='symbol symbol-circle symbol-30px overflow-hidden me-3'>
                      <div className={`symbol-label fs-6 bg-light-${user.userRole === 'Professor' ? 'primary' : 'success'} text-${user.userRole === 'Professor' ? 'primary' : 'success'}`}>
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>
                    </div>
                    <span className='text-gray-800 fw-semibold'>
                      {user.name} {user.lastName}
                    </span>
                  </div>
                </td>
                <td>
                  <span className='text-muted'>{user.email || '-'}</span>
                </td>
                <td>
                  <span
                    className={`badge badge-light-${
                      user.userRole === 'Professor' ? 'primary' : 'success'
                    }`}
                  >
                    {user.userRole}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <div className='card-body py-3'>
        {/* Header */}
        <div className='d-flex justify-content-between align-items-center mb-7'>
          <div>
            <h3 className='card-title fw-bold mb-1'>Turmas da Escola</h3>
            <span className='text-muted fs-7'>
              {data?.data?.payload?.pagination?.totalCount || 0} turma(s) vinculada(s)
            </span>
          </div>
          <button
            className='btn btn-primary btn-sm'
            onClick={() => navigate(`/apps/class-management/create?schoolId=${schoolId}`)}
          >
            <KTIcon iconName='plus' className='fs-3' />
            Nova Turma
          </button>
        </div>

        {/* Nota explicativa */}
        <div className='alert alert-info mb-5'>
          <KTIcon iconName='information-2' className='fs-2 me-2' />
          <strong>Nota:</strong> Aqui você visualiza todas as turmas vinculadas a esta escola. 
          Clique em "Usuários" para ver professores e alunos de cada turma.
        </div>

        {/* Lista de turmas */}
        {data?.data?.data && data.data.data.length > 0 ? (
          <>
            <ListView
              data={data.data.data}
              columns={columns}
              isLoading={isLoading}
              totalItems={data.data.payload?.pagination?.totalCount || 0}
            />

            {/* Detalhes expandidos dos usuários da turma */}
            {expandedClassId && (
              <div className='card mt-5 shadow-sm'>
                <div className='card-header'>
                  <h3 className='card-title'>
                    <KTIcon iconName='people' className='fs-2 me-2' />
                    Usuários da turma{' '}
                    {data.data.data.find((c) => c.id === expandedClassId)?.name}
                  </h3>
                  <div className='card-toolbar'>
                    <button
                      className='btn btn-sm btn-light-danger'
                      onClick={() => setExpandedClassId(null)}
                    >
                      <KTIcon iconName='cross' className='fs-3' />
                      Fechar
                    </button>
                  </div>
                </div>
                <div className='card-body'>
                  <ClassUsersDetail
                    classItem={data.data.data.find((c) => c.id === expandedClassId)!}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className='card bg-light-info'>
            <div className='card-body text-center py-10'>
              <KTIcon iconName='book' className='fs-3x text-info mb-5' />
              <h4 className='text-gray-800 mb-3'>Nenhuma turma vinculada</h4>
              <p className='text-muted mb-5'>
                Esta escola ainda não possui turmas cadastradas. Crie a primeira turma agora!
              </p>
              <button
                className='btn btn-primary'
                onClick={() => navigate(`/apps/class-management/create?schoolId=${schoolId}`)}
              >
                <KTIcon iconName='plus' className='fs-2' />
                Criar Primeira Turma
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export { SchoolClassesList };
