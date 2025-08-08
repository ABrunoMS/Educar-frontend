import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { KTCard } from '@metronic/helpers';
import { ToolbarWrapper } from '@metronic/layout/components/toolbar';
import { Content } from '@metronic/layout/components/content';
import { ProficiencyGroupCreateForm } from '../proficiency-group-create/components/ProficiencyGroupCreateForm';
import { getProficiencyGroupById } from '@services/ProficiencyGroups';
import { toast } from 'react-toastify';
import { ProficiencyGroup } from '@interfaces/Proficiency';

const ProficiencyGroupEdit = () => {
  const [proficiencyGroup, setProficiencyGroup] = useState<ProficiencyGroup>();

  const { id } = useParams();

  useEffect(() => {
    if (id) {
      getProficiencyGroupById(id)
        .then((response) => {
          setProficiencyGroup(response.data);
        })
        .catch((error) => {
          toast.error(`Erro ao recuperar dados no servidor: ${error}`);
        });
    }
  }, []);

  return (
    <>
      <KTCard className='p-5 h-100'>
        {proficiencyGroup ? (
          <ProficiencyGroupCreateForm proficiencyGroup={proficiencyGroup} editMode />
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

const ProficiencyGroupEditWrapper = () => (
  <div>
    <ToolbarWrapper />
    <Content>
      <ProficiencyGroupEdit />
    </Content>
  </div>
);

export { ProficiencyGroupEditWrapper };