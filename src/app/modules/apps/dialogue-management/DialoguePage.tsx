import { Route, Routes, Outlet, Navigate } from 'react-router-dom'
import { PageTitle } from '../../../../_metronic/layout/core'
import { DialogueCreateWrapper } from './dialogue-create/DialogueCreate'
// import { UsersListWrapper } from '../user-management/users-list/UsersList'

const DialoguePage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='dialogues'
          element={
            <>
              <PageTitle>Listagem de dialogos</PageTitle>
              {/* <UsersListWrapper /> */}
            </>
          }
        />
        <Route
          path='create'
          element={
            <>
              <PageTitle>Criar dialogo</PageTitle>
              <DialogueCreateWrapper />
            </>
          }
        />
      </Route>
      <Route index element={<Navigate to='/apps/client-management/clients' />} />
    </Routes>
  )
}

export default DialoguePage
