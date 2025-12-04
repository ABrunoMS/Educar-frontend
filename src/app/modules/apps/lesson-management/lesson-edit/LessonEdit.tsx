import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { getQuestById } from '@services/Lesson';
import LessonCreateForm from '../lesson-create/components/LessonCreateForm';
import { KTCard } from '../../../../../_metronic/helpers';

const LessonEdit = () => {
  const { id } = useParams(); // Pega o ID da URL
  const navigate = useNavigate();
  console.log('1. ID da URL:', id);
  // Função para voltar para a lista
  const handleFormSubmit = () => {
    navigate('/apps/lesson-management/lessons');
  };

  // Busca os dados da aula na API
  const {
    data: lessonData,
    isLoading,
    error,
  } = useQuery(
    ['lesson', id], // Chave da query
    () => getQuestById(id as string), // Função de busca
    {
      enabled: !!id, // Só executa a query se o ID existir
    }
  );

  // Se estiver carregando, mostra uma mensagem
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  // Se houver erro, mostra uma mensagem
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Erro ao carregar os dados da aula. Tente novamente.
      </div>
    );
  }
console.log('Dados brutos da API na edição:', lessonData);
  return (
    <KTCard>
      <div className="card-header border-0 pt-6">
        <div className="card-title">
          <div className="d-flex align-items-center position-relative my-1">
            <h1 className="fw-bold me-3">Editar Aula</h1>
          </div>
        </div>
      </div>
      <div className="card-body pt-0">
        <LessonCreateForm 
          lesson={lessonData?.data} 
          isEditing={true}
          onFormSubmit={handleFormSubmit}
        />
      </div>
    </KTCard>
  );
};

export { LessonEdit };