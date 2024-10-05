import { Route, Routes, Outlet, Navigate } from 'react-router-dom'
import { PageTitle } from '../../../../_metronic/layout/core'
import { GameCreateWrapper } from './game-create/GameCreate'
import { GameListWrapper } from './game-list/GameList';
import { GameEditWrapper } from './game-edit/GameEdit';

const ContractPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='game/{id}'
          element={
            <>
              <PageTitle>Editar Jogo</PageTitle>
              <GameEditWrapper />
            </>
          }
        />
        <Route
          path='games'
          element={
            <>
              <PageTitle>Listagem de Jogos</PageTitle>
              <GameListWrapper />
            </>
          }
        />
        <Route
          path='create'
          element={
            <>
              <PageTitle>Criar jogo</PageTitle>
              <GameCreateWrapper />
            </>
          }
        />
      </Route>
      <Route index element={<Navigate to='/apps/client-management/clients' />} />
    </Routes>
  )
}

export default ContractPage
