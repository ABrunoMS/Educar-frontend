import React from 'react'
import {KTCard} from '../../../../../_metronic/helpers'
import { ToolbarWrapper } from '../../../../../_metronic/layout/components/toolbar'
import { Content } from '../../../../../_metronic/layout/components/content'
import { ClassCreateForm } from './components/ClassCreateForm'

const ClassCreate = () => {
  return (
    <>
      <KTCard className='p-5 h-100'>
        <ClassCreateForm />
      </KTCard>
    </>
  )
}

const ClassCreateWrapper = () => (
  <div>
    <ToolbarWrapper />
    <Content>
      <ClassCreate />
    </Content>
  </div>
)

export {ClassCreateWrapper}
