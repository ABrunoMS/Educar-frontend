import { Route, Routes, Outlet, Navigate } from 'react-router-dom'
import { PageTitle } from '../../../../_metronic/layout/core'
import { ItemCreateWrapper } from './item-create/ItemCreate'
// import { UsersListWrapper } from '../user-management/users-list/UsersList'

const ItemPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='items'
          element={
            <>
              <PageTitle>Listagem de itens</PageTitle>
              {/* <UsersListWrapper /> */}
            </>
          }
        />
        <Route
          path='create'
          element={
            <>
              <PageTitle>Criar item</PageTitle>
              <ItemCreateWrapper />
            </>
          }
        />
      </Route>
      <Route index element={<Navigate to='/apps/item-management/items' />} />
    </Routes>
  )
}

export default ItemPage
