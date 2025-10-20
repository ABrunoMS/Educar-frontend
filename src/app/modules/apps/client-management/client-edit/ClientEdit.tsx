import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { getClientById } from '../clients-list/core/_requests';
import { ClientCreateForm } from '../client-create/components/ClientCreateForm';
import { KTCard } from '../../../../../_metronic/helpers';

const ClientEdit = () => {
  const { id } = useParams(); // Pega o ID da URL
  const navigate = useNavigate();

  // Função para voltar para a lista
  const handleFormSubmit = () => {
    navigate('/apps/client-management/clients');
  };

  // Busca os dados do cliente na API
  const {
    data: clientData,
    isLoading,
    error,
  } = useQuery(
    ['client', id], // Chave da query
    () => getClientById(id as string), // Função de busca
    {
      enabled: !!id, // Só executa a query se o ID existir
    }
  );

  // Se estiver carregando, mostra uma mensagem
  if (isLoading) {
    return <div>Carregando dados do cliente...</div>;
  }

  // Se der erro
  if (error) {
    return <div>Ocorreu um erro ao buscar o cliente.</div>;
  }

  // Se os dados chegaram, renderiza o formulário
  return (
    <KTCard className='p-5 h-100'>
      <ClientCreateForm
        isUserLoading={isLoading}
        client={clientData} // Passa os dados do cliente para o formulário
        onFormSubmit={handleFormSubmit}
      />
    </KTCard>
  );
};

export { ClientEdit };