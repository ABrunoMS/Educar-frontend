import { Route, Routes, Outlet, Navigate } from 'react-router-dom'
import { PageTitle } from '@metronic/layout/core' 

import { LessonCreateWrapper, LessonStepsWrapper } from './lesson-create/LessonCreate' 
import { LessonListWrapper } from './lesson-list/LessonList' 
import { LessonEdit } from './lesson-edit/LessonEdit' 

const LessonsPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        {/* Rota para a Listagem de Aulas */}
        <Route
          path='lessons' 
          element={
            <>
              <PageTitle>Listagem de Aulas</PageTitle>
              <LessonListWrapper />
            </>
          }
        />
        {/* Rota para a Criação de Aula */}
        <Route
          path='create'
          element={
            <>
              <PageTitle>Criar Aula</PageTitle>
              <LessonCreateWrapper />
            </>
          }
        />
        {/* NOVA ROTA DINÂMICA PARA GERENCIAMENTO DE ETAPAS */}
        <Route
          path='steps/:lessonId' 
          element={
            <>
              <PageTitle>Gerenciamento de Etapas</PageTitle>
              <LessonStepsWrapper />
            </>
          }
        />
      </Route>
      
      {/* Rota de índice para redirecionar para a lista de aulas */}
      <Route index element={<Navigate to='/apps/lesson-management/lessons' />} />
    </Routes>
  )
}

export default LessonsPage