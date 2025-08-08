import React from 'react'
import {KTCard} from '../../../../../_metronic/helpers'
import { ToolbarWrapper } from '../../../../../_metronic/layout/components/toolbar'
import { Content } from '../../../../../_metronic/layout/components/content'
import { ContractCreateForm } from './components/ContractCreateForm'

const ContractCreate = () => {
  return (
    <>
      <KTCard className='p-5 h-100'>
        <ContractCreateForm />
      </KTCard>
    </>
  )
}

const ContractCreateWrapper = () => (
  <div>
    <ToolbarWrapper />
    <Content>
      <ContractCreate />
    </Content>
  </div>
)

export {ContractCreateWrapper}
