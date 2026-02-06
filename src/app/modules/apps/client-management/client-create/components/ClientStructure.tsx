import React, { FC, useState, useEffect } from 'react'
import { SubsecretariaDto, RegionalDto } from '@interfaces/Client'
import { SelectOption, CreateOptionModal } from './CreateOptionModal'
import { getAccountsByRole } from '@services/Accounts'

type Props = {
  clientId?: string
  subsecretarias: SubsecretariaDto[]
  onSubsecretariasChange: (subsecretarias: SubsecretariaDto[]) => void
  readOnly?: boolean
}

const ClientStructure: FC<Props> = ({ 
  clientId, 
  subsecretarias, 
  onSubsecretariasChange,
  readOnly = false 
}) => {
  // Estados para modais
  const [showSubsecretariaModal, setShowSubsecretariaModal] = useState(false)
  const [showRegionalModal, setShowRegionalModal] = useState(false)
  const [regionalModalSubsecretariaName, setRegionalModalSubsecretariaName] = useState<string>('')
  
  // Estados para edição
  const [editingSubsecretaria, setEditingSubsecretaria] = useState<SubsecretariaDto | null>(null)
  const [editingRegional, setEditingRegional] = useState<{regional: RegionalDto, subsecretariaName: string} | null>(null)

  // Estados para secretários
  const [subsecretarioOptions, setSubsecretarioOptions] = useState<SelectOption[]>([])
  const [secretarioRegionalOptions, setSecretarioRegionalOptions] = useState<SelectOption[]>([])
  const [isLoadingSubsecretarios, setIsLoadingSubsecretarios] = useState(false)
  const [isLoadingSecretariosRegionais, setIsLoadingSecretariosRegionais] = useState(false)

  // Carregar options de secretários
  useEffect(() => {
    const loadSubsecretarios = async () => {
      setIsLoadingSubsecretarios(true)
      try {
        const response = await getAccountsByRole('Subsecretario')
        const options = (response.data.items || []).map((acc: any) => ({
          label: acc.name || acc.email,
          value: acc.id
        }))
        setSubsecretarioOptions(options)
      } catch (error) {
        console.error('Erro ao carregar subsecretários:', error)
      } finally {
        setIsLoadingSubsecretarios(false)
      }
    }

    const loadSecretariosRegionais = async () => {
      setIsLoadingSecretariosRegionais(true)
      try {
        const response = await getAccountsByRole('SecretarioRegional')
        const options = (response.data.items || []).map((acc: any) => ({
          label: acc.name || acc.email,
          value: acc.id
        }))
        setSecretarioRegionalOptions(options)
      } catch (error) {
        console.error('Erro ao carregar secretários regionais:', error)
      } finally {
        setIsLoadingSecretariosRegionais(false)
      }
    }

    if (!readOnly) {
      loadSubsecretarios()
      loadSecretariosRegionais()
    }
  }, [readOnly])

  // Calcular estatísticas gerais
  const totalSubsecretarias = subsecretarias.length
  const totalRegionais = subsecretarias.reduce((acc, sub) => acc + (sub.regionais?.length || 0), 0)
  const totalSchools = subsecretarias.reduce((acc, sub) => acc + (sub.totalSchools || 0), 0)
  const subsWithResponsible = subsecretarias.filter(s => s.subsecretarioId).length
  const regsWithResponsible = subsecretarias.reduce((acc, sub) => 
    acc + (sub.regionais?.filter(r => r.secretarioRegionalId).length || 0), 0)

  // Handlers para Subsecretarias
  const handleAddSubsecretaria = (name: string, secretarioId?: string) => {
    const secretarioName = subsecretarioOptions.find(o => o.value === secretarioId)?.label
    const newSubsecretaria: SubsecretariaDto = {
      name,
      subsecretarioId: secretarioId,
      subsecretarioName: secretarioName,
      regionais: [],
      totalSchools: 0
    }
    onSubsecretariasChange([...subsecretarias, newSubsecretaria])
    setShowSubsecretariaModal(false)
  }

  const handleEditSubsecretaria = (sub: SubsecretariaDto) => {
    setEditingSubsecretaria(sub)
    setShowSubsecretariaModal(true)
  }

  const handleUpdateSubsecretaria = (name: string, secretarioId?: string) => {
    if (!editingSubsecretaria) return
    
    const secretarioName = subsecretarioOptions.find(o => o.value === secretarioId)?.label
    const updated = subsecretarias.map(sub => {
      if (sub.name === editingSubsecretaria.name) {
        return {
          ...sub,
          name,
          subsecretarioId: secretarioId,
          subsecretarioName: secretarioName
        }
      }
      return sub
    })
    onSubsecretariasChange(updated)
    setEditingSubsecretaria(null)
    setShowSubsecretariaModal(false)
  }

  const handleRemoveSubsecretaria = (name: string) => {
    if (window.confirm(`Deseja realmente remover a subsecretaria "${name}" e todas as suas regionais?`)) {
      onSubsecretariasChange(subsecretarias.filter(s => s.name !== name))
    }
  }

  // Handlers para Regionais
  const handleAddRegional = (name: string, secretarioId?: string) => {
    const secretarioName = secretarioRegionalOptions.find(o => o.value === secretarioId)?.label
    const updated = subsecretarias.map(sub => {
      if (sub.name === regionalModalSubsecretariaName) {
        const newRegional: RegionalDto = {
          name,
          secretarioRegionalId: secretarioId,
          secretarioRegionalName: secretarioName,
          schoolCount: 0
        }
        return {
          ...sub,
          regionais: [...(sub.regionais || []), newRegional]
        }
      }
      return sub
    })
    onSubsecretariasChange(updated)
    setShowRegionalModal(false)
    setRegionalModalSubsecretariaName('')
  }

  const handleEditRegional = (reg: RegionalDto, subsecretariaName: string) => {
    setEditingRegional({ regional: reg, subsecretariaName })
    setRegionalModalSubsecretariaName(subsecretariaName)
    setShowRegionalModal(true)
  }

  const handleUpdateRegional = (name: string, secretarioId?: string) => {
    if (!editingRegional) return
    
    const secretarioName = secretarioRegionalOptions.find(o => o.value === secretarioId)?.label
    const updated = subsecretarias.map(sub => {
      if (sub.name === editingRegional.subsecretariaName) {
        return {
          ...sub,
          regionais: (sub.regionais || []).map(reg => {
            if (reg.name === editingRegional.regional.name) {
              return {
                ...reg,
                name,
                secretarioRegionalId: secretarioId,
                secretarioRegionalName: secretarioName
              }
            }
            return reg
          })
        }
      }
      return sub
    })
    onSubsecretariasChange(updated)
    setEditingRegional(null)
    setShowRegionalModal(false)
    setRegionalModalSubsecretariaName('')
  }

  const handleRemoveRegional = (subsecretariaName: string, regionalName: string) => {
    if (window.confirm(`Deseja realmente remover a regional "${regionalName}"?`)) {
      const updated = subsecretarias.map(sub => {
        if (sub.name === subsecretariaName) {
          return {
            ...sub,
            regionais: (sub.regionais || []).filter(r => r.name !== regionalName)
          }
        }
        return sub
      })
      onSubsecretariasChange(updated)
    }
  }

  // Handler para fechar modais
  const handleCloseModal = () => {
    setShowSubsecretariaModal(false)
    setShowRegionalModal(false)
    setEditingSubsecretaria(null)
    setEditingRegional(null)
    setRegionalModalSubsecretariaName('')
  }

  // Dados de edição para os modais
  const getSubsecretariaEditData = () => {
    if (!editingSubsecretaria) return undefined
    return {
      name: editingSubsecretaria.name,
      secretarioId: editingSubsecretaria.subsecretarioId
    }
  }

  const getRegionalEditData = () => {
    if (!editingRegional) return undefined
    return {
      name: editingRegional.regional.name,
      secretarioId: editingRegional.regional.secretarioRegionalId
    }
  }

  return (
    <div className='d-flex flex-column'>
      {/* Header com resumo estatístico */}
      <div className='alert alert-primary d-flex align-items-center mb-6'>
        <i className='fas fa-sitemap fs-2 me-4'></i>
        <div className='flex-grow-1'>
          <h5 className='mb-1'>Estrutura Organizacional</h5>
          <span className='fs-7'>
            {readOnly ? (
              'Visualize as subsecretarias e regionais do cliente.'
            ) : (
              <>Configure as subsecretarias e regionais do cliente. Cada subsecretaria pode ter um <strong>Subsecretário</strong> e cada regional um <strong>Secretário Regional</strong>.</>
            )}
          </span>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className='row g-3 mb-6'>
        <div className='col-6 col-md-3'>
          <div className='card card-flush h-100'>
            <div className='card-body d-flex flex-column align-items-center py-4'>
              <div className='symbol symbol-40px mb-2'>
                <div className='symbol-label bg-light-primary'>
                  <i className='fas fa-building text-primary fs-4'></i>
                </div>
              </div>
              <div className='fs-2 fw-bold text-gray-800'>{totalSubsecretarias}</div>
              <div className='text-muted fs-8'>Subsecretarias</div>
            </div>
          </div>
        </div>
        <div className='col-6 col-md-3'>
          <div className='card card-flush h-100'>
            <div className='card-body d-flex flex-column align-items-center py-4'>
              <div className='symbol symbol-40px mb-2'>
                <div className='symbol-label bg-light-warning'>
                  <i className='fas fa-map-marker-alt text-warning fs-4'></i>
                </div>
              </div>
              <div className='fs-2 fw-bold text-gray-800'>{totalRegionais}</div>
              <div className='text-muted fs-8'>Regionais</div>
            </div>
          </div>
        </div>
        <div className='col-6 col-md-3'>
          <div className='card card-flush h-100'>
            <div className='card-body d-flex flex-column align-items-center py-4'>
              <div className='symbol symbol-40px mb-2'>
                <div className='symbol-label bg-light-success'>
                  <i className='fas fa-school text-success fs-4'></i>
                </div>
              </div>
              <div className='fs-2 fw-bold text-gray-800'>{totalSchools}</div>
              <div className='text-muted fs-8'>Escolas</div>
            </div>
          </div>
        </div>
        <div className='col-6 col-md-3'>
          <div className='card card-flush h-100'>
            <div className='card-body d-flex flex-column align-items-center py-4'>
              <div className='symbol symbol-40px mb-2'>
                <div className='symbol-label bg-light-info'>
                  <i className='fas fa-user-tie text-info fs-4'></i>
                </div>
              </div>
              <div className='fs-2 fw-bold text-gray-800'>{subsWithResponsible + regsWithResponsible}</div>
              <div className='text-muted fs-8'>Responsáveis</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Subsecretarias */}
      <div className='mb-7'>
        <div className='d-flex justify-content-between align-items-center mb-5'>
          <div className='d-flex align-items-center gap-2'>
            <label className='fw-bold fs-4 mb-0 text-gray-800'>Subsecretarias</label>
            <span className='badge badge-primary'>{subsecretarias.length}</span>
          </div>
          {!readOnly && (
            <button 
              type='button' 
              className='btn btn-sm btn-primary' 
              onClick={() => { setEditingSubsecretaria(null); setShowSubsecretariaModal(true) }}
            >
              <i className='fas fa-plus me-1'></i> Nova subsecretaria
            </button>
          )}
        </div>

        {subsecretarias.length === 0 && (
          <div className='card border border-dashed border-gray-300'>
            <div className='card-body text-center py-10'>
              <i className='fas fa-sitemap fs-2x text-gray-400 mb-4 d-block'></i>
              <h5 className='text-gray-700 mb-2'>Nenhuma subsecretaria cadastrada</h5>
              <p className='text-muted mb-4'>
                {readOnly 
                  ? 'Este cliente não possui subsecretarias configuradas.'
                  : 'Adicione subsecretarias para organizar a estrutura hierárquica do cliente'
                }
              </p>
              {!readOnly && (
                <button 
                  type='button' 
                  className='btn btn-sm btn-light-primary'
                  onClick={() => { setEditingSubsecretaria(null); setShowSubsecretariaModal(true) }}
                >
                  <i className='fas fa-plus me-1'></i> Adicionar primeira subsecretaria
                </button>
              )}
            </div>
          </div>
        )}

        <div className='d-flex flex-column gap-5'>
          {subsecretarias.map((sub: SubsecretariaDto, subIndex: number) => {
            const regionaisCount = sub.regionais?.length || 0
            const schoolsCount = sub.totalSchools || sub.regionais?.reduce((acc, r) => acc + (r.schoolCount || 0), 0) || 0
            
            return (
              <div key={`sub-${sub.id || subIndex}-${sub.name}`} className='card shadow-sm'>
                {/* Header da Subsecretaria */}
                <div className='card-header min-h-auto py-5 px-6'>
                  <div className='d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center w-100 gap-4'>
                    {/* Info principal */}
                    <div className='d-flex align-items-center gap-4'>
                      <div className='symbol symbol-50px symbol-circle'>
                        <div className='symbol-label bg-primary'>
                          <i className='fas fa-building text-white fs-3'></i>
                        </div>
                      </div>
                      <div>
                        <h4 className='mb-1 text-gray-900'>{sub.name}</h4>
                        {sub.subsecretarioName ? (
                          <span className='text-primary fw-semibold fs-7'>
                            <i className='fas fa-user-tie me-2'></i>
                            {sub.subsecretarioName}
                          </span>
                        ) : (
                          <span className='text-muted fs-7'>
                            <i className='fas fa-user-slash me-2'></i>
                            Sem subsecretário
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Estatísticas e ações */}
                    <div className='d-flex align-items-center gap-5'>
                      {/* Badges de estatísticas */}
                      <div className='d-flex gap-3'>
                        <div className='border border-dashed border-gray-300 rounded py-2 px-3 text-center'>
                          <div className='fs-5 fw-bold text-warning'>{regionaisCount}</div>
                          <div className='text-muted fs-9'>Regionais</div>
                        </div>
                        <div className='border border-dashed border-gray-300 rounded py-2 px-3 text-center'>
                          <div className='fs-5 fw-bold text-success'>{schoolsCount}</div>
                          <div className='text-muted fs-9'>Escolas</div>
                        </div>
                      </div>
                      
                      {/* Ações */}
                      {!readOnly && (
                        <div className='d-flex gap-2'>
                          <button 
                            type='button' 
                            className='btn btn-icon btn-sm btn-light-primary' 
                            title='Editar subsecretaria' 
                            onClick={() => handleEditSubsecretaria(sub)}
                          >
                            <i className='fas fa-pen fs-7'></i>
                          </button>
                          <button 
                            type='button' 
                            className='btn btn-icon btn-sm btn-light-danger' 
                            title='Remover subsecretaria' 
                            onClick={() => handleRemoveSubsecretaria(sub.name)}
                          >
                            <i className='fas fa-trash fs-7'></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Separator */}
                <div className='separator'></div>
                
                {/* Body - Regionais */}
                <div className='card-body px-6 py-5'>
                  <div className='d-flex justify-content-between align-items-center mb-4'>
                    <h6 className='mb-0 text-gray-700'>
                      <i className='fas fa-map-marker-alt me-2 text-warning'></i>
                      Regionais
                    </h6>
                    {!readOnly && (
                      <button 
                        type='button' 
                        className='btn btn-sm btn-light-warning' 
                        onClick={() => { 
                          setEditingRegional(null)
                          setShowRegionalModal(true)
                          setRegionalModalSubsecretariaName(sub.name) 
                        }}
                      >
                        <i className='fas fa-plus me-1'></i> Adicionar
                      </button>
                    )}
                  </div>
                  
                  {(!sub.regionais || sub.regionais.length === 0) ? (
                    <div className='notice d-flex bg-light-warning rounded border-warning border border-dashed p-5'>
                      <i className='fas fa-map-marked-alt fs-2x text-warning me-4'></i>
                      <div className='d-flex flex-column'>
                        <span className='text-gray-700 fw-semibold'>Nenhuma regional cadastrada</span>
                        <span className='text-muted fs-7'>
                          {readOnly 
                            ? 'Esta subsecretaria não possui regionais.'
                            : 'Clique em "Adicionar" para criar a primeira regional desta subsecretaria'
                          }
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className='table-responsive'>
                      <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-3'>
                        <thead>
                          <tr className='fw-bold text-muted fs-7'>
                            <th className='min-w-150px'>Regional</th>
                            <th className='min-w-120px'>Responsável</th>
                            <th className='min-w-80px text-center'>Escolas</th>
                            {!readOnly && <th className='text-end min-w-80px'>Ações</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {(sub.regionais || []).map((reg: RegionalDto, regIndex: number) => {
                            const regSchools = reg.schoolCount || 0
                            
                            return (
                              <tr key={`reg-${sub.id || subIndex}-${reg.id || regIndex}-${reg.name}`}>
                                <td>
                                  <div className='d-flex align-items-center'>
                                    <div className='symbol symbol-35px me-3'>
                                      <div className='symbol-label bg-light-warning'>
                                        <i className='fas fa-map-pin text-warning fs-7'></i>
                                      </div>
                                    </div>
                                    <span className='text-gray-800 fw-semibold'>{reg.name}</span>
                                  </div>
                                </td>
                                <td>
                                  {reg.secretarioRegionalName ? (
                                    <span className='text-success fw-medium'>
                                      <i className='fas fa-user-check me-1'></i>
                                      {reg.secretarioRegionalName}
                                    </span>
                                  ) : (
                                    <span className='text-muted fst-italic fs-7'>
                                      <i className='fas fa-user-slash me-1'></i>
                                      Não definido
                                    </span>
                                  )}
                                </td>
                                <td className='text-center'>
                                  <span className='badge badge-light-success'>{regSchools}</span>
                                </td>
                                {!readOnly && (
                                  <td className='text-end'>
                                    <button 
                                      type='button' 
                                      className='btn btn-icon btn-sm btn-light-primary me-1' 
                                      title='Editar regional' 
                                      onClick={() => handleEditRegional(reg, sub.name)}
                                    >
                                      <i className='fas fa-pen fs-7'></i>
                                    </button>
                                    <button 
                                      type='button' 
                                      className='btn btn-icon btn-sm btn-light-danger' 
                                      title='Remover regional' 
                                      onClick={() => handleRemoveRegional(sub.name, reg.name)}
                                    >
                                      <i className='fas fa-trash fs-7'></i>
                                    </button>
                                  </td>
                                )}
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modais */}
      {!readOnly && (
        <>
          {/* Modal de Subsecretaria */}
          <CreateOptionModal
            show={showSubsecretariaModal}
            onClose={handleCloseModal}
            onCreate={editingSubsecretaria ? handleUpdateSubsecretaria : handleAddSubsecretaria}
            title={editingSubsecretaria ? 'Editar Subsecretaria' : 'Nova Subsecretaria'}
            placeholder='Digite o nome da subsecretaria'
            secretarioLabel='Subsecretário'
            secretarioPlaceholder='Selecione o subsecretário (opcional)'
            secretarioOptions={subsecretarioOptions}
            isLoadingSecretarios={isLoadingSubsecretarios}
            editMode={!!editingSubsecretaria}
            editData={getSubsecretariaEditData()}
          />

          {/* Modal de Regional */}
          <CreateOptionModal
            show={showRegionalModal}
            onClose={handleCloseModal}
            onCreate={editingRegional ? handleUpdateRegional : handleAddRegional}
            title={editingRegional ? 'Editar Regional' : 'Nova Regional'}
            placeholder='Digite o nome da regional'
            secretarioLabel='Secretário Regional'
            secretarioPlaceholder='Selecione o secretário regional (opcional)'
            secretarioOptions={secretarioRegionalOptions}
            isLoadingSecretarios={isLoadingSecretariosRegionais}
            editMode={!!editingRegional}
            editData={getRegionalEditData()}
          />
        </>
      )}
    </div>
  )
}

export { ClientStructure }
