import { Route, Routes, Outlet, Navigate } from 'react-router-dom'
import { PageTitle } from '../../../../_metronic/layout/core'
import { GameCreateWrapper } from './game-create/GameCreate'
// import { UsersListWrapper } from '../user-management/users-list/UsersList'

const ContractPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='games'
          element={
            <>
              <PageTitle>Listagem de clientes</PageTitle>
              {/* <UsersListWrapper /> */}
            </>
          }
        />
        <Route
          path='create'
          element={
            <>
              <PageTitle>Criar cliente</PageTitle>
              <GameCreateWrapper />
            </>
          }
        />
      </Route>
      <Route index element={<Navigate to='/apps/client-management/clients' />} />
    </Routes>
  )
}

export default ContractPage
