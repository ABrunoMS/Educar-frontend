import React from 'react'
import {KTCard} from '../../../../../_metronic/helpers'
import { ToolbarWrapper } from '../../../../../_metronic/layout/components/toolbar'
import { Content } from '../../../../../_metronic/layout/components/content'
import { ClassCreateForm } from './components/ClassCreateForm'
import { useNavigate } from 'react-router'


const ClassCreate = () => {

  const navigate = useNavigate()

  const handleFormSubmit = () => {
    navigate('/apps/class-management/classes')
  }

  return (
    <>
      <KTCard className='p-5 h-100'>
        <ClassCreateForm onFormSubmit={handleFormSubmit} />
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
