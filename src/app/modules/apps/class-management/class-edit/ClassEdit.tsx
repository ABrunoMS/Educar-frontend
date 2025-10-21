import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { KTCard } from '@metronic/helpers';
import { ToolbarWrapper } from '@metronic/layout/components/toolbar';
import { Content } from '@metronic/layout/components/content';
import { ClassCreateForm } from '../class-create/components/ClassCreateForm';
import { getClassById } from '@services/Classes';
import { toast } from 'react-toastify';
import { Class } from '@interfaces/Class';

const ClassEdit = () => {
  const [classItem, setClassItem] = useState<Class>();
  const navigate = useNavigate();

  const { id } = useParams();

  useEffect(() => {
    if (id) {
      console.log('Carregando turma com ID:', id);
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
            isActive: classData.isActive ?? true,
            content: classData.content || []
          };
          console.log('Dados mapeados para o frontend:', mappedClass);
          setClassItem(mappedClass);
        })
        .catch((error) => {
          console.error('Erro ao carregar turma:', error);
          toast.error(`Erro ao recuperar dados no servidor: ${error}`);
        });
    }
  }, [id]);

  const handleFormSubmit = () => {
    navigate('/apps/class-management/classes');
  };

  return (
    <>
      <KTCard className='p-5 h-100'>
        {classItem ? (
          <ClassCreateForm classItem={classItem} onFormSubmit={handleFormSubmit} />
        ) : (
          <div>
            <span className='indicator-progress'>
              Carregando...{' '}
              <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
            </span>
          </div>
        )}
      </KTCard>
    </>
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