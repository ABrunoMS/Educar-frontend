import React from 'react'
import {KTCard} from '../../../../../_metronic/helpers'
import { ToolbarWrapper } from '../../../../../_metronic/layout/components/toolbar'
import { Content } from '../../../../../_metronic/layout/components/content'
import { ProficiencyCreateForm } from './components/ProficiencyCreateForm'

const ProficiencyCreate = () => {
  return (
    <>
      <KTCard className='p-5 h-100'>
        <ProficiencyCreateForm />
      </KTCard>
    </>
  )
}

const ProficiencyCreateWrapper = () => (
  <div>
    <ToolbarWrapper />
    <Content>
      <ProficiencyCreate />
    </Content>
  </div>
)

export {ProficiencyCreateWrapper}
