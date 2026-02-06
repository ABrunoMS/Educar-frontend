import React, { FC, useState, useEffect, useMemo } from 'react'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import clsx from 'clsx'
import { useIntl } from 'react-intl'
import { ClientType, SubsecretariaDto, RegionalDto } from '@interfaces/Client'
import { SelectOptions } from '@interfaces/Forms'
import BasicField from '@components/form/BasicField'
import SelectField from '@components/form/SelectField'
import { createClient, updateClient, getAllProducts, getCompatibleContents, ProductDto, ContentDto } from '../../clients-list/core/_requests'
import { CreateOptionModal, SelectOption, EditData } from './CreateOptionModal'
import { StepIndicator, Step } from './StepIndicator'
import { getMacroRegions } from '@services/MacroRegions'
import { isNotEmpty } from '@metronic/helpers'
import Flatpickr from 'react-flatpickr'
import "flatpickr/dist/themes/material_green.css";
import { getAccountsByRole } from '@services/Accounts'

type Props = {
  isUserLoading?: boolean
  client?: ClientType
  onFormSubmit: () => void
}

type ClientFormValues = Omit<ClientType, 'signatureDate' | 'implantationDate' | 'validity'> & {
  signatureDate: Date | null | undefined;
  implantationDate: Date | null | undefined;
  validity: Date | null | undefined;
};

export const initialClient: ClientType = {
  id: '',
  name: '',
  description: '',
  partner: '',
  contacts: '',
  contract: '',
  validity: undefined,
  signatureDate: undefined,
  implantationDate: undefined,
  totalAccounts: 0,
  subsecretarias: [],
  selectedProducts: [],
  selectedContents: [],
  macroRegionId: '',
  macroRegionName: '',
  secretarioId: '',
  secretarioName: ''
}

// Definição das etapas do formulário
const FORM_STEPS: Step[] = [
  { number: 1, title: 'Informações Básicas', description: 'Dados do cliente' },
  { number: 2, title: 'Estrutura Organizacional', description: 'Subsecretarias e Regionais' },
]

const ClientCreateForm: FC<Props> = ({ client, isUserLoading }) => {
  // Estado para controle das etapas
  const [currentStep, setCurrentStep] = useState(1)
  
  const [subsecretarias, setSubsecretarias] = useState<SubsecretariaDto[]>([])
  const [showSubsecretariaModal, setShowSubsecretariaModal] = useState(false)
  const [showRegionalModal, setShowRegionalModal] = useState(false)
  const [regionalModalSubsecretariaName, setRegionalModalSubsecretariaName] = useState<string>('')
  
  // Estados para edição
  const [editingSubsecretaria, setEditingSubsecretaria] = useState<SubsecretariaDto | null>(null)
  const [editingRegional, setEditingRegional] = useState<{regional: RegionalDto, subsecretariaName: string} | null>(null)

  const intl = useIntl()

  const [allProducts, setAllProducts] = useState<ProductDto[]>([])
  const [availableContents, setAvailableContents] = useState<ContentDto[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [isLoadingContents, setIsLoadingContents] = useState(false)

  const [partnerOptions, setPartnerOptions] = useState<SelectOptions[]>([])
  const [contactOptions, setContactOptions] = useState<SelectOptions[]>([])
  const [isLoadingPartners, setIsLoadingPartners] = useState(false)
  const [isLoadingContacts, setIsLoadingContacts] = useState(false)
  const [macroRegionOptions, setMacroRegionOptions] = useState<SelectOptions[]>([])
  const [isLoadingMacroRegions, setIsLoadingMacroRegions] = useState(false)

  // Estados para os secretários
  const [secretarioOptions, setSecretarioOptions] = useState<SelectOption[]>([])
  const [subsecretarioOptions, setSubsecretarioOptions] = useState<SelectOption[]>([])
  const [secretarioRegionalOptions, setSecretarioRegionalOptions] = useState<SelectOption[]>([])
  const [isLoadingSecretarios, setIsLoadingSecretarios] = useState(false)
  const [isLoadingSubsecretarios, setIsLoadingSubsecretarios] = useState(false)
  const [isLoadingSecretariosRegionais, setIsLoadingSecretariosRegionais] = useState(false)

  // 1. Inicialização segura das Subsecretarias
  useEffect(() => {
    if (client && client.subsecretarias && client.subsecretarias.length > 0) {
      setSubsecretarias(client.subsecretarias);
    } else {
      setSubsecretarias([]);
    }
  }, [client?.id]);

  // Buscar Parceiros
  useEffect(() => {
    const fetchPartners = async () => {
      setIsLoadingPartners(true)
      try {
        const response = await getAccountsByRole('Distribuidor')
        const options = (response.data.data || []).map((account: any) => ({
          value: account.id,
          label: account.name || account.userName || account.email,
        }))
        setPartnerOptions(options)
      } catch (error) {
        console.error('Erro ao buscar distribuidores:', error)
      } finally {
        setIsLoadingPartners(false)
      }
    }
    fetchPartners()
  }, [])

  // Buscar Contatos
  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoadingContacts(true)
      try {
        const response = await getAccountsByRole('AgenteComercial')
        const options = (response.data.data || []).map((account: any) => ({
          value: account.id,
          label: account.name || account.userName || account.email,
        }))
        setContactOptions(options)
      } catch (error) {
        console.error('Erro ao buscar agentes comerciais:', error)
      } finally {
        setIsLoadingContacts(false)
      }
    }
    fetchContacts()
  }, [])

  // Buscar Macro Regiões
  useEffect(() => {
    const fetchMacroRegions = async () => {
      setIsLoadingMacroRegions(true)
      try {
        const response = await getMacroRegions()
        const options = (response.data || []).map((m: any) => ({ value: m.id, label: m.name }))
        setMacroRegionOptions(options)
      } catch (error) {
        console.error('Erro ao buscar macro regiões:', error)
      } finally {
        setIsLoadingMacroRegions(false)
      }
    }
    fetchMacroRegions()
  }, [])

  // Buscar Produtos
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true)
      try {
        const productData = await getAllProducts()
        setAllProducts(productData.data || [])
      } catch (error) {
        console.error('Falha ao buscar produtos:', error)
      } finally {
        setIsLoadingProducts(false)
      }
    }
    fetchProducts()
  }, [])

  // Buscar Secretários (Geral)
  useEffect(() => {
    const fetchSecretarios = async () => {
      setIsLoadingSecretarios(true)
      try {
        const response = await getAccountsByRole('Secretario')
        const options = (response.data.data || []).map((account: any) => ({
          value: account.id,
          label: account.name || account.userName || account.email,
        }))
        setSecretarioOptions(options)
      } catch (error) {
        console.error('Erro ao buscar secretários:', error)
      } finally {
        setIsLoadingSecretarios(false)
      }
    }
    fetchSecretarios()
  }, [])

  // Buscar Subsecretários
  useEffect(() => {
    const fetchSubsecretarios = async () => {
      setIsLoadingSubsecretarios(true)
      try {
        const response = await getAccountsByRole('Subsecretario')
        const options = (response.data.data || []).map((account: any) => ({
          value: account.id,
          label: account.name || account.userName || account.email,
        }))
        setSubsecretarioOptions(options)
      } catch (error) {
        console.error('Erro ao buscar subsecretários:', error)
      } finally {
        setIsLoadingSubsecretarios(false)
      }
    }
    fetchSubsecretarios()
  }, [])

  // Buscar Secretários Regionais
  useEffect(() => {
    const fetchSecretariosRegionais = async () => {
      setIsLoadingSecretariosRegionais(true)
      try {
        const response = await getAccountsByRole('SecretarioRegional')
        const options = (response.data.data || []).map((account: any) => ({
          value: account.id,
          label: account.name || account.userName || account.email,
        }))
        setSecretarioRegionalOptions(options)
      } catch (error) {
        console.error('Erro ao buscar secretários regionais:', error)
      } finally {
        setIsLoadingSecretariosRegionais(false)
      }
    }
    fetchSecretariosRegionais()
  }, [])

  // 2. Valores Iniciais com useMemo seguro
  const dialogueForEdit = useMemo((): ClientFormValues => {
    return {
      ...initialClient,
      id: client?.id,
      name: client?.name || initialClient.name,
      description: client?.description || initialClient.description,
      partner: client?.partner || initialClient.partner,
      contacts: client?.contacts || initialClient.contacts,
      contract: client?.contract || initialClient.contract,
      validity: client?.validity ? new Date(client.validity) : null,
      signatureDate: client?.signatureDate ? new Date(client.signatureDate) : null,
      implantationDate: client?.implantationDate ? new Date(client.implantationDate) : null,
      totalAccounts: client?.totalAccounts || initialClient.totalAccounts,
      subsecretarias: client?.subsecretarias || [],
      products: client?.products || [],
      contents: client?.contents || [],
      selectedProducts: client?.products
        ? client.products.map(p => p.id)
        : (client?.selectedProducts || []),
      selectedContents: client?.contents
        ? client.contents.map(c => c.id)
        : (client?.selectedContents || []),
      macroRegionId: client?.macroRegionId || '',
      secretarioId: client?.secretarioId || '',
      secretarioName: client?.secretarioName || ''
    }
  }, [client?.id]) 

  const editSchema = Yup.object().shape({
    name: Yup.string().min(3).max(50).required('Nome é obrigatório'),
    partner: Yup.string().required('Parceiro é obrigatório'),
    contacts: Yup.string().required('Contatos são obrigatórios'),
    contract: Yup.string().optional(),
    validity: Yup.date().nullable().required('Validade é obrigatória'),
    signatureDate: Yup.date().nullable().required('Data de assinatura é obrigatória'),
    implantationDate: Yup.date().nullable().optional(),
    totalAccounts: Yup.number().moreThan(0).required('Número de contas é obrigatório'),
    selectedProducts: Yup.array().of(Yup.string()).min(1, 'Selecione pelo menos um produto'),
    selectedContents: Yup.array().of(Yup.string()).min(1, 'Selecione pelo menos um conteúdo'),
  })

  const formik = useFormik<ClientFormValues>({
    initialValues: dialogueForEdit,
    validationSchema: editSchema,
    validateOnChange: true,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSubmitting(true)
      const { products, contents, ...formValues } = values;

      const payload = {
        ...formValues,
        id: formValues.id || undefined,
        validity: values.validity ? (values.validity as Date).toISOString() : undefined,
        signatureDate: values.signatureDate ? (values.signatureDate as Date).toISOString() : undefined,
        implantationDate: values.implantationDate ? (values.implantationDate as Date).toISOString() : undefined,
        
        // Enviando dados completos com secretários
        subsecretarias: subsecretarias.map(sub => ({
          id: sub.id || undefined,
          name: sub.name,
          subsecretarioId: sub.subsecretarioId || undefined,
          regionais: (sub.regionais || []).map(reg => ({ 
             id: reg.id || undefined,
             name: reg.name,
             secretarioRegionalId: reg.secretarioRegionalId || undefined
          }))
        })),
        
        secretarioId: values.secretarioId || undefined,
        // Para criação usa selectedProducts/selectedContents (JsonPropertyName no backend)
        // Para update usa productIds/contentIds
        selectedProducts: values.selectedProducts,
        selectedContents: values.selectedContents,
        productIds: values.selectedProducts,
        contentIds: values.selectedContents,
        macroRegionId: values.macroRegionId || undefined
      }

      // Limpar campos duplicados do spread
      delete (payload as any).products
      delete (payload as any).contents

      try {
        if (isNotEmpty(payload.id)) {
          await updateClient(payload as any)
        } else {
          await createClient(payload as any)
        }
        alert('Cliente salvo com sucesso!')
        
        if (!payload.id) {
             resetForm()
             setSubsecretarias([])
             setCurrentStep(1)
        }
      } catch (ex) {
        console.error(ex)
        alert('Houve um erro ao salvar o cliente.')
      } finally {
        setSubmitting(false)
      }
    },
  })

  // Efeito para carregar conteúdos compatíveis
  useEffect(() => {
    const fetchCompatibleContents = async () => {
      const selectedProductIds = formik.values.selectedProducts

      if (selectedProductIds.length === 0) {
        setAvailableContents([])
        if (formik.values.selectedContents.length > 0) {
             formik.setFieldValue('selectedContents', [])
        }
        return
      }

      setIsLoadingContents(true)
      try {
        const fetchPromises = selectedProductIds.map(id => getCompatibleContents(id))
        const results = await Promise.all(fetchPromises)

        const contentMap = new Map<string, ContentDto>()
        results.forEach(contentList => {
          contentList.forEach(content => {
            if (!contentMap.has(content.id)) {
              contentMap.set(content.id, content)
            }
          })
        })

        const newAvailableContents = Array.from(contentMap.values())
        setAvailableContents(newAvailableContents)

        const availableContentIds = new Set(newAvailableContents.map(c => c.id))
        const filteredSelectedContents = formik.values.selectedContents.filter(id =>
          availableContentIds.has(id)
        )

        if (filteredSelectedContents.length !== formik.values.selectedContents.length) {
             formik.setFieldValue('selectedContents', filteredSelectedContents)
        }

      } catch (error) {
        console.error('Falha ao buscar conteúdos compatíveis:', error)
      } finally {
        setIsLoadingContents(false)
      }
    }

    fetchCompatibleContents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.selectedProducts]) 

  // Handlers para Subsecretarias e Regionais
  const handleCreateSubsecretaria = (subsecretariaName: string, subsecretarioId?: string) => {
    const subsecretarioName = subsecretarioId 
      ? subsecretarioOptions.find(o => o.value === subsecretarioId)?.label 
      : undefined
    
    // Se está editando, atualiza a subsecretaria existente
    if (editingSubsecretaria) {
      setSubsecretarias(prev => prev.map(sub => 
        (sub.id === editingSubsecretaria.id || sub.name === editingSubsecretaria.name)
          ? { 
              ...sub, 
              name: subsecretariaName, 
              subsecretarioId, 
              subsecretarioName 
            }
          : sub
      ))
      setEditingSubsecretaria(null)
    } else {
      // Cria nova subsecretaria
      setSubsecretarias(prev => [
        ...prev,
        { 
          name: subsecretariaName, 
          regionais: [],
          subsecretarioId,
          subsecretarioName
        }
      ])
    }
    setShowSubsecretariaModal(false)
  }

  const handleEditSubsecretaria = (sub: SubsecretariaDto) => {
    setEditingSubsecretaria(sub)
    setShowSubsecretariaModal(true)
  }

  const handleCreateRegional = (regionalName: string, subsecretariaName: string, secretarioRegionalId?: string) => {
    const secretarioRegionalName = secretarioRegionalId
      ? secretarioRegionalOptions.find(o => o.value === secretarioRegionalId)?.label
      : undefined

    // Se está editando, atualiza a regional existente
    if (editingRegional) {
      setSubsecretarias(prev => prev.map(sub =>
        sub.name === editingRegional.subsecretariaName
          ? { 
              ...sub, 
              regionais: (sub.regionais || []).map(reg =>
                (reg.id === editingRegional.regional.id || reg.name === editingRegional.regional.name)
                  ? { 
                      ...reg, 
                      name: regionalName,
                      secretarioRegionalId,
                      secretarioRegionalName
                    }
                  : reg
              )
            }
          : sub
      ))
      setEditingRegional(null)
    } else {
      // Cria nova regional
      setSubsecretarias(prev => prev.map(sub =>
        sub.name === subsecretariaName
          ? { 
              ...sub, 
              regionais: [
                ...(sub.regionais || []), 
                { 
                  name: regionalName,
                  secretarioRegionalId,
                  secretarioRegionalName
                }
              ] 
            }
          : sub
      ))
    }
    setShowRegionalModal(false)
    setRegionalModalSubsecretariaName('')
  }

  const handleEditRegional = (reg: RegionalDto, subsecretariaName: string) => {
    setEditingRegional({ regional: reg, subsecretariaName })
    setRegionalModalSubsecretariaName(subsecretariaName)
    setShowRegionalModal(true)
  }

  const handleRemoveSubsecretaria = (subName: string) => {
    setSubsecretarias(prev => prev.filter(sub => sub.name !== subName))
  }

  const handleRemoveRegional = (subName: string, regName: string) => {
    setSubsecretarias(prev => prev.map(sub =>
      sub.name === subName
        ? { ...sub, regionais: (sub.regionais || []).filter(reg => reg.name !== regName) }
        : sub
    ))
  }

  // Helpers de Renderização
  const renderBasicFieldset = (
    fieldName: string,
    label: string,
    placeholder?: string,
    required: boolean = true,
    type: 'text' | 'number' = 'text'
  ) => (
    <BasicField
      fieldName={fieldName}
      label={label}
      placeholder={placeholder}
      required={required}
      formik={formik}
      type={type}
    />
  )

  const renderSelectFieldset = (
    fieldName: string,
    label: string,
    placeholder?: string,
    options: SelectOptions[] = [],
    multiselect: boolean = false,
    required: boolean = true
  ) => (
    <SelectField
      fieldName={fieldName}
      label={label}
      placeholder={placeholder}
      required={required}
      multiselect={multiselect}
      options={options}
      formik={formik}
    />
  )

  const updateCalendarValue = (newValue: Date | null | undefined, field: keyof ClientFormValues) => {
    formik.setFieldValue(field, newValue)
  }

  const renderCalendarField = (fieldName: keyof ClientFormValues, label: string, placeholder?: string, required: boolean = true) => {
    const rawValue = formik.values[fieldName];
    const safeValue = rawValue ? new Date(rawValue as any) : undefined;

    return (
      <div className='mb-7'>
        <label className={clsx('fw-bold fs-6 mb-2', { 'required': required })}>{label}</label>
        <Flatpickr
          className='form-control form-control-solid'
          placeholder={placeholder || ''}
          value={safeValue}
          onChange={(date: Date[]) => {
            if (date && date.length > 0) {
              updateCalendarValue(date[0], fieldName)
            } else {
              updateCalendarValue(null, fieldName)
            }
          }}
          options={{
            dateFormat: "d/m/Y",
          }}
        />
        {formik.getFieldMeta(fieldName).touched && formik.getFieldMeta(fieldName).error && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.getFieldMeta(fieldName).error as string}</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Renderização da Etapa 1 - Informações Básicas
  const renderStep1 = () => (
    <div className='d-flex flex-column'>
      <div className='row'>
        <div className='col-md-6'>
          {renderBasicFieldset('name', 'Nome do Cliente', 'Nome completo')}
        </div>
        <div className='col-md-6'>
          {renderBasicFieldset('description', 'Descrição', 'Descrição', false)}
        </div>
      </div>
      
      <div className='row'>
        <div className='col-md-6'>
          {renderSelectFieldset('partner', 'Parceiro', isLoadingPartners ? 'Carregando...' : 'Selecione um parceiro...', partnerOptions)}
        </div>
        <div className='col-md-6'>
          {renderSelectFieldset('contacts', 'Contato', isLoadingContacts ? 'Carregando...' : 'Selecione um contato...', contactOptions)}
        </div>
      </div>

      <div className='row'>
        <div className='col-md-6'>
          {renderSelectFieldset('macroRegionId', 'Macro Região', isLoadingMacroRegions ? 'Carregando...' : 'Selecione uma macro região...', macroRegionOptions, false, false)}
        </div>
        <div className='col-md-6'>
          {renderSelectFieldset('secretarioId', 'Secretário (Geral)', isLoadingSecretarios ? 'Carregando...' : 'Selecione o secretário responsável...', secretarioOptions as any, false, false)}
        </div>
      </div>
      
      <div className='row'>
        <div className='col-md-4'>
          {renderCalendarField('validity', 'Validade', 'Selecione a data de validade', true)}
        </div>
        <div className='col-md-4'>
          {renderCalendarField('signatureDate', 'Data de Assinatura', 'Selecione a data', true)}
        </div>
        <div className='col-md-4'>
          {renderCalendarField('implantationDate', 'Data de Implantação', 'Selecione a data', false)}
        </div>
      </div>
      
      <div className='row'>
        <div className='col-md-6'>
          {renderBasicFieldset('totalAccounts', 'Número de Contas', 'Quantidade...', false, 'number')}
        </div>
      </div>

      {renderContentFieldset()}
    </div>
  )

  // Renderização da Etapa 2 - Subsecretarias e Regionais
  const renderStep2 = () => {
    // Calcular estatísticas gerais
    const totalSubsecretarias = subsecretarias.length
    const totalRegionais = subsecretarias.reduce((acc, sub) => acc + (sub.regionais?.length || 0), 0)
    const totalSchools = subsecretarias.reduce((acc, sub) => acc + (sub.totalSchools || 0), 0)
    const subsWithResponsible = subsecretarias.filter(s => s.subsecretarioId).length
    const regsWithResponsible = subsecretarias.reduce((acc, sub) => 
      acc + (sub.regionais?.filter(r => r.secretarioRegionalId).length || 0), 0)

    return (
      <div className='d-flex flex-column'>
        {/* Header com resumo estatístico */}
        <div className='alert alert-primary d-flex align-items-center mb-6'>
          <i className='fas fa-sitemap fs-2 me-4'></i>
          <div className='flex-grow-1'>
            <h5 className='mb-1'>Estrutura Organizacional</h5>
            <span className='fs-7'>
              Configure as subsecretarias e regionais do cliente. Cada subsecretaria pode ter um <strong>Subsecretário</strong> e cada regional um <strong>Secretário Regional</strong>.
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

        {renderSubsecretariasRegionais()}
      </div>
    )
  }

  const renderSubsecretariasRegionais = () => {
    return (
      <div className='mb-7'>
        <div className='d-flex justify-content-between align-items-center mb-5'>
          <div className='d-flex align-items-center gap-2'>
            <label className='fw-bold fs-4 mb-0 text-gray-800'>Subsecretarias</label>
            <span className='badge badge-primary'>{subsecretarias.length}</span>
          </div>
          <button 
            type='button' 
            className='btn btn-sm btn-primary' 
            onClick={() => { setEditingSubsecretaria(null); setShowSubsecretariaModal(true) }}
          >
            <i className='fas fa-plus me-1'></i> Nova subsecretaria
          </button>
        </div>

        {subsecretarias.length === 0 && (
          <div className='card border border-dashed border-gray-300'>
            <div className='card-body text-center py-10'>
              <i className='fas fa-sitemap fs-2x text-gray-400 mb-4 d-block'></i>
              <h5 className='text-gray-700 mb-2'>Nenhuma subsecretaria cadastrada</h5>
              <p className='text-muted mb-4'>
                Adicione subsecretarias para organizar a estrutura hierárquica do cliente
              </p>
              <button 
                type='button' 
                className='btn btn-sm btn-light-primary'
                onClick={() => { setEditingSubsecretaria(null); setShowSubsecretariaModal(true) }}
              >
                <i className='fas fa-plus me-1'></i> Adicionar primeira subsecretaria
              </button>
            </div>
          </div>
        )}

        <div className='d-flex flex-column gap-5'>
          {subsecretarias.map((sub: SubsecretariaDto, subIndex: number) => {
            const regionaisCount = sub.regionais?.length || 0
            const schoolsCount = sub.totalSchools || sub.regionais?.reduce((acc, r) => acc + (r.schoolCount || 0), 0) || 0
            const hasResponsible = !!sub.subsecretarioId
            
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
                  </div>
                  
                  {(!sub.regionais || sub.regionais.length === 0) ? (
                    <div className='notice d-flex bg-light-warning rounded border-warning border border-dashed p-5'>
                      <i className='fas fa-map-marked-alt fs-2x text-warning me-4'></i>
                      <div className='d-flex flex-column'>
                        <span className='text-gray-700 fw-semibold'>Nenhuma regional cadastrada</span>
                        <span className='text-muted fs-7'>Clique em "Adicionar" para criar a primeira regional desta subsecretaria</span>
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
                            <th className='text-end min-w-80px'>Ações</th>
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
    )
  }

  const renderContentFieldset = () => {
    return (
      <>
        <div className='separator my-5'></div>
        <div className='mb-7'>
          <div className='row'>
            <div className='col-12'>
              <label className='form-label fw-bold required mb-4'>Produtos</label>
              {isLoadingProducts && (
                <div className='d-flex align-items-center text-muted fs-7'>
                  <span className='spinner-border spinner-border-sm me-2'></span>
                  Carregando produtos...
                </div>
              )}
              <div className='row g-3'>
                {!isLoadingProducts && allProducts.map(product => (
                  <div className='col-12 col-sm-6 col-md-4 col-lg-3' key={product.id}>
                    <div className='form-check form-check-custom form-check-solid h-100'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        name='selectedProducts'
                        value={product.id}
                        id={`product-${product.id}`}
                        checked={formik.values.selectedProducts.includes(product.id)}
                        onChange={formik.handleChange}
                      />
                      <label className='form-check-label fw-semibold text-gray-700' htmlFor={`product-${product.id}`}>
                        {product.name}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className='mb-7'>
          <div className='row'>
            <div className='col-12'>
              <label className='form-label fw-bold required mb-4'>Conteúdos</label>
              {isLoadingContents && (
                <div className='d-flex align-items-center text-muted fs-7'>
                  <span className='spinner-border spinner-border-sm me-2'></span>
                  Buscando conteúdos...
                </div>
              )}
              {!isLoadingContents && formik.values.selectedProducts.length === 0 && (
                <div className='alert alert-info d-flex align-items-center'>
                  <i className='fas fa-info-circle me-2'></i>
                  <span>Selecione um produto para ver os conteúdos disponíveis.</span>
                </div>
              )}
              {!isLoadingContents && availableContents.length === 0 && formik.values.selectedProducts.length > 0 && (
                <div className='alert alert-warning d-flex align-items-center'>
                  <i className='fas fa-exclamation-triangle me-2'></i>
                  <span>Nenhum conteúdo compatível encontrado.</span>
                </div>
              )}
              <div className='row g-3'>
                {!isLoadingContents && availableContents.map(content => (
                  <div className='col-12 col-sm-6 col-md-4 col-lg-3' key={content.id}>
                    <div className='form-check form-check-custom form-check-solid h-100'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        name='selectedContents'
                        value={content.id}
                        id={`content-${content.id}`}
                        checked={formik.values.selectedContents.includes(content.id)}
                        onChange={formik.handleChange}
                      />
                      <label className='form-check-label fw-semibold text-gray-700' htmlFor={`content-${content.id}`}>
                        {content.name}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Validação da etapa atual
  const validateCurrentStep = async (): Promise<boolean> => {
    if (currentStep === 1) {
      // Validar campos obrigatórios da etapa 1
      const errors = await formik.validateForm()
      const step1Fields = ['name', 'partner', 'contacts', 'validity', 'signatureDate', 'selectedProducts', 'selectedContents']
      const step1Errors = step1Fields.filter(field => errors[field as keyof typeof errors])
      
      if (step1Errors.length > 0) {
        // Marcar campos como tocados para mostrar erros
        step1Fields.forEach(field => formik.setFieldTouched(field, true))
        return false
      }
    }
    return true
  }

  // Navegação entre etapas
  const handleNextStep = async () => {
    const isValid = await validateCurrentStep()
    if (isValid && currentStep < FORM_STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <>
      <form id='kt_modal_add_client_form' className='form' onSubmit={formik.handleSubmit} noValidate>
        {/* Indicador de Etapas */}
        <StepIndicator 
          steps={FORM_STEPS} 
          currentStep={currentStep}
          onStepClick={(step) => {
            // Permitir voltar para etapas anteriores
            if (step < currentStep) {
              setCurrentStep(step)
            }
          }}
        />

        {/* Conteúdo da Etapa */}
        <div className='card card-flush mb-5'>
          <div className='card-body'>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
          </div>
        </div>

        {/* Botões de Navegação */}
        <div className='d-flex justify-content-between pt-5'>
          <div>
            {currentStep > 1 && (
              <button
                type='button'
                className='btn btn-light-primary'
                onClick={handlePrevStep}
              >
                <i className='fas fa-arrow-left me-2'></i>
                Voltar
              </button>
            )}
          </div>

          <div>
            {currentStep < FORM_STEPS.length ? (
              <button
                type='button'
                className='btn btn-primary'
                onClick={handleNextStep}
              >
                Próximo
                <i className='fas fa-arrow-right ms-2'></i>
              </button>
            ) : (
              <button
                type='submit'
                className='btn btn-success'
                disabled={formik.isSubmitting || isUserLoading}
              >
                <span className='indicator-label'>
                  <i className='fas fa-check me-2'></i>
                  Salvar Cliente
                </span>
                {(formik.isSubmitting || isUserLoading) && (
                  <span className='indicator-progress'>
                    Salvando...{' '}
                    <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Modal para criar/editar Subsecretaria */}
      <CreateOptionModal
        show={showSubsecretariaModal}
        title={editingSubsecretaria ? 'Editar Subsecretaria' : 'Criar nova Subsecretaria'}
        placeholder='Nome da subsecretaria'
        onClose={() => { 
          setShowSubsecretariaModal(false)
          setEditingSubsecretaria(null)
        }}
        onCreate={(name, subsecretarioId) => handleCreateSubsecretaria(name, subsecretarioId)}
        secretarioOptions={subsecretarioOptions}
        secretarioLabel='Subsecretário'
        secretarioPlaceholder='Selecione o subsecretário responsável...'
        isLoadingSecretarios={isLoadingSubsecretarios}
        editMode={!!editingSubsecretaria}
        editData={editingSubsecretaria ? {
          name: editingSubsecretaria.name,
          secretarioId: editingSubsecretaria.subsecretarioId
        } : undefined}
      />

      {/* Modal para criar/editar Regional */}
      <CreateOptionModal
        show={showRegionalModal}
        title={editingRegional 
          ? `Editar Regional: ${editingRegional.regional.name}` 
          : `Criar nova Regional para: ${regionalModalSubsecretariaName}`}
        placeholder='Nome da regional'
        onClose={() => { 
          setShowRegionalModal(false)
          setRegionalModalSubsecretariaName('')
          setEditingRegional(null)
        }}
        onCreate={(name, secretarioRegionalId) => {
          const subName = regionalModalSubsecretariaName || subsecretarias[0]?.name || ''
          if (!subName) {
            alert('Erro: Nenhuma subsecretaria selecionada para vincular a regional.')
            return
          }
          handleCreateRegional(name, subName, secretarioRegionalId)
        }}
        secretarioOptions={secretarioRegionalOptions}
        secretarioLabel='Secretário Regional'
        secretarioPlaceholder='Selecione o secretário regional responsável...'
        isLoadingSecretarios={isLoadingSecretariosRegionais}
        editMode={!!editingRegional}
        editData={editingRegional ? {
          name: editingRegional.regional.name,
          secretarioId: editingRegional.regional.secretarioRegionalId
        } : undefined}
      />
    </>
  )
}

export { ClientCreateForm }
