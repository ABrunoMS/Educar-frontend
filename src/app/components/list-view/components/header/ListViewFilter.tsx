import {useEffect, useState, ReactNode} from 'react'
import {MenuComponent} from '@metronic/assets/ts/components'
import {initialQueryState, KTIcon} from '@metronic/helpers'
import {useQueryRequest} from '../../core/QueryRequestProvider'
import {useQueryResponse} from '../../core/QueryResponseProvider'

interface ListViewFilterProps {
  customFilters?: ReactNode;
  onResetFilters?: () => void;
  onApplyFilters?: () => void;
}

const ListViewFilter = ({ customFilters, onResetFilters, onApplyFilters }: ListViewFilterProps) => {
  const { updateState } = useQueryRequest()
  const { isLoading } = useQueryResponse()
  const [role, setRole] = useState<string | undefined>()
  const [lastLogin, setLastLogin] = useState<string | undefined>()

  useEffect(() => {
    MenuComponent.reinitialization()
  }, [])

  const resetData = () => {
    if (onResetFilters) {
      onResetFilters()
    } else {
      updateState({filter: undefined, ...initialQueryState})
    }
  }

  const filterData = () => {
    if (onApplyFilters) {
      onApplyFilters()
    } else {
      updateState({
        filter: {role, last_login: lastLogin},
        ...initialQueryState,
      })
    }
  }

  return (
    <>
      {/* begin::Filter Button */}
      <button
        disabled={isLoading}
        type='button'
        className='btn btn-light-primary me-3'
        data-kt-menu-trigger='click'
        data-kt-menu-placement='bottom-end'
      >
        <KTIcon iconName='filter' className='fs-2' />
        Filtros
      </button>
      {/* end::Filter Button */}
      {/* begin::SubMenu */}
      <div className='menu menu-sub menu-sub-dropdown w-300px w-md-325px' data-kt-menu='true'>
        {/* begin::Header */}
        <div className='px-7 py-5'>
          <div className='fs-5 text-gray-900 fw-bolder'>Opções de filtro</div>
        </div>
        {/* end::Header */}

        {/* begin::Separator */}
        <div className='separator border-gray-200'></div>
        {/* end::Separator */}

        {/* begin::Content */}
        <div className='px-7 py-5' data-kt-user-table-filter='form'>
          {/* Render custom filters if provided, otherwise show default filters */}
          {customFilters ? (
            customFilters
          ) : (
            <>
              {/* begin::Input group */}
              <div className='mb-10'>
                <label className='form-label fs-6 fw-bold'>Perfil:</label>
                <select
                  className='form-select form-select-solid fw-bolder'
                  data-kt-select2='true'
                  data-placeholder='Select option'
                  data-allow-clear='true'
                  data-kt-user-table-filter='role'
                  data-hide-search='true'
                  onChange={(e) => setRole(e.target.value)}
                  value={role}
                >
                  <option value=''></option>
                  <option value='Administrator'>Admin</option>
                  <option value='Analyst'>Aluno</option>
                  <option value='Developer'>Professor</option>
                </select>
              </div>
              {/* end::Input group */}
            </>
          )}

          {/* begin::Actions */}
          <div className='d-flex justify-content-end'>
            <button
              type='button'
              disabled={isLoading}
              onClick={resetData}
              className='btn btn-light btn-active-light-primary fw-bold me-2 px-6'
              data-kt-menu-dismiss='true'
              data-kt-user-table-filter='reset'
            >
              Limpar
            </button>
            <button
              disabled={isLoading}
              type='button'
              onClick={filterData}
              className='btn btn-primary fw-bold px-6'
              data-kt-menu-dismiss='true'
              data-kt-user-table-filter='filter'
            >
              Aplicar
            </button>
          </div>
          {/* end::Actions */}
        </div>
        {/* end::Content */}
      </div>
      {/* end::SubMenu */}
    </>
  )
}

export { ListViewFilter }
