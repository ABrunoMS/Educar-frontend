import { Route, Routes, Outlet, Navigate } from 'react-router-dom';
import { PageTitle } from '@metronic/layout/core';
import { ProficiencyCreateWrapper } from './proficiency-create/ProficiencyCreate';
import { ProficiencyGroupCreateWrapper } from './proficiency-group-create/ProficiencyGroupCreate'
import { ProficiencyListWrapper } from './proficiency-list/ProficiencyList';
import { ProficiencyEditWrapper } from './proficiency-edit/ProficiencyEdit';

const ProficiencyPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='proficiency/{id}'
          element={
            <>
              <PageTitle>Editar proficiência</PageTitle>
              <ProficiencyEditWrapper />
            </>
          }
        />
        <Route
          path='proficiencies'
          element={
            <>
              <PageTitle>Listagem de proficiências</PageTitle>
              <ProficiencyListWrapper />
            </>
          }
        />
        <Route
          path='create'
          element={
            <>
              <PageTitle>Criar proficiência</PageTitle>
              <ProficiencyCreateWrapper />
            </>
          }
        />
      </Route>
      <Route
        path='group-create'
        element={
          <>
            <PageTitle>Criar Grupos</PageTitle>
            <ProficiencyGroupCreateWrapper />
          </>
        }
      />
      <Route index element={<Navigate to='/apps/proficiency-management/proficiencies' />} />
    </Routes>
  );
};

export default ProficiencyPage;