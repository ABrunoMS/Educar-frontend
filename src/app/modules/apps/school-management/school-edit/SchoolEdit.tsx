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
          const schoolData: any = response.data; // Use any para facilitar acesso a props dinâmicas
          
          // --- LÓGICA CRÍTICA DA MAIN (Mantida) ---
          // Mapeamento Robusto: Garante que pegamos o ID mesmo se vier aninhado em objetos
          const mappedSchool: SchoolType = {
            ...schoolData,
            id: schoolData.id?.toString() || '',
            
            // Corrige problema do Cliente não vir
            clientId: schoolData.clientId?.toString() || schoolData.client?.id?.toString() || '',
            
            // Corrige problema do Endereço não vir
            addressId: schoolData.addressId?.toString() || schoolData.address?.id?.toString() || '',
            
            // Corrige problema da Regional não vir
            regionalId: schoolData.regionalId?.toString() || schoolData.regional?.id?.toString() || ''
          };
          
          setSchoolItem(mappedSchool);
        })
        .catch((error) => {
          console.error('Erro ao carregar escola:', error);
          toast.error('Erro ao carregar dados da escola');
        });
    }
  }, [id]);

  const handleFormSubmit = () => {
    navigate('/apps/school-management/schools');
  };

  return (
    <KTCard className='p-5 h-100'>
      {schoolItem ? (
        <SchoolCreateForm schoolItem={schoolItem} onFormSubmit={handleFormSubmit} />
      ) : (
        <div className='text-center'>
           <span className='indicator-progress'>
             Carregando... <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
           </span>
        </div>
      )}
    </KTCard>
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