import { Route, Routes, Outlet, Navigate } from 'react-router-dom'
import { PageTitle } from '@metronic/layout/core'
import { SubjectCreateWrapper } from './subject-create/SubjectCreate'
import { SubjectListWrapper } from './subject-list/SubjectList'
import { SubjectEditWrapper } from './subject-edit/SubjectEdit'

const ContractPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='subject/{id}'
          element={
            <>
              <PageTitle>Editar discipina</PageTitle>
              <SubjectEditWrapper />
            </>
          }
        />
        <Route
          path='subjects'
          element={
            <>
              <PageTitle>Listagem de discipinas</PageTitle>
              <SubjectListWrapper />
            </>
          }
        />
        <Route
          path='create'
          element={
            <>
              <PageTitle>Criar disciplina</PageTitle>
              <SubjectCreateWrapper />
            </>
          }
        />
      </Route>
      <Route index element={<Navigate to='/apps/subject-management/subjects' />} />
    </Routes>
  )
}

export default ContractPage
