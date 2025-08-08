import { Route, Routes, Outlet, Navigate } from 'react-router-dom';
import { PageTitle } from '@metronic/layout/core';
import { GradeCreateWrapper } from './grade-create/GradeCreate';
import { GradeListWrapper } from './grade-list/GradeList';
import { GradeEditWrapper } from './grade-edit/GradeEdit';

const GradePage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='grade/:id'
          element={
            <>
              <PageTitle>Editar nota</PageTitle>
              <GradeEditWrapper />
            </>
          }
        />
        <Route
          path='grades'
          element={
            <>
              <PageTitle>Listagem de notas</PageTitle>
              <GradeListWrapper />
            </>
          }
        />
        <Route
          path='create'
          element={
            <>
              <PageTitle>Criar Nota</PageTitle>
              <GradeCreateWrapper />
            </>
          }
        />
      </Route>
      <Route index element={<Navigate to='/apps/grade-management/grades' />} />
    </Routes>
  );
};

export default GradePage;