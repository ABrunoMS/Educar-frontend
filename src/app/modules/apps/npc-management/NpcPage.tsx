import { Route, Routes, Outlet, Navigate } from 'react-router-dom'
import { PageTitle } from '../../../../_metronic/layout/core'
import { NpcCreateWrapper } from './npc-create/NpcCreate'
// import { UsersListWrapper } from '../user-management/users-list/UsersList'

const ClassPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='npcs'
          element={
            <>
              <PageTitle>Listagem de Npcs</PageTitle>
              {/* <UsersListWrapper /> */}
            </>
          }
        />
        <Route
          path='create'
          element={
            <>
              <PageTitle>Criar Npc</PageTitle>
              <NpcCreateWrapper />
            </>
          }
        />
      </Route>
      <Route index element={<Navigate to='/apps/npc-management/npcs' />} />
    </Routes>
  )
}

export default ClassPage
