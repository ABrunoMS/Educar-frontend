import React from 'react'
import {KTCard} from '../../../../../_metronic/helpers'
import { ToolbarWrapper } from '../../../../../_metronic/layout/components/toolbar'
import { Content } from '../../../../../_metronic/layout/components/content'
import { DialogueCreateForm } from './components/DialogueCreateForm'

const DialogueCreate = () => {
  return (
    <>
      <KTCard className='p-5 h-100'>
        <DialogueCreateForm />
      </KTCard>
    </>
  )
}

const DialogueCreateWrapper = () => (
  <div>
    <ToolbarWrapper />
    <Content>
      <DialogueCreate />
    </Content>
  </div>
)

export {DialogueCreateWrapper}
