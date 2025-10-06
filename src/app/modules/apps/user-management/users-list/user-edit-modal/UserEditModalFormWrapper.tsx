import {useQuery} from 'react-query'
import {ID, isNotEmpty, QUERIES} from '../../../../../../_metronic/helpers'
import {useListView} from '../core/ListViewProvider'
// 1. IMPORTE a função e tipos corretos
import { getAccountById } from '@services/Accounts'
import { Account } from '@interfaces/Account' 
import { initialAccount } from '../../../account-management/account-create/components/AccountCreateForm'
import { AccountCreateForm } from '../../../account-management/account-create/components/AccountCreateForm'

type Props = {
  id?: ID
  onClose: () => void
}

const UserEditModalFormWrapper = ({id, onClose}: Props) => {
  const {setItemIdForUpdate} = useListView()
  
  // 2. A query agora espera retornar um 'Account'
  const {isLoading, data: account, error} = useQuery(
    `${QUERIES.USERS_LIST}-account-${id}`, // Chave da query atualizada
    () => {
      // Adicione uma verificação para garantir que o id é uma string
      if (typeof id === 'string') {
        // 3. CHAMAMOS A FUNÇÃO CORRETA que busca o 'Account' completo
        return getAccountById(id) 
      }
      return Promise.resolve(undefined)
    },
    {
      cacheTime: 0,
      enabled: isNotEmpty(id),
      onError: (err) => {
        setItemIdForUpdate(undefined)
        console.error(err)
      },
    }
  )

  if (isLoading) {
    return (
        <div className='modal-content'>
            <div className='modal-body'>Carregando...</div>
        </div>
    )
  }
  
  return (
    <AccountCreateForm 
      isUserLoading={isLoading} 
      // 4. Passamos o 'account' (que agora é do tipo certo) ou o 'initialAccount'
      account={account || initialAccount} 
      onFormSubmit={onClose} 
    />
  )
}

export {UserEditModalFormWrapper}