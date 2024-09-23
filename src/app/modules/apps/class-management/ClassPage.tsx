import { Route, Routes, Outlet, Navigate } from 'react-router-dom'
import { PageTitle } from '../../../../_metronic/layout/core'
import { ClassCreateWrapper } from './class-create/ClassCreate'
// import { UsersListWrapper } from '../user-management/users-list/UsersList'

const ClassPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='classes'
          element={
            <>
              <PageTitle>Listagem de classes</PageTitle>
              {/* <UsersListWrapper /> */}
            </>
          }
        />
        <Route
          path='create'
          element={
            <>
              <PageTitle>Criar classe</PageTitle>
              <ClassCreateWrapper />
            </>
          }
        />
      </Route>
      <Route index element={<Navigate to='/apps/client-management/clients' />} />
    </Routes>
  )
}

export default ClassPage
