import React from 'react'
import {KTCard} from '../../../../../_metronic/helpers'
import { ToolbarWrapper } from '../../../../../_metronic/layout/components/toolbar'
import { Content } from '../../../../../_metronic/layout/components/content'
import { SecretaryCreateForm } from './components/SecretaryCreateForm'

const SecretaryCreate = () => {
  return (
    <>
      <KTCard className='p-5 h-100'>
        <SecretaryCreateForm />
      </KTCard>
    </>
  )
}

const SecretaryCreateWrapper = () => (
  <div>
    <ToolbarWrapper />
    <Content>
      <SecretaryCreate />
    </Content>
  </div>
)

export {SecretaryCreateWrapper}
