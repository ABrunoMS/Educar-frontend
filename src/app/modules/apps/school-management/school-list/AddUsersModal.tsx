import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getAccountsByClient } from '@services/Accounts';
import { getAccountsBySchool } from '@services/Schools';
import { KTIcon } from '@metronic/helpers';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

interface AddUsersModalProps {
  schoolId: string;
  clientId: string;
  roleType: 'Teacher' | 'Student';
  onClose: () => void;
}

export const AddUsersModal: React.FC<AddUsersModalProps> = ({ 
  schoolId, 
  clientId, 
  roleType, 
  onClose 
}) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Busca todos os usuários do cliente
  const { data: accountsData, isLoading: isLoadingAccounts } = useQuery(
    ['available-accounts', clientId, roleType],
    () => getAccountsByClient(clientId, 1, 1000),
    {
      enabled: !!clientId,
      keepPreviousData: true,
    }
  );

  // Busca usuários já vinculados à escola
  const { data: schoolUsersData, isLoading: isLoadingSchoolUsers, refetch: refetchSchoolUsers } = useQuery(
    ['school-users-for-filter', schoolId],
    () => getAccountsBySchool(schoolId, 1, 1000, ''),
    {
      enabled: !!schoolId,
      refetchOnMount: 'always',
      staleTime: 0,
    }
  );

  const isLoading = isLoadingAccounts || isLoadingSchoolUsers;

  // Mutation para adicionar usuários à escola
  const addUsersMutation = useMutation(
    async (userIds: string[]) => {
      const results = [];
      for (const userId of userIds) {
        try {
          const response = await axios.post(`${API_URL}/api/Schools/${schoolId}/accounts/${userId}`);
          results.push({ userId, success: true });
        } catch (error: any) {
          // Se o erro for de duplicação, ignora silenciosamente
          if (error.response?.status === 400 || error.response?.data?.message?.includes('já está vinculado')) {
            results.push({ userId, success: true, skipped: true });
          } else {
            throw error;
          }
        }
      }
      return results;
    },
    {
      onSuccess: () => {
        toast.success(`${roleType === 'Teacher' ? 'Professores' : 'Alunos'} adicionados com sucesso!`);
        queryClient.invalidateQueries(['school-users', schoolId]);
        queryClient.invalidateQueries(['school-users-for-filter', schoolId]);
        setSelectedUsers([]);
        onClose();
      },
      onError: (error: any) => {
        toast.error(`Erro ao adicionar usuários: ${error.response?.data?.message || error.message}`);
      },
    }
  );

  const handleToggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleAddUsers = () => {
    if (selectedUsers.length === 0) {
      toast.warning('Selecione pelo menos um usuário');
      return;
    }
    addUsersMutation.mutate(selectedUsers);
  };

  // Processa os dados retornados da API
  const allAccounts = Array.isArray(accountsData?.data?.data) 
    ? accountsData.data.data 
    : [];

  // IDs dos usuários já vinculados à escola
  const schoolUserIds = Array.isArray(schoolUsersData?.data?.data)
    ? schoolUsersData.data.data.map((user: any) => user.id)
    : [];

  // Filtra usuários: role específica + não vinculados à escola + busca por texto
  const filteredAccounts = allAccounts
    .filter((account: any) => account.role === roleType)
    .filter((account: any) => !schoolUserIds.includes(account.id))
    .filter((account: any) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        account.name?.toLowerCase().includes(searchLower) ||
        account.lastName?.toLowerCase().includes(searchLower) ||
        account.email?.toLowerCase().includes(searchLower)
      );
    });

  console.log('Contas filtradas para exibir:', filteredAccounts);
  console.log('Total após filtros:', filteredAccounts.length);

  const roleLabel = roleType === 'Teacher' ? 'Professores' : 'Alunos';

  return (
    <div className='modal fade show d-block' tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className='modal-dialog modal-dialog-centered modal-lg'>
        <div className='modal-content'>
          {/* Header */}
          <div className='modal-header'>
            <h5 className='modal-title'>Adicionar {roleLabel} à Escola</h5>
            <button
              type='button'
              className='btn-close'
              onClick={onClose}
              aria-label='Close'
            />
          </div>

          {/* Body */}
          <div className='modal-body'>
            {/* Campo de busca */}
            <div className='mb-4'>
              <input
                type='text'
                className='form-control'
                placeholder={`Buscar ${roleLabel.toLowerCase()} por nome ou email...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Lista de usuários */}
            {isLoading ? (
              <div className='text-center py-5'>
                <span className='spinner-border spinner-border-sm me-2'></span>
                Carregando usuários...
              </div>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {filteredAccounts.length === 0 ? (
                  <div className='text-center text-muted py-5'>
                    <KTIcon iconName='information-5' className='fs-3x text-muted mb-3' />
                    <p className='mb-0'>
                      {searchTerm 
                        ? `Nenhum ${roleType === 'Teacher' ? 'professor' : 'aluno'} encontrado com este filtro` 
                        : `Nenhum ${roleType === 'Teacher' ? 'professor' : 'aluno'} disponível neste cliente`}
                    </p>
                  </div>
                ) : (
                  <div className='list-group'>
                    {filteredAccounts.map((account: any) => (
                      <label
                        key={account.id}
                        className='list-group-item list-group-item-action d-flex align-items-center'
                        style={{ cursor: 'pointer' }}
                      >
                        <input
                          type='checkbox'
                          className='form-check-input me-3'
                          checked={selectedUsers.includes(account.id)}
                          onChange={() => handleToggleUser(account.id)}
                        />
                        <div className='flex-grow-1'>
                          <div className='fw-bold'>
                            {account.name} {account.lastName}
                          </div>
                          <div className='text-muted small'>{account.email}</div>
                        </div>
                        <span className='badge bg-primary'>{account.role}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Informação sobre selecionados */}
            {selectedUsers.length > 0 && (
              <div className='alert alert-info mt-4 mb-0'>
                <KTIcon iconName='information' className='fs-2 me-2' />
                {selectedUsers.length} usuário(s) selecionado(s)
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='modal-footer'>
            <button
              type='button'
              className='btn btn-light'
              onClick={onClose}
              disabled={addUsersMutation.isLoading}
            >
              Cancelar
            </button>
            <button
              type='button'
              className='btn btn-primary'
              onClick={handleAddUsers}
              disabled={addUsersMutation.isLoading || selectedUsers.length === 0}
            >
              {addUsersMutation.isLoading ? (
                <>
                  <span className='spinner-border spinner-border-sm me-2'></span>
                  Adicionando...
                </>
              ) : (
                <>
                  <KTIcon iconName='plus' className='fs-2' />
                  Adicionar Selecionados
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
