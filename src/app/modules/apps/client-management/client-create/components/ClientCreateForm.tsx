import React, { FC, useState, useEffect } from 'react'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import Select from 'react-select'
import { ClientType } from '../../../../../../interfaces/Client'
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


type SelectOptions = {
  value: string;
  label: string;
}

type ClientContactType = {
  name: string;
  id: string;
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
}

const ClientCreateForm: FC<Props> = ({ client, isUserLoading }) => {
  // Estrutura hierárquica dinâmica
  const [subsecretarias, setSubsecretarias] = useState<{
    value: string
    label: string
    regionais: { value: string; label: string }[]
  }[]>([])
  const [showSubsecretariaModal, setShowSubsecretariaModal] = useState(false)
  const [showRegionalModal, setShowRegionalModal] = useState(false)
  const [regionalModalSubsecretaria, setRegionalModalSubsecretaria] = useState<string>('')

  const intl = useIntl()

  useEffect(() => {
    // Mock inicial de opções hierárquicas
    setSubsecretarias([
      {
        value: '1',
        label: 'Subsecretaria 1',
        regionais: [
          { value: '1-1', label: 'Regional 1-1' },
          { value: '1-2', label: 'Regional 1-2' },
        ],
      },
      {
        value: '2',
        label: 'Subsecretaria 2',
        regionais: [
          { value: '2-1', label: 'Regional 2-1' },
        ],
      },
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
  // Adiciona regional à subsecretaria escolhida no modal
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
          <div className='d-flex justify-content-between align-items-center mb-4'>
            <label className='fw-bold fs-4 mb-0'>Subsecretarias</label>
            <button type='button' className='btn btn-sm btn-primary' onClick={() => setShowSubsecretariaModal(true)}>
              <i className='fas fa-plus me-1'></i> Nova subsecretaria
            </button>
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

      {/* Modal de criar regional agora recebe as subsecretarias para seleção */}
      <CreateOptionModal
        show={showRegionalModal}
        title='Criar nova regional'
        placeholder='Nome da regional'
        subsecretariaOptions={subsecretarias.map(sub => ({ value: sub.value, label: sub.label }))}
        selectedSubsecretaria={regionalModalSubsecretaria || subsecretarias[0]?.value || ''}
        onSelectSubsecretaria={(value: string) => setRegionalModalSubsecretaria(value ?? '')}
        onClose={() => { setShowRegionalModal(false); setRegionalModalSubsecretaria('') }}
        onCreate={(regionalValue, regionalLabel = '') => {
        const subValue: string = (regionalModalSubsecretaria && typeof regionalModalSubsecretaria === 'string')
          ? regionalModalSubsecretaria
          : (subsecretarias[0]?.value || '')
        handleCreateRegional(regionalValue, regionalLabel, subValue)
        }}
      />
    </>
  )
}

export { ClientCreateForm }