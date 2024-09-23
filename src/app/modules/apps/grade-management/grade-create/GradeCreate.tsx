import React from 'react'
import {KTCard} from '../../../../../_metronic/helpers'
import { ToolbarWrapper } from '../../../../../_metronic/layout/components/toolbar'
import { Content } from '../../../../../_metronic/layout/components/content'
import { GradeCreateForm } from './components/GradeCreateForm'

const GradeCreate = () => {
  return (
    <>
      <KTCard className='p-5 h-100'>
        <GradeCreateForm />
      </KTCard>
    </>
  )
}

const GradeCreateWrapper = () => (
  <div>
    <ToolbarWrapper />
    <Content>
      <GradeCreate />
    </Content>
  </div>
)

export {GradeCreateWrapper}
