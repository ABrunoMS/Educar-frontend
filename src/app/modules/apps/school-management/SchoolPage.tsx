import { Route, Routes, Outlet, Navigate } from 'react-router-dom'
import { PageTitle } from '../../../../_metronic/layout/core'
import { SchoolCreateWrapper } from './school-create/SchoolCreate'

import { SchoolListWrapper } from './school-list/SchoolList'


const SchoolPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='schools'
          element={
            <>
              <PageTitle>Listagem de escolas</PageTitle>

              <SchoolListWrapper />

            </>
          }
        />
        <Route
          path='create'
          element={
            <>
              <PageTitle>Criar escola</PageTitle>
              <SchoolCreateWrapper />
            </>
          }
        />
      </Route>
      <Route index element={<Navigate to='/apps/school-management/schools' />} />
    </Routes>
  )
}

export default SchoolPage
