import React from 'react'
import {KTCard} from '../../../../../_metronic/helpers'
import { ToolbarWrapper } from '../../../../../_metronic/layout/components/toolbar'
import { Content } from '../../../../../_metronic/layout/components/content'
import { AddressCreateForm } from './components/AddressCreateForm'

const AddressCreate = () => {
  return (
    <>
      <KTCard className='p-5 h-100'>
        <AddressCreateForm />
      </KTCard>
    </>
  )
}

const AddressCreateWrapper = () => (
  <div>
    <ToolbarWrapper />
    <Content>
      <AddressCreate />
    </Content>
  </div>
)

export {AddressCreateWrapper}
