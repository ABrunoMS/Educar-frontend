import React from 'react'
import {KTCard} from '../../../../../_metronic/helpers'
import { ToolbarWrapper } from '../../../../../_metronic/layout/components/toolbar'
import { Content } from '../../../../../_metronic/layout/components/content'
import { ClientCreateForm } from './components/ClientCreateForm'

const ClientCreate = () => {
  return (
    <>
      <KTCard className='p-5 h-100'>
        <ClientCreateForm />
      </KTCard>
    </>
  )
}

const ClientCreateWrapper = () => (
  <div>
    <ToolbarWrapper />
    <Content>
      <ClientCreate />
    </Content>
  </div>
)

export {ClientCreateWrapper}
