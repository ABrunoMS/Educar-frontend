import { Route, Routes, Outlet, Navigate } from 'react-router-dom'
import { PageTitle } from '../../../../_metronic/layout/core'
import { SchoolCreateWrapper } from './school-create/SchoolCreate'
import { SchoolEditWrapper } from './school-edit/SchoolEdit'
import { SchoolListWrapper } from './school-list/SchoolList'
import { useRole } from '@contexts/RoleContext'


const SchoolPage = () => {
  const { canEdit, isReadOnly } = useRole()

  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='school/:id'
          element={
            <>
              <PageTitle>{isReadOnly() ? 'Visualizar Escola' : 'Editar Escola'}</PageTitle>
              <SchoolEditWrapper />
            </>
          }
        />
        <Route
          path='schools'
          element={
            <>
              <PageTitle>Listagem de escolas</PageTitle>
              <SchoolListWrapper />
            </>
          }
        />
        {/* Rota de criação - apenas para quem pode editar */}
        {canEdit() ? (
          <Route
            path='create'
            element={
              <>
                <PageTitle>Criar escola</PageTitle>
                <SchoolCreateWrapper />
              </>
            }
          />
        ) : (
          <Route path='create' element={<Navigate to='/apps/school-management/schools' replace />} />
        )}
      </Route>
      <Route index element={<Navigate to='/apps/school-management/schools' />} />
    </Routes>
  )
}

export default SchoolPage
