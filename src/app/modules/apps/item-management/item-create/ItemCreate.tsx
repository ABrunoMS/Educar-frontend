import React from 'react'
import {KTCard} from '../../../../../_metronic/helpers'
import { ToolbarWrapper } from '../../../../../_metronic/layout/components/toolbar'
import { Content } from '../../../../../_metronic/layout/components/content'
import { ItemCreateForm } from './components/ItemCreateForm'

const ItemCreate = () => {
  return (
    <>
      <KTCard className='p-5 h-100'>
        <ItemCreateForm />
      </KTCard>
    </>
  )
}

const ItemCreateWrapper = () => (
  <div>
    <ToolbarWrapper />
    <Content>
      <ItemCreate />
    </Content>
  </div>
)

export {ItemCreateWrapper}
