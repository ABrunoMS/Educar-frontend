import { Route, Routes, Outlet, Navigate } from 'react-router-dom'
// CORREÇÃO: Usando o caminho de alias ou caminho relativo que o Metronic costuma usar, 
// baseando-se na importação original que você forneceu: '@metronic/layout/core'
import { PageTitle } from '@metronic/layout/core' 

// Importe o novo LessonStepsWrapper do seu LessonCreate
import { LessonCreateWrapper, LessonStepsWrapper } from './lesson-create/LessonCreate' 
// CORREÇÃO: Usando o caminho que você sugeriu inicialmente (relativo ao LessonsPage.tsx)
import { LessonListWrapper } from './lesson-list/LessonList' 

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