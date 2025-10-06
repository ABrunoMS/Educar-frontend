import React from 'react'
import { KTCard } from '../../../../../_metronic/helpers'
import { ToolbarWrapper } from '../../../../../_metronic/layout/components/toolbar'
import { Content } from '../../../../../_metronic/layout/components/content'
// Importe o componente de formulário
import LessonCreateForm from './components/LessonCreateForm'
// CORRIGIDO: O nome do arquivo LessonStepPage (singular)
import LessonStepPage from '../lesson-steps/LessonStepsPage'

// ----------------------------------------------------------------------
// Componente Principal para a tela de Etapas (LessonSteps)
// ----------------------------------------------------------------------
const LessonSteps = () => {
  return (
    <>
      <KTCard className='p-10'>
        {/* Agora usa o nome importado: LessonStepPage */}
        <LessonStepPage />
      </KTCard>
    </>
  )
}

// ----------------------------------------------------------------------
// Wrapper de Rotas para a tela de Etapas (LessonStepsWrapper)
// ----------------------------------------------------------------------
const LessonStepsWrapper = () => (
  <div>
    <ToolbarWrapper />
    <Content>
      <LessonSteps />
    </Content>
  </div>
)
// ----------------------------------------------------------------------

/**
 * Componente principal que renderiza o formulário dentro do KTCard.
 */
const LessonCreate = () => {
  return (
    <>
      <KTCard className='p-10'>
        <LessonCreateForm />
      </KTCard>
    </>
  )
}

/**
 * Wrapper que envolve o componente LessonCreate com a Toolbar e o Content do Metronic.
 */
const LessonCreateWrapper = () => (
  <div>
    <ToolbarWrapper />
    <Content>
      <LessonCreate />
    </Content>
  </div>
)

// Exportamos ambos os wrappers para serem usados no LessonsPage
export { LessonCreateWrapper, LessonStepsWrapper }