import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { KTCard } from '@metronic/helpers';
import { ToolbarWrapper } from '@metronic/layout/components/toolbar';
import { Content } from '@metronic/layout/components/content';
import { ClassCreateForm } from '../class-create/components/ClassCreateForm';
import { getClassById } from '@services/Classes';
import { toast } from 'react-toastify';
import { Class } from '@interfaces/Class';

const ClassEdit = () => {
  const [classItem, setClassItem] = useState<Class>();

  const { id } = useParams();

  useEffect(() => {
    if (id) {
      getClassById(id)
        .then((response) => {
          setClassItem(response.data);
        })
        .catch((error) => {
          toast.error(`Erro ao recuperar dados no servidor: ${error}`);
        });
    }
  }, []);

  return (
    <>
      <KTCard className='p-5 h-100'>
        {classItem ? (
          <ClassCreateForm classItem={classItem} editMode />
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