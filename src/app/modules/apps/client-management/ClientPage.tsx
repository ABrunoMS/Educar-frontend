import { Route, Routes, Outlet, Navigate } from 'react-router-dom'
import { PageTitle } from '@metronic/layout/core'
import { ClientCreateWrapper } from './client-create/ClientCreate'
import { ClientListWrapper } from './clients-list/ClientList'
import { ClientEdit } from './client-edit/ClientEdit'
const ClientsPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='clients'
          element={
            <>
              <PageTitle>Listagem de Clientes</PageTitle>
              <ClientListWrapper />
            </>
          }
        />
        <Route
          path='create'
          element={
            <>
              <PageTitle>Criar Cliente</PageTitle>
              <ClientCreateWrapper />
            </>
          }
        />
      </Route>
      <Route
        path='client/:id'
        element={<ClientEdit />}
      />
      <Route index element={<Navigate to='/apps/client-management/clients' />} />
    </Routes>
  )
}

export default ClientsPage
