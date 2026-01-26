import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { KTCard } from '@metronic/helpers';
import { ToolbarWrapper } from '@metronic/layout/components/toolbar';
import { Content } from '@metronic/layout/components/content';
import { SchoolCreateForm } from '../school-create/components/SchoolCreateForm';
import { getSchoolById } from '@services/Schools';
import { toast } from 'react-toastify';
import { SchoolType } from '@interfaces/School';
import { SchoolUsersList } from '../school-list/SchoolUsersList';
import { SchoolClassesList } from '../school-list/SchoolClassesList';
import clsx from 'clsx';

const SchoolEdit = () => {
  const [schoolItem, setSchoolItem] = useState<SchoolType>();
  const [activeTab, setActiveTab] = useState<'info' | 'users' | 'classes'>('info');
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
            regionalId: schoolData.regionalId?.toString() || schoolData.regional?.id?.toString() || '',
            
            // Adicionar teacherIds e studentIds
            teacherIds: schoolData.teacherIds || [],
            studentIds: schoolData.studentIds || []
          };
          
          console.log('School data loaded:', mappedSchool);
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
    <KTCard className='p-0 h-100'>
      {schoolItem ? (
        <>
          {/* Tabs Header */}
          <div className='card-header card-header-stretch overflow-auto'>
            <ul
              className='nav nav-stretch nav-line-tabs fw-bold border-transparent flex-nowrap'
              role='tablist'
            >
              <li className='nav-item'>
                <a
                  className={clsx('nav-link cursor-pointer', { active: activeTab === 'info' })}
                  onClick={() => setActiveTab('info')}
                  role='tab'
                >
                  Informações Gerais
                </a>
              </li>
              <li className='nav-item'>
                <a
                  className={clsx('nav-link cursor-pointer', { active: activeTab === 'users' })}
                  onClick={() => setActiveTab('users')}
                  role='tab'
                >
                  Usuários
                </a>
              </li>
              <li className='nav-item'>
                <a
                  className={clsx('nav-link cursor-pointer', { active: activeTab === 'classes' })}
                  onClick={() => setActiveTab('classes')}
                  role='tab'
                >
                  Turmas
                </a>
              </li>
            </ul>
          </div>

          {/* Tabs Content */}
          <div className='card-body'>
            <div className='tab-content'>
              {/* Tab Informações Gerais */}
              <div className={clsx('tab-pane fade', { 'show active': activeTab === 'info' })}>
                <SchoolCreateForm schoolItem={schoolItem} onFormSubmit={handleFormSubmit} />
              </div>

              {/* Tab Usuários */}
              <div className={clsx('tab-pane fade', { 'show active': activeTab === 'users' })}>
                {id && <SchoolUsersList schoolId={id} />}
              </div>

              {/* Tab Turmas */}
              <div className={clsx('tab-pane fade', { 'show active': activeTab === 'classes' })}>
                {id && <SchoolClassesList schoolId={id} />}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className='text-center p-10'>
          <span className='indicator-progress'>
            Carregando...{' '}
            <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
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