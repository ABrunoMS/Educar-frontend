import { Route, Routes, Outlet, Navigate } from 'react-router-dom'
import { PageTitle } from '../../../../_metronic/layout/core'
import { ContractCreateWrapper } from './contract-create/ContractCreate'
// import { UsersListWrapper } from '../user-management/users-list/UsersList'

const ContractPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='contracts'
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
              <ContractCreateWrapper />
            </>
          }
        />
      </Route>
      <Route index element={<Navigate to='/apps/client-management/clients' />} />
    </Routes>
  )
}

export default ContractPage
