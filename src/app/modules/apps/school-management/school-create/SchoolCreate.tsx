import React from 'react'
import {KTCard} from '../../../../../_metronic/helpers'
import { ToolbarWrapper } from '../../../../../_metronic/layout/components/toolbar'
import { Content } from '../../../../../_metronic/layout/components/content'
import { SchoolCreateForm } from './components/SchoolCreateForm'

const SchoolCreate = () => {
  return (
    <>
      <KTCard className='p-5 h-100'>
        <SchoolCreateForm />
      </KTCard>
    </>
  )
}

const SchoolCreateWrapper = () => (
  <div>
    <ToolbarWrapper />
    <Content>
      <SchoolCreate />
    </Content>
  </div>
)

export {SchoolCreateWrapper}
