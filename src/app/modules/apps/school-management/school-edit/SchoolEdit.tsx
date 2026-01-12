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
      getSchoolById(id)
        .then((response) => {
          const schoolData = response.data;
          const mappedSchool = {
            ...schoolData,
            id: schoolData.id?.toString() || '',
            clientId: schoolData.clientId?.toString() || '',
            addressId: schoolData.addressId?.toString() || '',
            regionalId: schoolData.regionalId?.toString() || ''
          };
          setSchoolItem(mappedSchool);
        })
        .catch((error) => {
          toast.error(`Erro ao recuperar dados no servidor: ${error}`);
        });
    }
  }, [id]);

  const handleFormSubmit = () => {
    navigate('/apps/school-management/schools');
  };

  return (
    <>
      <KTCard className='h-100'>
        <div className='p-9'>
          {schoolItem ? (
            <SchoolCreateForm schoolItem={schoolItem} onFormSubmit={handleFormSubmit} />
          ) : (
            <div className='text-center'>
              <span className='indicator-progress'>
                Carregando...{' '}
                <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
              </span>
            </div>
          )}
        </div>
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