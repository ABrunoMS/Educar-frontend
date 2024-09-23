import React, {FC} from 'react'
import {useIntl} from 'react-intl'
import {PageTitle} from '../../../_metronic/layout/core'
import OrganizationSelectPage from './OrganizationSelect'

const OrganizationSelectWrapper: FC = () => {
  const intl = useIntl()

  return (
    <>
      <PageTitle breadcrumbs={[]}>{intl.formatMessage({id: 'ORGANIZATION_SELECT.TITLE'})}</PageTitle>
      <OrganizationSelectPage />
    </>
  )
}

export {OrganizationSelectWrapper}
