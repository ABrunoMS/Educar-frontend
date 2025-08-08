import { Route, Routes, Outlet, Navigate } from 'react-router-dom';
import { PageTitle } from '@metronic/layout/core';
import { ProficiencyCreateWrapper } from './proficiency-create/ProficiencyCreate';
import { ProficiencyListWrapper } from './proficiency-list/ProficiencyList';
import { ProficiencyEditWrapper } from './proficiency-edit/ProficiencyEdit';
import { ProficiencyGroupCreateWrapper } from './proficiency-group-create/ProficiencyGroupCreate'
import { ProficiencyGroupEditWrapper } from './proficiency-group-edit/ProficiencyGroupEdit';
import { ProficiencyGroupListWrapper } from './proficiency-group-list/ProficiencyGroupList';

const ProficiencyPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='proficiency/:id'
          element={
            <>
              <PageTitle>Editar habilidade</PageTitle>
              <ProficiencyEditWrapper />
            </>
          }
        />
        <Route
          path='proficiencies'
          element={
            <>
              <PageTitle>Listagem de habilidades</PageTitle>
              <ProficiencyListWrapper />
            </>
          }
        />
        <Route
          path='create'
          element={
            <>
              <PageTitle>Criar habilidade</PageTitle>
              <ProficiencyCreateWrapper />
            </>
          }
        />
      </Route>
      <Route
          path='proficiency-group/:id'
          element={
            <>
              <PageTitle>Editar grupo</PageTitle>
              <ProficiencyGroupEditWrapper />
            </>
          }
        />
        <Route
          path='groups'
          element={
            <>
              <PageTitle>Listagem de grupos</PageTitle>
              <ProficiencyGroupListWrapper />
            </>
          }
        />
        <Route
          path='group-create'
          element={
            <>
              <PageTitle>Criar grupo</PageTitle>
              <ProficiencyGroupCreateWrapper />
            </>
          }
        />
      <Route index element={<Navigate to='/apps/proficiency-management/proficiencies' />} />
    </Routes>
  );
};

export default ProficiencyPage;