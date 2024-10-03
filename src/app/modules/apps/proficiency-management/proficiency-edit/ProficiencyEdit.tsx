import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { KTCard } from '@metronic/helpers';
import { ToolbarWrapper } from '@metronic/layout/components/toolbar';
import { Content } from '@metronic/layout/components/content';
import { ProficiencyCreateForm } from '../proficiency-create/components/ProficiencyCreateForm';
import { getProficiencyById } from '@services/Proficiencies';
import { toast } from 'react-toastify';
import { Proficiency } from '@interfaces/Proficiency';

const ProficiencyEdit = () => {
  const [proficiency, setProficiency] = useState<Proficiency>();

  const { id } = useParams();

  useEffect(() => {
    if (id) {
      getProficiencyById(id)
        .then((response) => {
          setProficiency(response.data);
        })
        .catch((error) => {
          toast.error(`Erro ao recuperar dados no servidor: ${error}`);
        });
    }
  }, []);

  return (
    <>
      <KTCard className='p-5 h-100'>
        {proficiency ? (
          <ProficiencyCreateForm proficiency={proficiency} editMode />
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

const ProficiencyEditWrapper = () => (
  <div>
    <ToolbarWrapper />
    <Content>
      <ProficiencyEdit />
    </Content>
  </div>
);

export { ProficiencyEditWrapper };