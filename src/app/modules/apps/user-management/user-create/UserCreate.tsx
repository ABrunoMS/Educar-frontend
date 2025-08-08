import React from 'react'
import {KTCard} from '../../../../../_metronic/helpers'
import { ToolbarWrapper } from '../../../../../_metronic/layout/components/toolbar'
import { Content } from '../../../../../_metronic/layout/components/content'
import { UserCreateForm } from './components/UserCreateForm'

const UsersCreate = () => {
  return (
    <>
      <KTCard className='p-5 h-100'>
        <UserCreateForm />
      </KTCard>
    </>
  )
}

const UserCreateWrapper = () => (
  <div>
    <ToolbarWrapper />
    <Content>
      <UsersCreate />
    </Content>
  </div>
)

export {UserCreateWrapper}
