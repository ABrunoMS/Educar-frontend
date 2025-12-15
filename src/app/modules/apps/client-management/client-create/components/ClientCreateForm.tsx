import React, { FC, useState, useEffect } from 'react'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import clsx from 'clsx'
import { useIntl } from 'react-intl'
import Select from 'react-select'
import { ClientType, SubsecretariaDto, RegionalDto } from '@interfaces/Client'
import { SelectOptions } from '@interfaces/Forms'
import BasicField from '@components/form/BasicField'
import SelectField from '@components/form/SelectField'
import { createClient, updateClient, getAllProducts, getCompatibleContents, ProductDto, ContentDto } from '../../clients-list/core/_requests'
import { CreateOptionModal } from './CreateOptionModal'
import { isNotEmpty } from '@metronic/helpers'
import Flatpickr from 'react-flatpickr'
import "flatpickr/dist/themes/material_green.css";
import { getAccountsByRole } from '@services/Accounts'

type Props = {
  isUserLoading?: boolean
  client?: ClientType
  onFormSubmit: () => void
}

type ClientFormValues = Omit<ClientType, 'signatureDate' | 'implantationDate'| 'validity'> & {
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
}

/*const products = [
  'Odisseia Educacional',
  'Odisseia Dungeons',
  'Jornada do Saber (ENEM)',
  'Jornada do Saber (SAEB)',
  'Trilha para o Futuro',
  'Jornada do Trabalho',
  'Realidade Mágica',
];

const contentCompatibility: { [key: string]: string[] } = {
  'Odisseia Educacional': ['BNCC', 'SAEB', 'ENEM', 'Jornada do Trabalho', 'Educação Financeira', 'Empreendedorismo'],
  'Odisseia Dungeons': ['BNCC', 'SAEB', 'ENEM', 'Jornada do Trabalho', 'Educação Financeira', 'Empreendedorismo'],
  'Jornada do Saber (ENEM)': ['ENEM'],
  'Jornada do Saber (SAEB)': ['SAEB'],
  'Trilha para o Futuro': ['Educação Financeira', 'Empreendedorismo'],
  'Jornada do Trabalho': ['Jornada do Trabalho'],
  'Realidade Mágica': ['BNCC'],
};

// Lista de todos os conteúdos possíveis
const allContents = ['BNCC', 'SAEB', 'ENEM', 'Jornada do Trabalho', 'Educação Financeira', 'Empreendedorismo'];
*/

const ClientCreateForm: FC<Props> = ({ client, isUserLoading }) => {
  // Estrutura hierárquica dinâmica - agora usa SubsecretariaDto[]
  const [subsecretarias, setSubsecretarias] = useState<SubsecretariaDto[]>([])
  const [showSubsecretariaModal, setShowSubsecretariaModal] = useState(false)
  const [showRegionalModal, setShowRegionalModal] = useState(false)
  // Este estado guarda o nome da subsecretaria cujo botão "Adicionar regional" foi clicado
  const [regionalModalSubsecretariaName, setRegionalModalSubsecretariaName] = useState<string>('')

  const intl = useIntl()

  const [allProducts, setAllProducts] = useState<ProductDto[]>([])
  const [availableContents, setAvailableContents] = useState<ContentDto[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [isLoadingContents, setIsLoadingContents] = useState(false)

  // Estados para opções de parceiro (Distribuidor) e contato (Agente Comercial)
  const [partnerOptions, setPartnerOptions] = useState<SelectOptions[]>([])
  const [contactOptions, setContactOptions] = useState<SelectOptions[]>([])
  const [isLoadingPartners, setIsLoadingPartners] = useState(false)
  const [isLoadingContacts, setIsLoadingContacts] = useState(false)

  useEffect(() => {
    // Inicializa com lista vazia
    setSubsecretarias([])
  }, [])

  // Buscar usuários com role Distribuidor (para campo Partner)
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

  // Buscar usuários com role Agente Comercial (para campo Contacts)
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


  // Preenche os estados de subsecretaria e regional ao editar
  useEffect(() => {
    // Verifica se estamos no modo de edição e se os dados do cliente já chegaram
    if (client && client.subsecretarias && client.subsecretarias.length > 0) {
      setSubsecretarias(client.subsecretarias);
    }
  }, [client]);


  // --- EFEITO PARA BUSCAR PRODUTOS NA API (AO MONTAR) ---
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true)
      try {
        const productData = await getAllProducts()
        // A API retorna um PaginatedList, pegamos os 'items'
        setAllProducts(productData.data || []) 
      } catch (error) {
        console.error('Falha ao buscar produtos:', error)
        // Tratar erro (ex: toast)
      } finally {
        setIsLoadingProducts(false)
      }
    }
    fetchProducts()
  }, [])

  const dialogueForEdit: ClientFormValues = {
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
      : (client?.selectedProducts || []), // Fallback para a estrutura antiga
      
    selectedContents: client?.contents 
      ? client.contents.map(c => c.id) 
      : (client?.selectedContents || []), // Fallback
  }

  const editSchema = Yup.object().shape({
    name: Yup.string().min(3).max(50).required('Nome é obrigatório'),
    partner: Yup.string().required('Parceiro é obrigatório'),
    contacts: Yup.string().required('Contatos são obrigatórios'),
    contract: Yup.string().required('Contrato é obrigatório'),
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
      console.log('SUBMIT DEBUG', { values, errors: formik.errors, touched: formik.touched });
      setSubmitting(true)

      const { products, contents, ...formValues } = values;

      const payload= {
        ...formValues,
        id: formValues.id || undefined, 
        
        validity: values.validity 
          ? (values.validity as Date).toISOString() 
          : undefined,

        signatureDate: values.signatureDate 
          ? (values.signatureDate as Date).toISOString() 
          : undefined,
        implantationDate: values.implantationDate 
          ? (values.implantationDate as Date).toISOString() 
          : undefined,

        // Envia a estrutura de subsecretarias com regionais aninhadas
        subsecretarias: subsecretarias.map(sub => ({
          name: sub.name,
          regionais: (sub.regionais || []).map(reg => ({ name: reg.name }))
        })),

        productIds: values.selectedProducts,
        contentIds: values.selectedContents,

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
        resetForm()
      } catch (ex) {
        console.error(ex)
        alert('Houve um erro ao salvar o cliente. Por favor, tente novamente.')
      } finally {
        setSubmitting(false)
      }
    },
  })

useEffect(() => {
    const fetchCompatibleContents = async () => {
      const selectedProductIds = formik.values.selectedProducts
      
      if (selectedProductIds.length === 0) {
        setAvailableContents([])
        // Limpa também os conteúdos selecionados se nenhum produto está ativo
        formik.setFieldValue('selectedContents', [])
        return
      }

      setIsLoadingContents(true)
      try {
        // Cria um array de Promises, uma para cada produto selecionado
        const fetchPromises = selectedProductIds.map(id => getCompatibleContents(id))
        
        // Espera todas as chamadas terminarem
        const results = await Promise.all(fetchPromises) // results é ContentDto[][]

        // Junta todos os arrays de conteúdos e remove duplicatas
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

        // **Importante:** Limpa do formik os conteúdos que não são mais compatíveis
        const availableContentIds = new Set(newAvailableContents.map(c => c.id))
        const filteredSelectedContents = formik.values.selectedContents.filter(id =>
          availableContentIds.has(id)
        )
        
        formik.setFieldValue('selectedContents', filteredSelectedContents)

      } catch (error) {
        console.error('Falha ao buscar conteúdos compatíveis:', error)
      } finally {
        setIsLoadingContents(false)
      }
    }

    fetchCompatibleContents()
    // Dependência: o array de IDs de produtos selecionados.
    // O Formik cria um novo array a cada mudança, disparando o efeito.
  }, [formik.values.selectedProducts])

/*const availableContents = useMemo(() => {
    const contents = new Set<string>();
    
    formik.values.selectedProducts.forEach(product => {
      const compatible = contentCompatibility[product] || [];
      compatible.forEach(content => contents.add(content));
    });
    
    return Array.from(contents);
  }, [formik.values.selectedProducts]);
*/
  const handleCreateSubsecretaria = (subsecretariaName: string) => {
    setSubsecretarias(prev => [
      ...prev,
      { name: subsecretariaName, regionais: [] }
    ])
    setShowSubsecretariaModal(false)
  }

  // Adiciona regional à subsecretaria selecionada
  const handleCreateRegional = (regionalName: string, subsecretariaName: string) => {
    setSubsecretarias(prev => prev.map(sub =>
      sub.name === subsecretariaName
        ? { ...sub, regionais: [...(sub.regionais || []), { name: regionalName }] }
        : sub
    ))
    setShowRegionalModal(false)
    setRegionalModalSubsecretariaName('')
  }

  // Remover subsecretaria
  const handleRemoveSubsecretaria = (subName: string) => {
    setSubsecretarias(prev => prev.filter(sub => sub.name !== subName))
  }

  // Remover regional
  const handleRemoveRegional = (subName: string, regName: string) => {
    setSubsecretarias(prev => prev.map(sub =>
      sub.name === subName
        ? { ...sub, regionais: (sub.regionais || []).filter(reg => reg.name !== regName) }
        : sub
    ))
  }

  const renderBasicFieldset = (
    fieldName: string,
    label: string,
    placeholder: string | null,
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
    placeholder: string | null,
    options: SelectOptions[],
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

const updateCalendarValue = (newValue: Date | undefined, field: keyof ClientFormValues) => {
    formik.setFieldValue(field, newValue)
  }

  // 3. NA VISÃO (RENDER): Formata a exibição para "d/m/Y"
  const renderCalendarField = (fieldName: keyof ClientFormValues, label: string, placeholder: string | null, required: boolean = true) => (
    <div className=' mb-7'>
      <label
        className={clsx(
          'fw-bold fs-6 mb-2',
          {'required': required}
        )}
      >{label}</label>
      <Flatpickr
        className='form-control form-control-solid'
        placeholder={placeholder || ''}
        // data-enable-time (REMOVIDO para salvar só a data)
        value={formik.values[fieldName] as Date} 
        onChange={(date: Date[]) => {
          if(date[0] instanceof Date) return updateCalendarValue(date[0], fieldName)
          return updateCalendarValue(undefined, fieldName) 
        }}
        // --- AQUI ESTÁ A MÁGICA ---
        // 'options' controla apenas a exibição visual do Flatpickr
        options={{
          dateFormat: "d/m/Y", // Formato de exibição: DD/MM/YYYY
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

  // Renderiza campos dinâmicos de subsecretarias e regionais
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
      <div className='row'>
        {/* Coluna de Produtos */}
        <div className='col-md-6'>
          <label className='form-label fw-bold required'>Produtos</label>
         {isLoadingProducts && (
              <div className='d-flex align-items-center text-muted fs-7'>
                <span className='spinner-border spinner-border-sm me-2'></span>
                Carregando produtos...
              </div>
            )}

            {/* Itera sobre os produtos da API */}
            {!isLoadingProducts && allProducts.map(product => (
              <div className='form-check form-check-solid mb-3' key={product.id}>
                <input
                  className='form-check-input'
                  type='checkbox'
                  name='selectedProducts'
                  value={product.id} // <-- USA O ID
                  checked={formik.values.selectedProducts.includes(product.id)} // <-- CHECA PELO ID
                  onChange={formik.handleChange}
                />
                <label className='form-check-label'>{product.name}</label> {/* <-- MOSTRA O NOME */}
              </div>
            ))}
          </div>

        {/* Coluna de Conteúdos (renderização condicional) */}
        <div className='col-md-6'>
            <label className='form-label fw-bold required'>Conteúdos</label>

            {/* Indicador de Loading para Conteúdos */}
            {isLoadingContents && (
              <div className='d-flex align-items-center text-muted fs-7'>
                <span className='spinner-border spinner-border-sm me-2'></span>
                Buscando conteúdos...
              </div>
            )}
            
            {/* Itera sobre os conteúdos disponíveis da API */}
            {!isLoadingContents && availableContents.map(content => (
              <div className='form-check form-check-solid mb-3' key={content.id}>
                <input
                  className='form-check-input'
                  type='checkbox'
                  name='selectedContents'
                  value={content.id} // <-- USA O ID
                  checked={formik.values.selectedContents.includes(content.id)} // <-- CHECA PELO ID
                  onChange={formik.handleChange}
                />
                <label className='form-check-label'>{content.name}</label> {/* <-- MOSTRA O NOME */}
              </div>
            ))}

            {/* Mensagem de ajuda se nenhum produto for selecionado */}
            {!isLoadingContents && formik.values.selectedProducts.length === 0 && (
              <div className='text-muted fs-7'>Selecione um produto para ver os conteúdos disponíveis.</div>
            )}

            {/* Mensagem se produtos estão selecionados mas não há conteúdos (ou ainda carregando) */}
            {!isLoadingContents && availableContents.length === 0 && formik.values.selectedProducts.length > 0 && (
                <div className='text-muted fs-7'>Nenhum conteúdo compatível encontrado.</div>
            )}
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
          {renderSelectFieldset('contract', 'Contract', 'Select a contract...', [{ value: '1', label: 'Contrato 1' }])}
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

      {/* Modal de criar regional: vincular diretamente à subsecretaria clicada. */}
      <CreateOptionModal
        show={showRegionalModal}
        title={`Criar nova regional para: ${subsecretarias.find(s => s.name === regionalModalSubsecretariaName)?.name || 'Subsecretaria'}`}
        placeholder='Nome da regional'
        onClose={() => { setShowRegionalModal(false); setRegionalModalSubsecretariaName('') }}
        onCreate={(regionalName: string) => {
          const subName: string = regionalModalSubsecretariaName || subsecretarias[0]?.name || ''

          // Verifica se há uma subsecretaria válida antes de criar
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