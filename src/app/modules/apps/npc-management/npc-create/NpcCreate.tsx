import React from 'react'
import {KTCard} from '../../../../../_metronic/helpers'
import { ToolbarWrapper } from '../../../../../_metronic/layout/components/toolbar'
import { Content } from '../../../../../_metronic/layout/components/content'
import { NpcCreateForm } from './components/NpcCreateForm'

const NpcCreate = () => {
  return (
    <>
      <KTCard className='p-5 h-100'>
        <NpcCreateForm />
      </KTCard>
    </>
  )
}

const NpcCreateWrapper = () => (
  <div>
    <ToolbarWrapper />
    <Content>
      <NpcCreate />
    </Content>
  </div>
)

export {NpcCreateWrapper}
