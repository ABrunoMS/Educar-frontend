import React, { FC, useState, useEffect, useMemo } from 'react'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import clsx from 'clsx'
import { useIntl } from 'react-intl'
import Select from 'react-select'
import { ClientType } from '@interfaces/Client'
import { SelectOptions } from '@interfaces/Forms'
import BasicField from '@components/form/BasicField'
import SelectField from '@components/form/SelectField'
import { createClient, updateClient } from '../../clients-list/core/_requests'
import { CreateOptionModal } from './CreateOptionModal'
import { isNotEmpty } from '@metronic/helpers'

type Props = {
  isUserLoading?: boolean
  client?: ClientType
}

export const initialClient: ClientType = {
  id: '',
  name: '',
  description: '',
  partner: '',
  contacts: '',
  contract: '',
  validity: '',
  signatureDate: '',
  implantationDate: '',
  totalAccounts: 0,
  subSecretary: '',
  regional: '',
  selectedProducts: [],
  selectedContents: [],
}

const products = [
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

const ClientCreateForm: FC<Props> = ({ client, isUserLoading }) => {
  // Estrutura hierárquica dinâmica
  const [subsecretarias, setSubsecretarias] = useState<{
    value: string
    label: string
    regionais: { value: string; label: string }[]
  }[]>([])
  const [showSubsecretariaModal, setShowSubsecretariaModal] = useState(false)
  const [showRegionalModal, setShowRegionalModal] = useState(false)
  // Este estado guarda o ID da subsecretaria cujo botão "Adicionar regional" foi clicado
  const [regionalModalSubsecretaria, setRegionalModalSubsecretaria] = useState<string>('')

  const intl = useIntl()

  useEffect(() => {
    // Mock inicial de opções hierárquicas
    setSubsecretarias([
      
    ])
  }, [])

  const dialogueForEdit: ClientType = {
    ...initialClient,
    name: client?.name || initialClient.name,
    description: client?.description || initialClient.description,
    partner: client?.partner || initialClient.partner,
    contacts: client?.contacts || initialClient.contacts,
    contract: client?.contract || initialClient.contract,
    validity: client?.validity || initialClient.validity,
    signatureDate: client?.signatureDate || initialClient.signatureDate,
    implantationDate: client?.implantationDate || initialClient.implantationDate,
    totalAccounts: client?.totalAccounts || initialClient.totalAccounts,
    subSecretary: client?.id || initialClient.id,
    regional: client?.regional || initialClient.regional,
    selectedProducts: client?.selectedProducts || [],
    selectedContents: client?.selectedContents || [],
  }

  const editSchema = Yup.object().shape({
    name: Yup.string().min(3).max(50).required('Nome é obrigatório'),
    partner: Yup.string().required('Parceiro é obrigatório'),
    contacts: Yup.string().required('Contatos são obrigatórios'),
    contract: Yup.string().required('Contrato é obrigatório'),
    validity: Yup.string().required('Validade é obrigatória'),
    signatureDate: Yup.string().required('Data de assinatura é obrigatória'),
    implantationDate: Yup.string().optional(),
    totalAccounts: Yup.number().moreThan(0).required('Número de contas é obrigatório'),
    subSecretary: Yup.string().required('Subsecretaria é obrigatória'),
    regional: Yup.string().required('Regional é obrigatória'),
    selectedProducts: Yup.array().of(Yup.string()).min(1, 'Selecione pelo menos um produto'),
    selectedContents: Yup.array().of(Yup.string()).min(1, 'Selecione pelo menos um conteúdo'),

  })

  const formik = useFormik({
    initialValues: dialogueForEdit,
    validationSchema: editSchema,
    validateOnChange: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      console.log('SUBMIT DEBUG', { values, errors: formik.errors, touched: formik.touched });
      setSubmitting(true)
      try {
        if (isNotEmpty(values.id)) {
          await updateClient(values)
        } else {
          await createClient(values)
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

  const availableContents = useMemo(() => {
    const contents = new Set<string>();
    
    formik.values.selectedProducts.forEach(product => {
      const compatible = contentCompatibility[product] || [];
      compatible.forEach(content => contents.add(content));
    });
    
    return Array.from(contents);
  }, [formik.values.selectedProducts]);

  const handleCreateSubsecretaria = (subsecretariaValue: string, subsecretariaLabel: string) => {
    setSubsecretarias(prev => [
      ...prev,
      { value: subsecretariaValue, label: subsecretariaLabel, regionais: [] }
    ])
    // Atualiza o campo subSecretary do formik
    formik.setFieldValue('subSecretary', subsecretariaValue)
    setShowSubsecretariaModal(false)
  }

  // Adiciona regional à subsecretaria selecionada
  const handleCreateRegional = (regionalValue: string, regionalLabel: string, subsecretariaValue: string) => {
    setSubsecretarias(prev => prev.map(sub =>
      sub.value === subsecretariaValue
        ? { ...sub, regionais: [...sub.regionais, { value: regionalValue, label: regionalLabel }] }
        : sub
    ))
    // Atualiza o campo regional do formik
    formik.setFieldValue('regional', regionalValue)
    setShowRegionalModal(false)
    setRegionalModalSubsecretaria('')
  }

  // Remover subsecretaria
  const handleRemoveSubsecretaria = (subValue: string) => {
    setSubsecretarias(prev => prev.filter(sub => sub.value !== subValue))
  }

  // Remover regional
  const handleRemoveRegional = (subValue: string, regValue: string) => {
    setSubsecretarias(prev => prev.map(sub =>
      sub.value === subValue
        ? { ...sub, regionais: sub.regionais.filter(reg => reg.value !== regValue) }
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

  // Renderiza campos dinâmicos de subsecretarias e regionais
    const renderSubsecretariasRegionais = () => {
      return (
        <div className='mb-7'>
          
          <div className='d-flex align-items-center mb-4'>
            <label className='fw-bold fs-4 mb-0'>Subsecretarias</label>
          </div>
          
          <div className='row g-4'>
            {subsecretarias.map((sub: { value: string; label: string; regionais: { value: string; label: string }[] }) => (
              <div key={sub.value} className='col-12 col-md-6'>
                <div className='card shadow-sm h-100 border border-primary'>
                  <div className='card-header d-flex justify-content-between align-items-center bg-primary bg-opacity-10'>
                    <span className='fw-semibold fs-5 text-primary'>{sub.label}</span>
                    <button type='button' className='btn btn-icon btn-sm btn-light-danger' title='Remover subsecretaria' onClick={() => handleRemoveSubsecretaria(sub.value)}>
                      <i className='fas fa-trash'></i>
                    </button>
                  </div>
                  <div className='card-body'>
                    <div className='mb-2 fw-semibold text-gray-700'>Regionais vinculadas:</div>
                    {sub.regionais.length === 0 && (
                      <div className='text-gray-500 mb-2'>Nenhuma regional cadastrada.</div>
                    )}
                    <ul className='list-group mb-3'>
                      {sub.regionais.map((reg: { value: string; label: string }) => (
                        <li key={reg.value} className='list-group-item d-flex justify-content-between align-items-center px-2 py-1 border-0 bg-light bg-opacity-75'>
                          <span className='text-gray-800'>{reg.label}</span>
                          <button type='button' className='btn btn-icon btn-xs btn-light-danger' title='Remover regional' onClick={() => handleRemoveRegional(sub.value, reg.value)}>
                            <i className='fas fa-trash'></i>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button type='button' className='btn btn-sm btn-light-primary w-100' onClick={() => { setShowRegionalModal(true); setRegionalModalSubsecretaria(sub.value) }}>
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
  <div className='px-2 py-3 rounded border'>
            {/* Produtos minimalistas responsivos */}
            <div className='mb-3'>
              <label className='form-label fw-semibold required fs-6 text-gray-700 mb-2'>Produtos</label>
              <div className='d-flex flex-row flex-wrap gap-1 overflow-auto pb-1'>
                {products.map(product => (
                  <label
                    key={product}
                    className={clsx(
                      'chip-minimal px-3 py-1 rounded-pill cursor-pointer',
                      formik.values.selectedProducts.includes(product)
                        ? 'border border-gray-500 chip-selected'
                        : 'border border-gray-300 text-gray-600'
                    )}
                    style={{ fontSize: '0.95rem', minWidth: '120px', userSelect: 'none', background: 'transparent', transition: 'all 0.2s' }}
                    htmlFor={`product-${product}`}
                  >
                    <input
                      className='d-none'
                      type='checkbox'
                      name='selectedProducts'
                      value={product}
                      checked={formik.values.selectedProducts.includes(product)}
                      onChange={formik.handleChange}
                      id={`product-${product}`}
                    />
                    {product}
                  </label>
                ))}
              </div>
            </div>

            {/* Conteúdos minimalistas responsivos */}
            <div className='mb-1'>
              <label className='form-label fw-semibold required fs-6 text-gray-700 mb-2'>Conteúdos</label>
              <div className='d-flex flex-row flex-wrap gap-1'>
                {availableContents.map(content => (
                  <label
                    key={content}
                    className={clsx(
                      'chip-minimal px-3 py-1 rounded-pill cursor-pointer',
                      formik.values.selectedContents.includes(content)
                        ? 'border border-gray-500 chip-selected'
                        : 'border border-gray-300 text-gray-600'
                    )}
                    style={{ fontSize: '0.95rem', minWidth: '100px', userSelect: 'none', background: 'transparent', transition: 'all 0.2s' }}
                    htmlFor={`content-${content}`}
                  >
                    <input
                      className='d-none'
                      type='checkbox'
                      name='selectedContents'
                      value={content}
                      checked={formik.values.selectedContents.includes(content)}
                      onChange={formik.handleChange}
                      id={`content-${content}`}
                    />
                    {content}
                  </label>
                ))}
              </div>
              {formik.values.selectedProducts.length === 0 && (
                <div className='text-muted fs-7 mt-2'>Selecione um produto para ver os conteúdos disponíveis.</div>
              )}
            </div>
          </div>
          {/* Botão de subsecretaria abaixo da section de conteúdo */}
          <div className='d-flex justify-content-center mt-4 mb-2'>
            <button type='button' className='btn btn-sm btn-primary' onClick={() => setShowSubsecretariaModal(true)}>
              <i className='fas fa-plus me-1'></i> Nova subsecretaria
            </button>
          </div>
          {/* Estilos responsivos para chips */}
          <style>{`
            .chip-minimal {
              box-shadow: none !important;
              font-size: 0.95rem;
              font-weight: 400;
              margin-bottom: 2px;
              border-width: 1px;
              background: transparent;
              transition: all 0.2s;
            }
            .chip-selected {
              border-width: 2px !important;
              box-shadow: 0 2px 8px 0 rgba(0,0,0,0.04);
              background: transparent !important;
              color: inherit !important;
            }
            @media (max-width: 600px) {
              .chip-minimal {
                min-width: 90px !important;
                font-size: 0.85rem !important;
                padding: 0.5rem 0.7rem !important;
              }
            }
            [data-bs-theme="dark"] .chip-minimal {
              color: #b5b5c3;
              border-color: #323248;
            }
            [data-bs-theme="dark"] .chip-selected {
              border-color: #b5b5c3 !important;
              box-shadow: 0 2px 8px 0 rgba(0,0,0,0.12);
              color: #fff !important;
            }
          `}</style>
        </>
      )
    }


  return (
    <>
      <form id='kt_modal_add_client_form' className='form' onSubmit={formik.handleSubmit} noValidate>
        <div className='d-flex flex-column me-n7 pe-7'>
          {renderBasicFieldset('name', 'Client name', 'Full name')}
          {renderBasicFieldset('description', 'Description', 'Description', false)}
          {renderSelectFieldset('partner', 'Partner', 'Select a partner...', [{ value: '1', label: 'Option 1' }])}
          {renderSelectFieldset('contacts', 'Contacts', 'Select contacts...', [{ value: '1', label: 'Contato 1' }])}
          {renderSelectFieldset('contract', 'Contract', 'Select a contract...', [{ value: '1', label: 'Contrato 1' }])}
          {renderBasicFieldset('validity', 'Validity', 'Validity')}
          {renderBasicFieldset('signatureDate', 'Signature date', 'Date')}
          {renderBasicFieldset('implantationDate', 'Implantation date', 'Date')}
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
        onCreate={(newValue) => handleCreateSubsecretaria(newValue, newValue)}
      />

      {/* Modal de criar regional: **Corrigido para vincular diretamente** à subsecretaria clicada. */}
      <CreateOptionModal
        show={showRegionalModal}
        title={`Criar nova regional para: ${subsecretarias.find(s => s.value === regionalModalSubsecretaria)?.label || 'Subsecretaria'}`}
        placeholder='Nome da regional'
        // REMOVIDOS os props de seleção: subsecretariaOptions, selectedSubsecretaria, onSelectSubsecretaria
        onClose={() => { setShowRegionalModal(false); setRegionalModalSubsecretaria('') }}
        // CORREÇÃO: regionalValue é usado como valor e label. O subValue vem do estado pre-definido.
        onCreate={(regionalValue: string) => {
          const subValue: string = regionalModalSubsecretaria || subsecretarias[0]?.value || ''

          // Verifica se há uma subsecretaria válida antes de criar
          if (!subValue) {
            alert('Erro: Nenhuma subsecretaria selecionada para vincular a regional.')
            return;
          }

          // regionalValue é usado como valor E label.
          handleCreateRegional(regionalValue, regionalValue, subValue)
        }}
      />
    </>
  )
}

export { ClientCreateForm }