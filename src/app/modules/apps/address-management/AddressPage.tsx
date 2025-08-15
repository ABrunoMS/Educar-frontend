import { Route, Routes, Outlet, Navigate } from 'react-router-dom'
import { PageTitle } from '../../../../_metronic/layout/core'
import { AddressCreateWrapper } from './address-create/AddressCreate'
import { AddressListWrapper } from './address-list/AddressList'  
// import { UsersListWrapper } from '../user-management/users-list/UsersList'

const AddressPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='addresses'
          element={
            <>
              <PageTitle>Listagem de enderenços</PageTitle>
              { <AddressListWrapper />}
            </>
          }
        />
        <Route
          path='create'
          element={
            <>
              <PageTitle>Criar enderenço</PageTitle>
              <AddressCreateWrapper />
            </>
          }
        />
      </Route>
      <Route index element={<Navigate to='/apps/address-management/addresses' />} />
    </Routes>
  )
}

export default AddressPage
