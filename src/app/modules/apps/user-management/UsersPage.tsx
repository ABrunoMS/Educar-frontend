import {Route, Routes, Outlet, Navigate} from 'react-router-dom'
import {PageLink, PageTitle} from '@metronic/layout/core'
import {UsersListWrapper} from './users-list/UsersList'
import {UserCreateWrapper} from './user-create/UserCreate'

const usersBreadcrumbs: Array<PageLink> = [
  {
    title: 'User Management',
    path: '/apps/user-management/users',
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

const UsersPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='users'
          element={
            <>
              <PageTitle>Listagem de usuários</PageTitle>
              <UsersListWrapper />
            </>
          }
        />
        <Route
          path='create'
          element={
            <>
              <PageTitle>Criar usuários</PageTitle>
              <UserCreateWrapper />
            </>
          }
        />
      </Route>
      <Route index element={<Navigate to='/apps/user-management/users' />} />
    </Routes>
  )
}

export default UsersPage
