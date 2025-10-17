import { Route, Routes, Outlet, Navigate } from 'react-router-dom'
import { PageTitle } from '../../../../_metronic/layout/core'
import { ClassCreateWrapper } from './class-create/ClassCreate'
import { ClassListWrapper } from './class-list/ClassList';
import { ClassEditWrapper } from './class-edit/ClassEdit';

const ClassPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='class/:id'
          element={
            <>
              <PageTitle>Editar Classe</PageTitle>
              <ClassEditWrapper />
            </>
          }
        />
        <Route
          path='classes'
          element={
            <>
              <PageTitle>Listagem de classes</PageTitle>
              <ClassListWrapper />
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
      <Route index element={<Navigate to='/apps/class-management/classes' />} />
    </Routes>
  )
}

export default ClassPage
