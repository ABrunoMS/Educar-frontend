
import { FC, useEffect } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { Link } from 'react-router-dom'
import { MenuComponent } from '@metronic/assets/ts/components'
import { ID, KTIcon, QUERIES } from '@metronic/helpers'
import { useQueryResponse } from '../../core/QueryResponseProvider'
import { deleteUser } from '../../core/_requests'

type Props = {
  id: ID,
  editPath: string,
  callbackFunction: (id: ID) => void
}

const ActionsCell: FC<Props> = ({id, editPath, callbackFunction}) => {
  const {query} = useQueryResponse()
  const queryClient = useQueryClient()

  useEffect(() => {
    MenuComponent.reinitialization()
  }, [])

  return (
    <>
      <a
        href='#'
        className='btn btn-light btn-active-light-primary btn-sm'
        data-kt-menu-trigger='click'
        data-kt-menu-placement='bottom-end'
      >
        Ações
        <KTIcon iconName='down' className='fs-5 m-0' />
      </a>
      {/* begin::Menu */}
      <div
        className='menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-bold fs-7 w-125px py-4'
        data-kt-menu='true'
      >
        {/* begin::Menu item */}
        <div className='menu-item px-3'>
          <Link
            to={`${editPath}/${id}`}
            className='menu-link px-3'
          >
          <i className="bi bi-pencil-square fs-5 me-2"></i>Editar
          </Link>
        </div>
        {/* end::Menu item */}

        {/* begin::Menu item */}
        <div className='menu-item px-3'>
          <a
            className='menu-link btn-icon px-3 text-danger'
            data-kt-users-table-filter='delete_row'
            onClick={() => callbackFunction(id)}
          >
            <i className="bi bi-trash-fill fs-5 me-2 text-danger"></i>Remover
          </a>
        </div>
        {/* end::Menu item */}
      </div>
      {/* end::Menu */}
    </>
  )
}

export { ActionsCell }
