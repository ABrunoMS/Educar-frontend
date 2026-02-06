import { Route, Routes, Outlet, Navigate } from 'react-router-dom'
import { PageTitle } from '../../../../_metronic/layout/core'
import { ClassCreateWrapper } from './class-create/ClassCreate'
import { ClassListWrapper } from './class-list/ClassList';
import { ClassEditWrapper } from './class-edit/ClassEdit';
import { useRole } from '@contexts/RoleContext';

const ClassPage = () => {
  const { canEdit, isReadOnly } = useRole()

  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='class/:id'
          element={
            <>
              <PageTitle>{isReadOnly() ? 'Visualizar Turma' : 'Editar Turma'}</PageTitle>
              <ClassEditWrapper />
            </>
          }
        />
        <Route
          path='classes'
          element={
            <>
              <PageTitle>Listagem de turmas</PageTitle>
              <ClassListWrapper />
            </>
          }
        />
        {/* Rota de criação - apenas para quem pode editar */}
        {canEdit() ? (
          <Route
            path='create'
            element={
              <>
                <PageTitle>Criar turma</PageTitle>
                <ClassCreateWrapper />
              </>
            }
          />
        ) : (
          <Route path='create' element={<Navigate to='/apps/class-management/classes' replace />} />
        )}
      </Route>
      <Route index element={<Navigate to='/apps/class-management/classes' />} />
    </Routes>
  )
}

export default ClassPage
