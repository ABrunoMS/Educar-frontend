import {useQuery} from 'react-query'
import {UserEditModalForm} from './UserEditModalForm'
import {isNotEmpty, QUERIES} from '../../../../../../_metronic/helpers'
import {useListView} from '../core/ListViewProvider'
import {getUserById} from '../core/_requests'
import { getAccountById } from '@services/Accounts'
import { AccountCreateForm } from '../../../account-management/account-create/components/AccountCreateForm'
import { initialAccount } from '../../../account-management/account-create/components/AccountCreateForm'
import {User} from '../core/_models'
// 1. Defina as props que o componente espera receber
type Props = {
  id?: string | null
  onClose: () => void
}

const UserEditModalFormWrapper = ({id, onClose}: Props) => {
  const {setItemIdForUpdate} = useListView()
  
  const {isLoading, data: account, error} = useQuery(
    `${QUERIES.USERS_LIST}-account-${id}`,
    () => {
      // O '!' garante ao TypeScript que 'id' não será nulo aqui
      return getAccountById(id!) 
    },
    {
      cacheTime: 0,
      enabled: isNotEmpty(id), // A query só roda se 'id' existir
      onError: (err) => {
        setItemIdForUpdate(undefined)
        console.error(err)
      },
    }
  )

  if (isLoading) {
    return <div>Carregando...</div>
  }

  // Se for modo de criação (sem id) ou se os dados já carregaram (com id)
  // renderiza o formulário.
  return <AccountCreateForm isUserLoading={isLoading} account={account|| initialAccount} onFormSubmit={onClose} />
}

export {UserEditModalFormWrapper}