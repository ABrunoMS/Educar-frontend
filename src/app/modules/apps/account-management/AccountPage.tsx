import {Route, Routes, Outlet, Navigate} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {UsersListWrapper} from '../user-management/users-list/UsersList'
import {AccountCreateWrapper} from './account-create/AccountCreate'

const usersBreadcrumbs: Array<PageLink> = [
  {
    title: 'Account Management',
    path: '/apps/account-management/accounts',
    isSeparator: false,
    isActive: false,
  },
  {
    title: '',
    path: '',
    isSeparator: true,
    isActive: false,
  },
]

const AccountPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='accounts'
          element={
            <>
              <PageTitle>Listagem de contas</PageTitle>
                <UsersListWrapper />
            </>
          }
        />
        <Route
          path='create'
          element={
            <>
              <PageTitle>Criar conta</PageTitle>
              <AccountCreateWrapper />
            </>
          }
        />
      </Route>
      <Route index element={<Navigate to='/apps/account-management/accounts' />} />
    </Routes>
  )
}

export default AccountPage
