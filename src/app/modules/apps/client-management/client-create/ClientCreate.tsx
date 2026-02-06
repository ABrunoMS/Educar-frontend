import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom' // 1. Importar o hook de parâmetros
import clsx from 'clsx' // Para classes condicionais
import {KTCard} from '../../../../../_metronic/helpers'
import { ToolbarWrapper } from '../../../../../_metronic/layout/components/toolbar'
import { Content } from '../../../../../_metronic/layout/components/content'

// 2. Importar os componentes das abas
import { ClientCreateForm } from './components/ClientCreateForm'
import { ClientUsersList } from '../clients-list/ClientUsersList' 
import { ClientStructure } from './components/ClientStructure'

// 3. Importar a API e o Tipo
import { getClientById, updateClient } from '../clients-list/core/_requests' // <-- Sua API de cliente
import { ClientType, SubsecretariaDto } from '@interfaces/Client' // <-- Importar o tipo

// 4. Renomeamos o 'ClientCreate' para 'ClientPageLayout'
const ClientPageLayout = () => {
  const { id } = useParams<{ id: string }>() // <-- Pega o 'id' da URL (ex: /clients/edit/:id)
  const [clientToEdit, setClientToEdit] = useState<ClientType | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [isSavingStructure, setIsSavingStructure] = useState(false)
  
  // Define se estamos em modo de edição baseado na presença do ID
  const isEditMode = !!id

  // 5. Efeito para buscar o cliente se estivermos em modo de edição
  useEffect(() => {
    if (isEditMode) {
      setIsLoading(true)
      getClientById(id) // Função que você já tem na sua API
        .then((clientData) => {
          setClientToEdit(clientData)
        })
        .catch((err) => {
          console.error('Falha ao buscar cliente:', err)
          alert("Erro ao carregar dados do cliente.")
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [id, isEditMode]) // Roda sempre que o ID mudar

  // Handler para mudanças na estrutura organizacional
  const handleSubsecretariasChange = async (subsecretarias: SubsecretariaDto[]) => {
    if (!clientToEdit || !id) return
    
    setIsSavingStructure(true)
    try {
      const updatedClient = { ...clientToEdit, subsecretarias }
      await updateClient(updatedClient)
      setClientToEdit(updatedClient)
    } catch (err) {
      console.error('Falha ao salvar estrutura:', err)
      alert("Erro ao salvar estrutura organizacional.")
    } finally {
      setIsSavingStructure(false)
    }
  }

  // 6. Renderização de Loading (enquanto busca o cliente no modo edição)
  if (isEditMode && isLoading) {
    return (
      <KTCard className='p-5 h-100 d-flex justify-content-center align-items-center'>
        Carregando dados do cliente...
        <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
      </KTCard>
    )
  }

  // 7. Renderização da Página com Abas
  return (
    <KTCard className='h-100'>
      {/* Estrutura de Abas (Tabs) do Bootstrap */}
      <ul
        className='nav nav-tabs nav-line-tabs nav-line-tabs-2x border-b-0 fs-6 px-9 pt-7'
        role='tablist'
      >
        {/* Aba 1: Formulário */}
        <li className='nav-item' role='presentation'>
          <a
            className='nav-link active' // A primeira aba é sempre ativa
            data-bs-toggle='tab'
            href='#kt_tab_pane_client_form'
            aria-selected='true'
            role='tab'
          >
            Dados do Cliente
          </a>
        </li>

        {/* Aba 2: Usuários (Condicional) */}
        <li className='nav-item' role='presentation'>
          <a
            className={clsx('nav-link', { disabled: !isEditMode })} // <-- DESABILITA se NÃO for modo edição
            data-bs-toggle={isEditMode ? 'tab' : ''} // Previne clique se estiver desabilitado
            href='#kt_tab_pane_client_users'
            aria-selected='false'
            role='tab'
            title={!isEditMode ? 'Salve o cliente para poder adicionar usuários' : 'Gerenciar Usuários'}
          >
            Usuários do Cliente
          </a>
        </li>

        {/* Aba 3: Estrutura Organizacional (Condicional) */}
        <li className='nav-item' role='presentation'>
          <a
            className={clsx('nav-link', { disabled: !isEditMode })}
            data-bs-toggle={isEditMode ? 'tab' : ''}
            href='#kt_tab_pane_client_structure'
            aria-selected='false'
            role='tab'
            title={!isEditMode ? 'Salve o cliente para acessar a estrutura organizacional' : 'Estrutura Organizacional'}
          >
            Estrutura Organizacional
          </a>
        </li>
      </ul>

      {/* Conteúdo das Abas */}
      <div className='tab-content' id='myTabContent'>
        {/* Conteúdo Aba 1: Formulário */}
        <div
          className='tab-pane fade show active'
          id='kt_tab_pane_client_form'
          role='tabpanel'
        >
          <div className='p-9'> {/* Adiciona padding ao redor do formulário */}
            <ClientCreateForm
              isUserLoading={isLoading}
              client={clientToEdit} // <-- Passa o cliente (se for 'edit') ou undefined
              onFormSubmit={() => {
                // Lógica de "Após Salvar" (ex: redirecionar)
                // Se for criação, você pode querer redirecionar para a página de edição
                console.log('Formulário submetido!')
              }}
            />
          </div>
        </div>

        {/* Conteúdo Aba 2: Usuários */}
        <div className='tab-pane fade' id='kt_tab_pane_client_users' role='tabpanel'>
          {isEditMode && clientToEdit && clientToEdit.id ? (
            <ClientUsersList clientId={clientToEdit.id} />
          ) : (
            // Mensagem para o modo de criação
            <div className='p-9 text-center text-muted'>
              <p className='fs-5'>
                Salve o cliente primeiro para poder gerenciar os usuários.
              </p>
            </div>
          )}
        </div>

        {/* Conteúdo Aba 3: Estrutura Organizacional */}
        <div className='tab-pane fade' id='kt_tab_pane_client_structure' role='tabpanel'>
          {isEditMode && clientToEdit && clientToEdit.id ? (
            <div className='p-9'>
              {isSavingStructure && (
                <div className='alert alert-info d-flex align-items-center mb-5'>
                  <span className='spinner-border spinner-border-sm me-2'></span>
                  Salvando alterações...
                </div>
              )}
              <ClientStructure
                clientId={clientToEdit.id}
                subsecretarias={clientToEdit.subsecretarias || []}
                onSubsecretariasChange={handleSubsecretariasChange}
                readOnly={false}
              />
            </div>
          ) : (
            <div className='p-9 text-center text-muted'>
              <p className='fs-5'>
                Salve o cliente primeiro para acessar a estrutura organizacional.
              </p>
            </div>
          )}
        </div>
      </div>
    </KTCard>
  )
}

// O Wrapper principal agora renderiza o nosso novo Layout
const ClientCreateWrapper = () => (
  <div>
    {/* Você pode querer passar o título da página (Novo ou Editando) para o ToolbarWrapper */}
    <ToolbarWrapper />
    <Content>
      <ClientPageLayout /> {/* <-- Renderiza o layout com abas */}
    </Content>
  </div>
)

export {ClientCreateWrapper}