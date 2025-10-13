import React from 'react'
import {KTCard} from '../../../../../_metronic/helpers'
import { ToolbarWrapper } from '../../../../../_metronic/layout/components/toolbar'
import { Content } from '../../../../../_metronic/layout/components/content'
import { AccountCreateForm } from './components/AccountCreateForm'
import { useNavigate } from 'react-router-dom'


const AccountCreate = () => {
  const navigate = useNavigate();

   const handleFormSubmit = () => {
    navigate('/apps/account-management/accounts')
    
  };

  return (
    <>
      <KTCard className='p-5 h-100'>
        <AccountCreateForm onFormSubmit={handleFormSubmit} />
      </KTCard>
    </>
  )
}

const AccountCreateWrapper = () => (
  <div>
    <ToolbarWrapper />
    <Content>
      <AccountCreate />
    </Content>
  </div>
)

export {AccountCreateWrapper}
