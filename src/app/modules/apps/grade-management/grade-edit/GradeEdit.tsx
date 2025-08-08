import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { KTCard } from '@metronic/helpers';
import { ToolbarWrapper } from '@metronic/layout/components/toolbar';
import { Content } from '@metronic/layout/components/content';
import { GradeCreateForm } from '../grade-create/components/GradeCreateForm';
import { getGradeById } from '@services/Grades';
import { toast } from 'react-toastify';
import { Grade } from '@interfaces/Grade';

const GradeEdit = () => {
  const [grade, setGrade] = useState<Grade>();

  const { id } = useParams();

  useEffect(() => {
    if (id) {
      getGradeById(id)
        .then((response) => {
          setGrade(response.data);
        })
        .catch((error) => {
          toast.error(`Erro ao recuperar dados no servidor: ${error}`);
        });
    }
  }, []);

  return (
    <>
      <KTCard className='p-5 h-100'>
        {grade ? (
          <GradeCreateForm grade={grade} editMode />
        ) : (
          <div className='d-flex justify-content-center'>
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

const GradeEditWrapper = () => (
  <div>
    <ToolbarWrapper />
    <Content>
      <GradeEdit />
    </Content>
  </div>
);

export { GradeEditWrapper };