import { Route, Routes, Outlet, Navigate } from 'react-router-dom'
import { PageTitle } from '../../../../_metronic/layout/core'
import { GradeCreateWrapper } from './grade-create/GradeCreate'
// import { UsersListWrapper } from '../user-management/users-list/UsersList'

const ContractPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='grades'
          element={
            <>
              <PageTitle>Listagem de notas</PageTitle>
              {/* <UsersListWrapper /> */}
            </>
          }
        />
        <Route
          path='create'
          element={
            <>
              <PageTitle>Criar nota</PageTitle>
              <GradeCreateWrapper />
            </>
          }
        />
      </Route>
      <Route index element={<Navigate to='/apps/grade-management/clients' />} />
    </Routes>
  )
}

export default ContractPage
