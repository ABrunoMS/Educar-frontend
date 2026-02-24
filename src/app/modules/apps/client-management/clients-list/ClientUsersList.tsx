import React, { FC, useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { ID } from '@metronic/helpers'
import { Account } from '@interfaces/Account'
import { toast } from 'react-toastify'

// 1. Importe a API de buscar contas por cliente (do seu arquivo de API)
import { getAccountsByClient, getAccountsWithoutClient, updateAccount } from '@services/Accounts' // <-- Verifique/Ajuste este caminho

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
  totalAccounts?: number
  onUsersChange?: () => void
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
const ClientUsersList: FC<Props> = ({ clientId, totalAccounts = 0, onUsersChange }) => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const queryClient = useQueryClient()

  // 1. Busca todos os usuários do cliente
  const { data: paginatedResponse, isLoading } = useQuery(
    ['clientUsers', clientId], 
    () => getAccountsByClient(clientId).then(res => res.data),
    {
      enabled: !!clientId, 
      onError: () => {
        alert("Não foi possível carregar os usuários deste cliente.")
      }
    }
  )

  // 2. Busca usuários sem cliente (para o modal de vinculação)
  const { data: usersWithoutClientResponse, isLoading: isLoadingWithoutClient } = useQuery(
    ['usersWithoutClient', searchTerm],
    () => getAccountsWithoutClient(1, 100, searchTerm).then(res => res.data),
    {
      enabled: showLinkModal,
    }
  )

  // Extrair a lista de usuários sem cliente
  const usersWithoutClientList = usersWithoutClientResponse?.data || []

  // 3. Mutation para vincular usuário ao cliente
  const linkUserMutation = useMutation(
    (userId: string) => {
      const user = usersWithoutClientList.find(u => u.id === userId)
      if (!user) throw new Error('Usuário não encontrado')
      return updateAccount({ ...user, clientId })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['clientUsers', clientId])
        queryClient.invalidateQueries(['usersWithoutClient'])
        onUsersChange?.()
      },
      onError: () => {
        toast.error('Erro ao vincular usuário')
      }
    }
  )

  // Calcular contas vinculadas baseado na lista real de usuários
  const linkedAccounts = paginatedResponse?.payload?.pagination?.totalCount || paginatedResponse?.data?.length || 0
  const remainingAccounts = Math.max(0, totalAccounts - linkedAccounts)

  // 4. Separa os usuários
  const { responsaveis, alunos } = useMemo(() => {
    const allUsers = paginatedResponse?.data || []
    return {
      responsaveis: allUsers.filter((u) => u.role !== 'Student'),
      alunos: allUsers.filter((u) => u.role === 'Student'),
    }
  }, [paginatedResponse])

  // 5. Callback para fechar o modal de criação
  const handleFormSubmit = () => {
    setShowCreateModal(false)
    queryClient.invalidateQueries(['clientUsers', clientId])
    onUsersChange?.()
  }

  // 6. Handler para vincular usuários selecionados
  const handleLinkSelectedUsers = async () => {
    for (const userId of selectedUsers) {
      await linkUserMutation.mutateAsync(userId)
    }
    setSelectedUsers([])
    setShowLinkModal(false)
    toast.success(`${selectedUsers.length} usuário(s) vinculado(s) com sucesso!`)
  }

  // 7. Toggle seleção de usuário
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  // 8. Lógica de Deleção
  const handleDeleteUser = (id: ID) => {
    console.log('Deletar usuário:', id)
    alert('Lógica de deleção de usuário não implementada.')
  }

  return (
    <div className='p-9'>
      {/* Card de Resumo de Contas */}
      <div className='row g-5 mb-5'>
        <div className='col-md-4'>
          <div className='card bg-light-primary border-0'>
            <div className='card-body py-4'>
              <div className='d-flex align-items-center'>
                <div className='symbol symbol-45px me-4'>
                  <span className='symbol-label bg-primary'>
                    <i className='fas fa-users text-white fs-3'></i>
                  </span>
                </div>
                <div>
                  <div className='fs-2 fw-bold text-primary'>{totalAccounts}</div>
                  <div className='fs-7 text-muted'>Total de Contas Permitidas</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='col-md-4'>
          <div className='card bg-light-success border-0'>
            <div className='card-body py-4'>
              <div className='d-flex align-items-center'>
                <div className='symbol symbol-45px me-4'>
                  <span className='symbol-label bg-success'>
                    <i className='fas fa-user-check text-white fs-3'></i>
                  </span>
                </div>
                <div>
                  <div className='fs-2 fw-bold text-success'>{linkedAccounts}</div>
                  <div className='fs-7 text-muted'>Contas Vinculadas</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='col-md-4'>
          <div className={`card border-0 ${remainingAccounts > 0 ? 'bg-light-info' : 'bg-light-danger'}`}>
            <div className='card-body py-4'>
              <div className='d-flex align-items-center'>
                <div className='symbol symbol-45px me-4'>
                  <span className={`symbol-label ${remainingAccounts > 0 ? 'bg-info' : 'bg-danger'}`}>
                    <i className={`fas ${remainingAccounts > 0 ? 'fa-user-plus' : 'fa-user-times'} text-white fs-3`}></i>
                  </span>
                </div>
                <div>
                  <div className={`fs-2 fw-bold ${remainingAccounts > 0 ? 'text-info' : 'text-danger'}`}>{remainingAccounts}</div>
                  <div className='fs-7 text-muted'>Contas Restantes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className='d-flex justify-content-end align-items-center mb-5 gap-3'>
        {remainingAccounts <= 0 && (
          <span className='text-danger fs-7'>
            <i className='fas fa-exclamation-triangle me-1'></i>
            Limite de contas atingido
          </span>
        )}
        <button
          className='btn btn-light-primary'
          onClick={() => setShowLinkModal(true)}
          disabled={remainingAccounts <= 0}
          title={remainingAccounts <= 0 ? 'Limite de contas atingido' : 'Vincular usuário existente'}
        >
          <i className='fas fa-link me-1'></i> Vincular Existente
        </button>
        <button
          className='btn btn-primary'
          onClick={() => setShowCreateModal(true)}
          disabled={remainingAccounts <= 0}
          title={remainingAccounts <= 0 ? 'Limite de contas atingido' : 'Criar novo usuário'}
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

      {/* Modal de Vincular Usuário Existente */}
      <Modal
        show={showLinkModal}
        onClose={() => { setShowLinkModal(false); setSelectedUsers([]); setSearchTerm(''); }}
        size='lg'
      >
        <ModalHeader
          title='Vincular Usuário Existente'
          onClose={() => { setShowLinkModal(false); setSelectedUsers([]); setSearchTerm(''); }}
        />
        <ModalBody>
          <p className='text-muted fs-7 mb-4'>
            Selecione usuários que ainda não estão vinculados a nenhum cliente para associá-los a este cliente.
          </p>
          
          {/* Barra de pesquisa */}
          <div className='mb-4'>
            <input
              type='text'
              className='form-control form-control-solid'
              placeholder='Buscar por nome ou email...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Lista de usuários disponíveis */}
          <div className='mh-400px overflow-auto'>
            {isLoadingWithoutClient ? (
              <div className='text-center text-muted py-5'>
                Carregando usuários...
                <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
              </div>
            ) : usersWithoutClientList.length > 0 ? (
              <div className='table-responsive'>
                <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-3'>
                  <thead>
                    <tr className='fw-bold text-muted'>
                      <th className='w-25px'>
                        <div className='form-check form-check-sm form-check-custom form-check-solid'>
                          <input
                            className='form-check-input'
                            type='checkbox'
                            checked={selectedUsers.length === usersWithoutClientList.length && usersWithoutClientList.length > 0}
                            onChange={() => {
                              if (selectedUsers.length === usersWithoutClientList.length) {
                                setSelectedUsers([])
                              } else {
                                setSelectedUsers(usersWithoutClientList.map(u => u.id!))
                              }
                            }}
                          />
                        </div>
                      </th>
                      <th className='min-w-150px'>Nome</th>
                      <th className='min-w-150px'>Email</th>
                      <th className='min-w-100px'>Cargo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersWithoutClientList.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className='form-check form-check-sm form-check-custom form-check-solid'>
                            <input
                              className='form-check-input'
                              type='checkbox'
                              checked={selectedUsers.includes(user.id!)}
                              onChange={() => toggleUserSelection(user.id!)}
                            />
                          </div>
                        </td>
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
                        <td>
                          <span className='text-muted fw-semibold d-block fs-7'>
                            {translateRole(user.role)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className='text-center text-muted py-5'>
                <i className='fas fa-users-slash fs-2x mb-3 d-block text-gray-400'></i>
                Nenhum usuário disponível para vinculação.
              </div>
            )}
          </div>

          {/* Botões de ação */}
          {selectedUsers.length > 0 && (
            <div className='d-flex justify-content-between align-items-center mt-4 pt-4 border-top'>
              <span className='text-muted fs-7'>
                {selectedUsers.length} usuário(s) selecionado(s)
              </span>
              <button
                className='btn btn-primary'
                onClick={handleLinkSelectedUsers}
                disabled={linkUserMutation.isLoading || selectedUsers.length > remainingAccounts}
              >
                {linkUserMutation.isLoading ? (
                  <>
                    <span className='spinner-border spinner-border-sm me-2'></span>
                    Vinculando...
                  </>
                ) : selectedUsers.length > remainingAccounts ? (
                  `Limite excedido (máx: ${remainingAccounts})`
                ) : (
                  <>
                    <i className='fas fa-link me-1'></i>
                    Vincular Selecionados
                  </>
                )}
              </button>
            </div>
          )}
        </ModalBody>
      </Modal>
    </div>
  )
}

export { ClientUsersList }