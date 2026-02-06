import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { KTCard } from '@metronic/helpers';
import { ToolbarWrapper } from '@metronic/layout/components/toolbar';
import { Content } from '@metronic/layout/components/content';
import { ClassCreateForm } from '../class-create/components/ClassCreateForm';
import { ClassQuestsList } from '../class-list/ClassQuestsList';
import { ClassStudentReport } from '../class-report/ClassStudentReport';
import { getClassById } from '@services/Classes';
import { toast } from 'react-toastify';
import { Class } from '@interfaces/Class';
import clsx from 'clsx';
import { useRole } from '@contexts/RoleContext';

const ClassEdit = () => {
  const [classItem, setClassItem] = useState<Class>();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isReadOnly } = useRole();

  const { id } = useParams();

  useEffect(() => {
    if (id) {
      console.log('Carregando turma com ID:', id);
      setIsLoading(true);
      getClassById(id)
        .then((response) => {
          console.log('Dados recebidos do backend:', response.data);
          const classData = response.data;
          // Mapeia os dados do backend para o formato esperado pelo frontend
          const mappedClass = {
            ...classData,
            teacherIds: classData.teacherIds?.map((id: any) => id.toString()) || [],
            studentIds: classData.studentIds?.map((id: any) => id.toString()) || [],
            accountIds: classData.accountIds?.map((id: any) => id.toString()) || [],
            schoolId: classData.schoolId?.toString() || '',
            isActive: classData.isActive ?? true
          };
          console.log('Dados mapeados para o frontend:', mappedClass);
          setClassItem(mappedClass);
        })
        .catch((error) => {
          console.error('Erro ao carregar turma:', error);
          toast.error(`Erro ao recuperar dados no servidor: ${error}`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id]);

  const handleFormSubmit = () => {
    navigate('/apps/class-management/classes');
  };

  if (isLoading) {
    return (
      <KTCard className='p-5 h-100 d-flex justify-content-center align-items-center'>
        Carregando dados da turma...
        <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
      </KTCard>
    );
  }

  return (
    <KTCard className='h-100'>
      {/* Estrutura de Abas */}
      <ul
        className='nav nav-tabs nav-line-tabs nav-line-tabs-2x border-b-0 fs-6 px-9 pt-7'
        role='tablist'
      >
        {/* Aba 1: Formulário */}
        <li className='nav-item' role='presentation'>
          <a
            className='nav-link active'
            data-bs-toggle='tab'
            href='#kt_tab_pane_class_form'
            aria-selected='true'
            role='tab'
          >
            Dados da Turma
          </a>
        </li>

        {/* Aba 2: Aulas */}
        <li className='nav-item' role='presentation'>
          <a
            className={clsx('nav-link', { disabled: !classItem })}
            data-bs-toggle={classItem ? 'tab' : ''}
            href='#kt_tab_pane_class_quests'
            aria-selected='false'
            role='tab'
            title={!classItem ? 'Salve a turma para poder adicionar aulas' : 'Gerenciar Aulas'}
          >
            Aulas da Turma
          </a>
        </li>

        {/* Aba 3: Relatório de Alunos */}
        <li className='nav-item' role='presentation'>
          <a
            className={clsx('nav-link', { disabled: !classItem })}
            data-bs-toggle={classItem ? 'tab' : ''}
            href='#kt_tab_pane_class_report'
            aria-selected='false'
            role='tab'
            title={!classItem ? 'Salve a turma para ver o relatório' : 'Relatório de alunos'}
          >
            Relatório de Alunos
          </a>
        </li>
      </ul>

      {/* Conteúdo das Abas */}
      <div className='tab-content' id='myTabContent'>
        {/* Conteúdo Aba 1: Formulário */}
        <div
          className='tab-pane fade show active'
          id='kt_tab_pane_class_form'
          role='tabpanel'
        >
          <div className='p-9'>
            {classItem ? (
              <ClassCreateForm classItem={classItem} onFormSubmit={handleFormSubmit} readOnly={isReadOnly()} />
            ) : (
              <div className='text-center'>
                <span className='indicator-progress'>
                  Carregando...{' '}
                  <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo Aba 2: Aulas */}
        <div className='tab-pane fade' id='kt_tab_pane_class_quests' role='tabpanel'>
          {classItem && classItem.id ? (
            <ClassQuestsList classId={classItem.id} />
          ) : (
            <div className='p-9 text-center text-muted'>
              <p className='fs-5'>
                Salve a turma primeiro para poder gerenciar as aulas.
              </p>
            </div>
          )}
        </div>

        {/* Conteúdo Aba 3: Relatório de Alunos */}
        <div className='tab-pane fade' id='kt_tab_pane_class_report' role='tabpanel'>
          {classItem && classItem.id ? (
            <ClassStudentReport classId={classItem.id} />
          ) : (
            <div className='p-9 text-center text-muted'>
              <p className='fs-5'>
                Salve a turma primeiro para ver o relatório de alunos.
              </p>
            </div>
          )}
        </div>
      </div>
    </KTCard>
  );
};

const ClassEditWrapper = () => (
  <div>
    <ToolbarWrapper />
    <Content>
      <ClassEdit />
    </Content>
  </div>
);

export { ClassEditWrapper };