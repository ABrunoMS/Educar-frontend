import React from 'react'
import {KTCard} from '@metronic/helpers'
import { ToolbarWrapper } from '@metronic/layout/components/toolbar'
import { Content } from '@metronic/layout/components/content'
import { SubjectCreateForm } from './components/SubjectCreateForm'

const SubjectCreate = () => {
  return (
    <>
      <KTCard className='p-5 h-100'>
        <SubjectCreateForm />
      </KTCard>
    </>
  )
}

const SubjectCreateWrapper = () => (
  <div>
    <ToolbarWrapper />
    <Content>
      <SubjectCreate />
    </Content>
  </div>
)

export {SubjectCreateWrapper}
