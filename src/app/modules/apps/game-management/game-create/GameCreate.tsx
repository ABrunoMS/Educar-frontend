import React from 'react'
import {KTCard} from '../../../../../_metronic/helpers'
import { ToolbarWrapper } from '../../../../../_metronic/layout/components/toolbar'
import { Content } from '../../../../../_metronic/layout/components/content'
import { GameCreateForm } from './components/GameCreateForm'

const GameCreate = () => {
  return (
    <>
      <KTCard className='p-5 h-100'>
        <GameCreateForm />
      </KTCard>
    </>
  )
}

const GameCreateWrapper = () => (
  <div>
    <ToolbarWrapper />
    <Content>
      <GameCreate />
    </Content>
  </div>
)

export {GameCreateWrapper}
