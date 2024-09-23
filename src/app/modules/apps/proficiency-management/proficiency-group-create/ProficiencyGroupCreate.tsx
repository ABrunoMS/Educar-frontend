import React from 'react'
import {KTCard} from '../../../../../_metronic/helpers'
import { ToolbarWrapper } from '../../../../../_metronic/layout/components/toolbar'
import { Content } from '../../../../../_metronic/layout/components/content'
import { ProficiencyGroupCreateForm } from './components/ProficiencyGroupCreateForm'

const ProficiencyGroupCreate = () => {
  return (
    <>
      <KTCard className='p-5 h-100'>
        <ProficiencyGroupCreateForm />
      </KTCard>
    </>
  )
}

const ProficiencyGroupCreateWrapper = () => (
  <div>
    <ToolbarWrapper />
    <Content>
      <ProficiencyGroupCreate />
    </Content>
  </div>
)

export {ProficiencyGroupCreateWrapper}
