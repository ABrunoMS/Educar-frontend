import { Route, Routes, Outlet, Navigate } from 'react-router-dom'
import { PageTitle } from '../../../../_metronic/layout/core'
import { ProficiencyCreateWrapper } from './proficiency-create/ProficiencyCreate'
import { ProficiencyGroupCreateWrapper } from './proficiency-group-create/ProficiencyGroupCreate'
// import { UsersListWrapper } from '../user-management/users-list/UsersList'

const ProficiencyPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='proficiencies'
          element={
            <>
              <PageTitle>Listagem de Proficiencies</PageTitle>
              {/* <UsersListWrapper /> */}
            </>
          }
        />
        <Route
          path='create'
          element={
            <>
              <PageTitle>Criar Proficiency</PageTitle>
              <ProficiencyCreateWrapper />
            </>
          }
        />
        <Route
          path='group-create'
          element={
            <>
              <PageTitle>Criar ProficiencyGroup</PageTitle>
              <ProficiencyGroupCreateWrapper />
            </>
          }
        />
      </Route>
      <Route index element={<Navigate to='/apps/proficiency-management/proficiencies' />} />
    </Routes>
  )
}

export default ProficiencyPage
