import React, { FC, useState, useMemo } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { ID } from '@metronic/helpers'
import { Account } from '@interfaces/Account'

// 1. Importe a API de buscar contas por cliente (do seu arquivo de API)
import { getAccountsByClient } from '@services/Accounts' // <-- Verifique/Ajuste este caminho

// 2. Importe os componentes que você já tem
import { ActionsCell } from '@components/list-view/table/columns/ActionsCell' 
import { AccountCreateForm } from '../../account-management/account-create/components/AccountCreateForm' 

// 3. Importe os componentes de Modal
// (Ajuste o caminho se o seu Modal.tsx estiver em outro lugar)
import { Modal, ModalHeader, ModalBody } from '../../client-management/clients-list/Modal' 

// --- 1. CORREÇÃO: DEFINIÇÕES DE TIPO NO TOPO ---

// Esta definição de Props para ClientUsersList estava em falta
type Props = {
  clientId: string
}

// Esta definição de Props para UsersTable deve ficar aqui (fora do componente)
type UsersTableProps = {
  users: Account[]
  onUserDelete: (id: ID) => void
  type: 'responsaveis' | 'alunos' // A prop que define a coluna
}

// --- FIM DAS DEFINIÇÕES DE TIPO ---


// Helper function para traduzir os nomes dos cargos
const translateRole = (role: string) => {
  switch (role) {
    case 'Admin': return 'Administrador';
    case 'Teacher': return 'Professor';
    case 'TeacherEducar': return 'Professor Educar';
    case 'Student': return 'Aluno';
    case 'AgenteComercial': return 'Agente Comercial';
    case 'Diretor': return 'Diretor';
    case 'Distribuidor': return 'Distribuidor';
    case 'Secretario': return 'Secretário';
    default: return role; 
  }
}

// Componente de Tabela (agora com props corretas)
const UsersTable: FC<UsersTableProps> = ({ users, onUserDelete, type }) => {
  return (
    <div className='table-responsive'>
      <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4'>
        <thead>
          <tr className='fw-bold text-muted'>
            <th className='min-w-200px'>Nome</th>
            <th className='min-w-150px'>Email</th>
            
            {/* Cabeçalho da coluna dinâmico */}
            <th className='min-w-100px'>
              {type === 'responsaveis' ? 'Cargo' : 'Matrícula'}
            </th>
            
            <th className='min-w-100px text-end'>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <span className='text-dark fw-bold d-block fs-6'>
                  {user.name} {user.lastName}
                </span>
              </td>
              <td>
                <span className='text-muted fw-semibold d-block fs-7'>
                  {user.email}
                </span>
              </td>
              
              {/* Célula da coluna dinâmica */}
              <td>
                <span className='text-muted fw-semibold d-block fs-7'>
                  {type === 'responsaveis'
                    ? translateRole(user.role) // Mostra o Cargo traduzido
                    : user.registrationNumber || '---'} {/* Mostra a Matrícula */}
                </span>
              </td>

              <td className='text-end'>
                <ActionsCell
                  id={user.id!}
                  editPath={`/apps/user-management/users/edit`}
                  callbackFunction={onUserDelete}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


// --- 2. CORREÇÃO: USA 'Props' QUE AGORA ESTÁ DEFINIDO ---
const ClientUsersList: FC<Props> = ({ clientId }) => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const queryClient = useQueryClient()

  // 1. Busca todos os usuários
  const { data: paginatedResponse, isLoading } = useQuery(
    ['clientUsers', clientId], 
    () => getAccountsByClient(clientId).then(res => res.data), // Usa a função da sua API
    {
      enabled: !!clientId, 
      onError: () => {
        alert("Não foi possível carregar os usuários deste cliente.")
      }
    }
  )

  // 2. Separa os usuários
  const { responsaveis, alunos } = useMemo(() => {
    const allUsers = paginatedResponse?.data || [] // Pega o array 'data'
    return {
      responsaveis: allUsers.filter((u) => u.role !== 'Student'),
      alunos: allUsers.filter((u) => u.role === 'Student'),
    }
  }, [paginatedResponse])

  // 3. Callback para fechar o modal
  const handleFormSubmit = () => {
    setShowCreateModal(false)
    queryClient.invalidateQueries(['clientUsers', clientId])
  }

  // 4. Lógica de Deleção
  const handleDeleteUser = (id: ID) => {
    console.log('Deletar usuário:', id)
    alert('Lógica de deleção de usuário não implementada.')
    // Após deletar, chame:
    // queryClient.invalidateQueries(['clientUsers', clientId])
  }

  return (
    <div className='p-9'>
      {/* Botão de Ação */}
      <div className='d-flex justify-content-end mb-5'>
        <button
          className='btn btn-primary'
          onClick={() => setShowCreateModal(true)}
        >
          <i className='fas fa-plus me-1'></i> Novo Usuário
        </button>
      </div>

      {isLoading && (
        <div className='text-center text-muted py-5'>
          Carregando usuários...
          <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
        </div>
      )}

      {/* Grupo 1: Responsáveis */}
      {!isLoading && (
        <div className='card card-flush shadow-sm mb-5'>
          <div className='card-header min-h-50px'>
            <h3 className='card-title'>Responsáveis</h3>
            <div className='card-toolbar'>
              <span className='badge badge-light-primary'>
                {responsaveis.length}
              </span>
            </div>
          </div>
          <div className='card-body py-0'>
            {responsaveis.length > 0 ? (
              <UsersTable 
                users={responsaveis} 
                onUserDelete={handleDeleteUser} 
                type='responsaveis' // <-- Passa a prop
              />
            ) : (
              <div className='text-center text-muted p-5'>
                Nenhum responsável (Diretor, Professor, etc.) encontrado.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grupo 2: Alunos */}
      {!isLoading && (
        <div className='card card-flush shadow-sm'>
          <div className='card-header min-h-50px'>
            <h3 className='card-title'>Alunos</h3>
            <div className='card-toolbar'>
              <span className='badge badge-light-success'>{alunos.length}</span>
            </div>
          </div>
          <div className='card-body py-0'>
            {alunos.length > 0 ? (
              <UsersTable 
                users={alunos} 
                onUserDelete={handleDeleteUser} 
                type='alunos' // <-- Passa a prop
              />
            ) : (
              <div className='text-center text-muted p-5'>
                Nenhum aluno encontrado.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Criação */}
      <Modal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        size='lg' 
      >
        <ModalHeader
          title='Criar Novo Usuário'
          onClose={() => setShowCreateModal(false)}
        />
        <ModalBody>
          <p className='text-muted fs-7'>
            O novo usuário será automaticamente associado a este cliente.
          </p>
          <AccountCreateForm
            clientId={clientId} 
            onFormSubmit={handleFormSubmit}
          />
        </ModalBody>
      </Modal>
    </div>
  )
}

export { ClientUsersList }