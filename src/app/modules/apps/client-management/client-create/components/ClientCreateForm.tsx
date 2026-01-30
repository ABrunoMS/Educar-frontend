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
import { CreateOptionModal } from './CreateOptionModal'
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
  macroRegionName: ''
}

const ClientCreateForm: FC<Props> = ({ client, isUserLoading }) => {
  const [subsecretarias, setSubsecretarias] = useState<SubsecretariaDto[]>([])
  const [showSubsecretariaModal, setShowSubsecretariaModal] = useState(false)
  const [showRegionalModal, setShowRegionalModal] = useState(false)
  const [regionalModalSubsecretariaName, setRegionalModalSubsecretariaName] = useState<string>('')

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

  // 1. Inicialização segura das Subsecretarias
  // Dependência [client?.id] impede que re-renderizações do pai sobrescrevam edições locais
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

  // 2. Valores Iniciais com useMemo seguro
  // Dependência [client?.id] evita o reset indesejado do formulário
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
      macroRegionId: client?.macroRegionId || ''
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
        
        // 3. CORREÇÃO CRÍTICA: Enviando IDs para evitar deleção e recriação no backend
        subsecretarias: subsecretarias.map(sub => ({
          id: sub.id, // Envia o ID se existir (edição)
          name: sub.name,
          regionais: (sub.regionais || []).map(reg => ({ 
             id: reg.id, // Envia o ID da regional se existir
             name: reg.name 
          }))
        })),
        
        productIds: values.selectedProducts,
        contentIds: values.selectedContents,
        macroRegionId: values.macroRegionId || undefined,
        selectedProducts: undefined,
        selectedContents: undefined
      }

      try {
        if (isNotEmpty(payload.id)) {
          await updateClient(payload as any)
        } else {
          await createClient(payload as any)
        }
        alert('Cliente salvo com sucesso!')
        
        // Se for criação, reseta. Se for edição, mantém para não perder contexto visual.
        if (!payload.id) {
             resetForm()
             setSubsecretarias([]) 
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
  const handleCreateSubsecretaria = (subsecretariaName: string) => {
    setSubsecretarias(prev => [
      ...prev,
      { name: subsecretariaName, regionais: [] }
    ])
    setShowSubsecretariaModal(false)
  }

  const handleCreateRegional = (regionalName: string, subsecretariaName: string) => {
    setSubsecretarias(prev => prev.map(sub =>
      sub.name === subsecretariaName
        ? { ...sub, regionais: [...(sub.regionais || []), { name: regionalName }] }
        : sub
    ))
    setShowRegionalModal(false)
    setRegionalModalSubsecretariaName('')
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

  // Helpers de Renderização (Corrigidos tipos)
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

  const renderSubsecretariasRegionais = () => {
      return (
       <div className='mb-7'>
         <div className='d-flex justify-content-between align-items-center mb-4'>
           <label className='fw-bold fs-4 mb-0'>Subsecretarias</label>
           <button type='button' className='btn btn-sm btn-primary' onClick={() => setShowSubsecretariaModal(true)}>
             <i className='fas fa-plus me-1'></i> Nova subsecretaria
           </button>
         </div>
         <div className='row g-4'>
           {subsecretarias.map((sub: SubsecretariaDto, subIndex: number) => (
             <div key={`sub-${subIndex}-${sub.name}`} className='col-12 col-md-6'>
               <div className='card shadow-sm h-100 border border-primary'>
                 <div className='card-header d-flex justify-content-between align-items-center bg-primary bg-opacity-10'>
                   <span className='fw-semibold fs-5 text-primary'>{sub.name}</span>
                   <button type='button' className='btn btn-icon btn-sm btn-light-danger' title='Remover subsecretaria' onClick={() => handleRemoveSubsecretaria(sub.name)}>
                     <i className='fas fa-trash'></i>
                   </button>
                 </div>
                 <div className='card-body'>
                   <div className='mb-2 fw-semibold text-gray-700'>Regionais vinculadas:</div>
                   {(!sub.regionais || sub.regionais.length === 0) && (
                     <div className='text-gray-500 mb-2'>Nenhuma regional cadastrada.</div>
                   )}
                   <ul className='list-group mb-3'>
                     {(sub.regionais || []).map((reg: RegionalDto, regIndex: number) => (
                       <li key={`reg-${subIndex}-${regIndex}-${reg.name}`} className='list-group-item d-flex justify-content-between align-items-center px-2 py-1 border-0 bg-light bg-opacity-75'>
                         <span className='text-gray-800'>{reg.name}</span>
                         <button type='button' className='btn btn-icon btn-xs btn-light-danger' title='Remover regional' onClick={() => handleRemoveRegional(sub.name, reg.name)}>
                           <i className='fas fa-trash'></i>
                         </button>
                       </li>
                     ))}
                   </ul>
                   <button type='button' className='btn btn-sm btn-light-primary w-100' onClick={() => { setShowRegionalModal(true); setRegionalModalSubsecretariaName(sub.name) }}>
                     <i className='fas fa-plus me-1'></i> Adicionar regional
                   </button>
                 </div>
               </div>
             </div>
           ))}
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

  return (
    <>
      <form id='kt_modal_add_client_form' className='form' onSubmit={formik.handleSubmit} noValidate>
        <div className='d-flex flex-column me-n7 pe-7'>
          {renderBasicFieldset('name', 'Client name', 'Full name')}
          {renderBasicFieldset('description', 'Description', 'Description', false)}
          
          {renderSelectFieldset('partner', 'Parceiro ', isLoadingPartners ? 'Carregando...' : 'Selecione um parceiro...', partnerOptions)}
          {renderSelectFieldset('contacts', 'Contato ', isLoadingContacts ? 'Carregando...' : 'Selecione um contato...', contactOptions)}
          {renderSelectFieldset('macroRegionId', 'Macro Região', isLoadingMacroRegions ? 'Carregando...' : 'Selecione uma macro região...', macroRegionOptions, false, false)}
          
          {/*{renderSelectFieldset('contract', 'Contract', 'Select a contract...', [{ value: '1', label: 'Contrato 1' }])}*/}
          
          {renderCalendarField('validity', 'Validade', 'Selecione a data de validade', true)}
          {renderCalendarField('signatureDate', 'Signature date', 'Select date', true)}
          {renderCalendarField('implantationDate', 'Implantation date', 'Select date', false)}
          
          {renderBasicFieldset('totalAccounts', 'Number of accounts', 'Accounts...', false, 'number')}
          {renderContentFieldset()}

          {renderSubsecretariasRegionais()}
        </div>

        <div className='text-center pt-15'>
          <button
            type='submit'
            className='btn btn-primary'
            data-kt-users-modal-action='submit'
            disabled={formik.isSubmitting || isUserLoading}
          >
            <span className='indicator-label'>Submit</span>
            {(formik.isSubmitting || isUserLoading) && (
              <span className='indicator-progress'>
                Please wait...{' '}
                <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
              </span>
            )}
          </button>
        </div>
      </form>

      <CreateOptionModal
        show={showSubsecretariaModal}
        title='Criar nova subsecretaria'
        placeholder='Nome da subsecretaria'
        onClose={() => setShowSubsecretariaModal(false)}
        onCreate={(newValue) => handleCreateSubsecretaria(newValue)}
      />

      <CreateOptionModal
        show={showRegionalModal}
        title={`Criar nova regional para: ${subsecretarias.find(s => s.name === regionalModalSubsecretariaName)?.name || 'Subsecretaria'}`}
        placeholder='Nome da regional'
        onClose={() => { setShowRegionalModal(false); setRegionalModalSubsecretariaName('') }}
        onCreate={(regionalName: string) => {
          const subName: string = regionalModalSubsecretariaName || subsecretarias[0]?.name || ''
          if (!subName) {
            alert('Erro: Nenhuma subsecretaria selecionada para vincular a regional.')
            return;
          }
          handleCreateRegional(regionalName, subName)
        }}
      />
    </>
  )
}

export { ClientCreateForm }