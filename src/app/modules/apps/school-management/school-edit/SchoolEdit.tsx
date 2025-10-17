import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { KTCard } from '@metronic/helpers';
import { ToolbarWrapper } from '@metronic/layout/components/toolbar';
import { Content } from '@metronic/layout/components/content';
import { SchoolCreateForm } from '../school-create/components/SchoolCreateForm';
import { getSchoolById } from '@services/Schools';
import { toast } from 'react-toastify';
import { SchoolType } from '@interfaces/School';

const SchoolEdit = () => {
  const [schoolItem, setSchoolItem] = useState<SchoolType>();
  const navigate = useNavigate();

  const { id } = useParams();

  useEffect(() => {
    if (id) {
      console.log('Carregando escola com ID:', id);
      getSchoolById(id)
        .then((response) => {
          console.log('Dados recebidos do backend:', response.data);
          const schoolData = response.data;
          // Mapeia os dados do backend para o formato esperado pelo frontend
          const mappedSchool = {
            ...schoolData,
            id: schoolData.id?.toString() || '',
            clientId: schoolData.clientId?.toString() || '',
            addressId: schoolData.addressId?.toString() || ''
          };
          console.log('Dados mapeados para o frontend:', mappedSchool);
          setSchoolItem(mappedSchool);
        })
        .catch((error) => {
          console.error('Erro ao carregar escola:', error);
          toast.error(`Erro ao recuperar dados no servidor: ${error}`);
        });
    }
  }, [id]);

  const handleFormSubmit = () => {
    navigate('/apps/school-management/schools');
  };

  return (
    <>
      <KTCard className='p-5 h-100'>
        {schoolItem ? (
          <SchoolCreateForm schoolItem={schoolItem} onFormSubmit={handleFormSubmit} />
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

const SchoolEditWrapper = () => (
  <div>
    <ToolbarWrapper />
    <Content>
      <SchoolEdit />
    </Content>
  </div>
);

export { SchoolEditWrapper };