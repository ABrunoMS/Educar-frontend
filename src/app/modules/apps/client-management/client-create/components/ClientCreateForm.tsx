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
  secretaryId: '',
  subSecretary: '',
  regional: '',
}

const ClientCreateForm: FC<Props> = ({ client, isUserLoading }) => {
  const [subsecretariaOptions, setSubsecretariaOptions] = useState<SelectOptions[]>([])
  const [regionalOptions, setRegionalOptions] = useState<SelectOptions[]>([])
  const [showSubsecretariaModal, setShowSubsecretariaModal] = useState(false)
  const [showRegionalModal, setShowRegionalModal] = useState(false)
  const [newSubsecretaria, setNewSubsecretaria] = useState('')
  const [newRegional, setNewRegional] = useState('')

  const intl = useIntl()

  useEffect(() => {
    // Mock inicial de opções (pode ser substituído por chamadas de API)
    setSubsecretariaOptions([
      { value: '1', label: 'Subsecretaria 1' },
      { value: '2', label: 'Subsecretaria 2' },
    ])
    setRegionalOptions([
      { value: '1', label: 'Regional 1' },
      { value: '2', label: 'Regional 2' },
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
    secretaryId: client?.secretaryId || initialClient.secretaryId,
    subSecretary: client?.subSecretary || initialClient.subSecretary,
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
    const newOption = { value: subsecretariaValue, label: subsecretariaLabel }
    setSubsecretariaOptions(prev => [...prev, newOption])
    formik.setFieldValue('subSecretary', subsecretariaValue)
    setShowSubsecretariaModal(false)
  }

  const handleCreateRegional = (regionalValue: string, regionalLabel: string) => {
    const newOption = { value: regionalValue, label: regionalLabel }
    setRegionalOptions(prev => [...prev, newOption])
    formik.setFieldValue('regional', regionalValue)
    setShowRegionalModal(false)
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

  const renderSelectFieldWithModal = (
    fieldName: string,
    label: string,
    placeholder: string | null,
    options: SelectOptions[],
    onOpenModal: () => void
  ) => (
    <div className='fv-row mb-7'>
      <label className='fw-semibold fs-6 mb-2'>{label}</label>
      <div className='d-flex gap-2'>
        <div className='flex-grow-1'>
          <Select
            className={clsx(
              'react-select-styled react-select-solid mb-3 mb-lg-0',
              {'is-invalid': formik.getFieldMeta(fieldName).error}
            )}
            classNamePrefix='react-select'
            options={options}
            placeholder={placeholder}
            value={options.find(option => option.value === formik.values[fieldName as keyof typeof formik.values])}
            name={fieldName}
            onChange={newValue => formik.setFieldValue(fieldName, newValue?.value)}
            isDisabled={formik.isSubmitting || isUserLoading}
            styles={{
              container: base => ({ ...base, width: '100%' }),
              control: base => ({
                ...base,
                minHeight: '38px',
                backgroundColor: 'var(--bs-input-bg, #f5f8fa)',
                borderColor: formik.getFieldMeta(fieldName).error ? 'var(--bs-danger, #f1416c)' : 'var(--bs-input-border, #e4e6ef)',
                boxShadow: 'none',
                '&:hover': { borderColor: formik.getFieldMeta(fieldName).error ? 'var(--bs-danger, #f1416c)' : 'var(--bs-primary, #009ef7)' },
              }),
              singleValue: base => ({ ...base, color: 'var(--bs-input-color, #181c32)' }),
              menu: base => ({ ...base, zIndex: 9999, backgroundColor: 'var(--bs-input-bg, #fff)' }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected
                  ? 'var(--bs-primary, #009ef7)'
                  : state.isFocused
                  ? 'var(--bs-primary-light, #e7f1ff)'
                  : 'var(--bs-input-bg, #fff)',
                color: state.isSelected ? 'var(--bs-white, #fff)' : 'var(--bs-input-color, #181c32)',
                fontWeight: state.isSelected ? 600 : 400,
              }),
              placeholder: base => ({ ...base, color: 'var(--bs-input-placeholder-color, #b5b5c3)' }),
              dropdownIndicator: base => ({ ...base, color: 'var(--bs-primary, #009ef7)' }),
              indicatorSeparator: base => ({ ...base, backgroundColor: 'var(--bs-input-border, #e4e6ef)' }),
            }}
            theme={theme => ({
              ...theme,
              borderRadius: 6,
              colors: {
                ...theme.colors,
                primary25: 'var(--bs-primary-light, #e7f1ff)',
                primary: 'var(--bs-primary, #009ef7)',
                neutral0: 'var(--bs-input-bg, #fff)',
                neutral20: 'var(--bs-input-border, #e4e6ef)',
                neutral30: 'var(--bs-primary, #009ef7)',
                neutral80: 'var(--bs-input-color, #181c32)',
              },
            })}
          />
          {formik.getFieldMeta(fieldName).touched && formik.getFieldMeta(fieldName).error && (
            <div className='fv-plugins-message-container'>
              <div className='fv-help-block'>
                <span role='alert'>{formik.getFieldMeta(fieldName).error}</span>
              </div>
            </div>
          )}
        </div>
        <button
          type='button'
          className='btn btn-sm btn-light-primary'
          onClick={onOpenModal}
        >
          <i className='fas fa-plus'></i>
          Novo
        </button>
      </div>
    </div>
  )

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

          {renderSelectFieldWithModal(
            'subSecretary',
            'Subsecretaria',
            'Selecione uma subsecretaria...',
            subsecretariaOptions,
            () => setShowSubsecretariaModal(true)
          )}
          {renderSelectFieldWithModal(
            'regional',
            'Regional',
            'Selecione uma regional...',
            regionalOptions,
            () => setShowRegionalModal(true)
          )}
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

      <CreateOptionModal
        show={showRegionalModal}
        title='Criar nova regional'
        placeholder='Nome da regional'
        onClose={() => setShowRegionalModal(false)}
        onCreate={(newValue) => handleCreateRegional(newValue, newValue)}
      />
    </>
  )
}

export { ClientCreateForm }