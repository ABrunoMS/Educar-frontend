import {useEffect, useState, ReactNode} from 'react'
import AsyncSelect from 'react-select/async'
import { getAccountsByRole } from '@services/Accounts'
import { ThemeModeComponent } from '../../../../../_metronic/assets/ts/layout/ThemeMode'
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
  const [lastLogin, setLastLogin] = useState<string | undefined>()
  const [macroRegionId, setMacroRegionId] = useState<string | undefined>()
  const [partner, setPartner] = useState<string | undefined>()
  const [contact, setContact] = useState<string | undefined>()

  const [macroRegions, setMacroRegions] = useState<Array<{id:string,name:string}>>([])

  useEffect(() => {
    import('@services/MacroRegions').then(mod => mod.getMacroRegions()).then(r => setMacroRegions(r.data || [])).catch(() => {})
  }, [])

  // Theme-aware styles for react-select
  const themeMode = ThemeModeComponent.getMode()
  const currentTheme = themeMode === 'system' ? ThemeModeComponent.getSystemMode() : themeMode
  const isDark = currentTheme === 'dark'

  const selectStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: isDark ? '#1e1e2f' : '#fff',
      borderColor: isDark ? '#444' : '#ccc',
      color: isDark ? '#fff' : '#000'
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: isDark ? '#1e1e2f' : '#fff',
      color: isDark ? '#fff' : '#000'
    }),
    singleValue: (provided: any) => ({ ...provided, color: isDark ? '#fff' : '#000' }),
    input: (provided: any) => ({ ...provided, color: isDark ? '#fff' : '#000' }),
    placeholder: (provided: any) => ({ ...provided, color: isDark ? '#aaa' : '#666' })
  }

  useEffect(() => {
    MenuComponent.reinitialization()
  }, [])

  const resetData = () => {
    if (onResetFilters) {
      onResetFilters()
    } else {
      updateState({filter: undefined, ...initialQueryState})
      setMacroRegionId(undefined)
      setPartner(undefined)
      setContact(undefined)
    }
  }

  const filterData = () => {
    if (onApplyFilters) {
      onApplyFilters()
    } else {
      updateState({
        filter: { last_login: lastLogin, macroRegionId, partner, contact },
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
                <label className='form-label fs-6 fw-bold'>Macro Região:</label>
                <AsyncSelect
                  cacheOptions
                  defaultOptions={macroRegions.map(m => ({ value: m.id, label: m.name }))}
                  loadOptions={(inputValue, callback) => {
                    const opts = macroRegions.map(m => ({ value: m.id, label: m.name }))
                    const filtered = inputValue ? opts.filter((o: any) => o.label.toLowerCase().includes(inputValue.toLowerCase())) : opts
                    callback(filtered)
                  }}
                  onChange={(selected: any) => setMacroRegionId(selected ? selected.value : undefined)}
                  value={macroRegionId ? { value: macroRegionId, label: macroRegions.find(m => m.id === macroRegionId)?.name || '' } : null}
                  isClearable
                  styles={selectStyles}
                />
              </div>

              <div className='mb-10'>
                <label className='form-label fs-6 fw-bold'>Parceiro:</label>
                <AsyncSelect
                  cacheOptions
                  defaultOptions
                  loadOptions={(inputValue, callback) => {
                    getAccountsByRole('Distribuidor', 1, 1000)
                      .then(res => {
                        const opts = (res.data.data || []).map((a: any) => ({ value: a.id, label: a.name || a.userName || a.email }))
                        const filtered = inputValue ? opts.filter((o: any) => o.label.toLowerCase().includes(inputValue.toLowerCase())) : opts
                        callback(filtered)
                      })
                      .catch(() => callback([]))
                  }}
                  onChange={(selected: any) => setPartner(selected ? selected.value : undefined)}
                  value={partner ? { value: partner, label: '' } : null}
                  isClearable
                  styles={selectStyles}
                />
              </div>

              <div className='mb-10'>
                <label className='form-label fs-6 fw-bold'>Contato:</label>
                <AsyncSelect
                  cacheOptions
                  defaultOptions
                  loadOptions={(inputValue, callback) => {
                    getAccountsByRole('AgenteComercial', 1, 1000)
                      .then(res => {
                        const opts = (res.data.data || []).map((a: any) => ({ value: a.id, label: a.name || a.userName || a.email }))
                        const filtered = inputValue ? opts.filter((o: any) => o.label.toLowerCase().includes(inputValue.toLowerCase())) : opts
                        callback(filtered)
                      })
                      .catch(() => callback([]))
                  }}
                  onChange={(selected: any) => setContact(selected ? selected.value : undefined)}
                  value={contact ? { value: contact, label: '' } : null}
                  isClearable
                  styles={selectStyles}
                />
              </div>
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
