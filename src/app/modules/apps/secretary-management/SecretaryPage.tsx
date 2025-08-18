import { Route, Routes, Outlet, Navigate } from 'react-router-dom'
import { PageTitle } from '../../../../_metronic/layout/core'
import { SecretaryCreateWrapper } from './secretary-create/SecretaryCreate'
import { SecretaryListWrapper } from './secretary-list/SecretaryList'

const SecretaryPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='secretaries'
          element={
            <>
              <PageTitle>Listagem de Secretarias</PageTitle>
              <SecretaryListWrapper />
            </>
          }
        />
        <Route
          path='create'
          element={
            <>
              <PageTitle>Criar Secretaria</PageTitle>
              <SecretaryCreateWrapper />
            </>
          }
        />
      </Route>
      <Route index element={<Navigate to='/apps/secretary-management/secretaries' />} />
    </Routes>
  )
}

export default SecretaryPage
