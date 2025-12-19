import { useQuery } from 'react-query'
import { ID, isNotEmpty, QUERIES } from '../../../../../../_metronic/helpers'
import { useListView } from '../core/ListViewProvider'
import { getAccountById } from '@services/Accounts' 
import { Account } from '@interfaces/Account' 
import { initialAccount, AccountCreateForm } from '../../../account-management/account-create/components/AccountCreateForm'
import { useMemo } from 'react'

type Props = {
  id?: ID
  onClose: () => void
}

const UserEditModalFormWrapper = ({ id, onClose }: Props) => {
  const { setItemIdForUpdate } = useListView()
  
  const { isLoading, data: apiAccount } = useQuery(
    [`${QUERIES.USERS_LIST}-account`, id],
    () => {
      // Garante conversão para string
      if (isNotEmpty(id)) return getAccountById(String(id))
      return Promise.resolve(undefined)
    },
    {
      cacheTime: 0,
      enabled: isNotEmpty(id),
      onError: (err) => {
        console.error('Erro ao carregar usuário:', err)
        setItemIdForUpdate(undefined) 
      },
    }
  )

  // === ADAPTADOR INTELIGENTE ===
  const accountForForm: Account = useMemo(() => {
    if (!apiAccount) return initialAccount;

    const raw: any = apiAccount;

    // LÓGICA PARA DESCOBRIR O CLIENTE (ID)
    let foundClientId = '';

    // 1. Tenta pegar do vínculo direto (Usuario -> Cliente)
    if (raw.clientId || raw.ClientId) foundClientId = raw.clientId || raw.ClientId;
    else if (raw.client?.id || raw.Client?.Id) foundClientId = raw.client?.id || raw.Client?.Id;

    // 2. CORREÇÃO: Se não achou direto, pega o cliente da primeira ESCOLA vinculada
    // O seu JSON mostrou que o cliente está dentro de: schools[0].client.id
    if (!foundClientId && raw.schools && raw.schools.length > 0) {
        const firstSchool = raw.schools[0];
        foundClientId = firstSchool.client?.id || firstSchool.Client?.Id || '';
    }

    return {
      ...initialAccount,
      
      id: raw.id || raw.Id,
      name: raw.name || raw.Name || '',
      lastName: raw.lastName || raw.LastName || '', 
      email: raw.email || raw.Email || '',
      role: raw.role || raw.Role || 'Student',
      
      // Aplica o ID do cliente que descobrimos acima
      clientId: foundClientId,

      // Mapeia array de objetos escolas para array de IDs
      schoolIds: (raw.schoolIds || raw.SchoolIds || [])
        .length > 0 ? (raw.schoolIds || raw.SchoolIds) 
        : (raw.schools || raw.Schools || []).map((s: any) => s.id || s.Id),

      // Mapeia array de objetos turmas para array de IDs
      classIds: (raw.classIds || raw.ClassIds || [])
        .length > 0 ? (raw.classIds || raw.ClassIds)
        : (raw.classes || raw.Classes || []).map((c: any) => c.id || c.Id),
        
      password: '', 
      confirmPassword: ''
    };
  }, [apiAccount]);

  if (isLoading) {
    return (
        <div className='modal-content'>
            <div className='modal-body d-flex justify-content-center py-10 align-items-center flex-column'>
                <div className="spinner-border text-primary" role="status"></div>
                <span className='text-muted mt-2'>Carregando dados...</span>
            </div>
        </div>
    )
  }
  
  return (
    <AccountCreateForm 
      isUserLoading={isLoading} 
      account={accountForForm} 
      onFormSubmit={onClose} 
    />
  )
}

export { UserEditModalFormWrapper }