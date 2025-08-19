import React, { FC, useState, useEffect} from 'react'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import Select from 'react-select'
import { ClientType } from '../../../../../../interfaces/Client'
import clsx from 'clsx'
import { useIntl } from 'react-intl'
import { createClient, updateClient } from '../../clients-list/core/_requests'
import { getSecretaries } from '@services/Secretaries'
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

type ClientContractType = {
  name: string;
  id: string;
}

export const initialClient: ClientType = {
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
}

const contacts: ClientContactType[] = [
  { name: 'Contato 1', id: '1' },
  { name: 'Contato 2', id: '2' },
]

const contracts: ClientContractType[] = [
  { name: 'Contratos 1', id: '1' },
  { name: 'Contratos 2', id: '2' },
]

const options: SelectOptions[] = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3' },
  { value: '4', label: 'Option 4' },
]

const ClientCreateForm: FC<Props> = ({client, isUserLoading}) => {
  const [secretaryOptions, setSecretaryOptions] = useState<SelectOptions[]>([]);
  const [userForEdit] = useState<ClientType>({
    ...client,
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
  })

  const intl = useIntl()

  useEffect(() => {
    // Buscar secretarias da API
    getSecretaries().then((response) => {
      const secretaryOptions = response.data.items.map((secretary: any) => ({
        value: secretary.id,
        label: secretary.name,
      }));
      setSecretaryOptions(secretaryOptions);
    }).catch((error) => {
      console.error('Erro ao buscar secretarias:', error);
    });
  }, []);

  const editUserSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, 'Minimum 3 symbols')
      .max(50, 'Maximum 50 symbols')
      .required('Field is required'),
    description: Yup.string()
      .min(3, 'Minimum 3 symbols')
      .max(50, 'Maximum 50 symbols'),
    partner: Yup.string()
      .required('Field is required'),
    contacts: Yup.string()
      .required('Field is required'),
    contract: Yup.string()
      .required('Field is required'),
    validity: Yup.string()
      .min(3, 'Minimum 3 symbols')
      .max(50, 'Maximum 50 symbols')
      .required('Field is required'),
    signatureDate: Yup.string()
      .min(3, 'Minimum 3 symbols')
      .max(50, 'Maximum 50 symbols')
      .required('Field is required'),
    implantationDate: Yup.string()
      .min(3, 'Minimum 3 symbols')
      .max(50, 'Maximum 50 symbols'),
    totalAccounts: Yup.number()
      .moreThan(0, 'Bigger than zero')
      .required('Field is required'),
    secretaryId: Yup.string()
      .required('Secretaria é obrigatória'),
  })

  const formik = useFormik({
    initialValues: userForEdit,
    validationSchema: editUserSchema,
    validateOnChange: true,
    onSubmit: async (values, {setSubmitting}) => {
       setSubmitting(true)
       try {
         if (isNotEmpty(values.id)) {
           await updateClient(values)
         } else {
           await createClient(values)
         }
       } catch (ex) {
         console.error(ex)
       } finally {
         setSubmitting(false)
          formik.resetForm()
       }
    },
  })

  const getDefaultSelectValue = (name: string): SelectOptions[] => {
    const initialValue = formik.getFieldProps(name).value; 
    return options.filter(option => option.value === initialValue);
  }

  const updateSelectValue = (newValue: string | undefined, field: string) => {
    formik.setFieldValue(field, newValue)
  }

  const renderBasicFieldset = (fieldName: string, label: string, placeholder: string | null, required: boolean = true) => (
    <div className='fv-row mb-7'>
      <label
        className={clsx(
          'fw-bold fs-6 mb-2',
          {'required': required}
        )}
      >{label}</label>
      <input
        placeholder={placeholder || undefined}
        {...formik.getFieldProps(fieldName)}
        type='text'
        name={fieldName}
        className={clsx(
          'form-control form-control-solid mb-3 mb-lg-0',
          {'is-invalid': formik.getFieldMeta(fieldName).touched && formik.getFieldMeta(fieldName).error},
          {
            'is-valid': formik.getFieldMeta(fieldName).touched && !formik.getFieldMeta(fieldName).error,
          }
        )}
        autoComplete='off'
        disabled={formik.isSubmitting || isUserLoading}
      />
      {formik.getFieldMeta(fieldName).touched && formik.getFieldMeta(fieldName).error && (
        <div className='fv-plugins-message-container'>
          <div className='fv-help-block'>
            <span role='alert'>{formik.getFieldMeta(fieldName).error}</span>
          </div>
        </div>
      )}
    </div>
  )

  const renderSelectFieldset = (fieldName: string, label: string, placeholder: string | null, required: boolean = true) => (
    <div className=' mb-7'>
      <label
        className={clsx(
          'fw-bold fs-6 mb-2',
          {'required': required}
        )}
      >{label}</label>
      <Select 
        className={clsx(
          'react-select-styled react-select-solid mb-3 mb-lg-0',
          {'is-invalid': formik.getFieldMeta(fieldName).error}
        )}
        classNames={{
            control: () => ('border-danger'),
        }}
        classNamePrefix='react-select' 
        options={options}
        placeholder={placeholder}
        defaultValue={getDefaultSelectValue(fieldName)}
        name={fieldName}
        onChange={(newValue) => updateSelectValue(newValue?.value, fieldName)}
        isDisabled={formik.isSubmitting || isUserLoading}
      />

      {formik.getFieldMeta(fieldName).touched && formik.getFieldMeta(fieldName).error && (
        <div className='fv-plugins-message-container'>
          <div className='fv-help-block'>
            <span role='alert'>{formik.getFieldMeta(fieldName).error}</span>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <>
      <form id='kt_modal_add_user_form' className='form' onSubmit={formik.handleSubmit} noValidate>
        <div
          className='d-flex flex-column me-n7 pe-7'
        >
          {/* Name */}
          {renderBasicFieldset('name', 'Client name', 'Full name')}

          {/* Partner */}
          {renderSelectFieldset('partner', 'Partner', 'Partner...')}

          {/* Description */}
          {renderBasicFieldset('description', 'Description', 'Description', false)}

          {/* Contacts */}
          {renderSelectFieldset('contacts', 'Contacts', 'Contacts...')}

          {/* Client Contracts */}
          {renderSelectFieldset('contract', 'Contract', 'Contract...')}

          {/* Validity */}
          {renderBasicFieldset('validity', 'Validity', 'Validity')}
          
          {/* Signature date */}
          {renderBasicFieldset('signatureDate', 'Signature date', 'Date')}
          
          {/* Implantation date */}
          {renderBasicFieldset('implantationDate', 'Impantation date', 'Date')}
          
          {/* Total accounts */}
          {renderBasicFieldset('totalAccounts', 'Number of accounts', 'Accounts...', false)}
          
          {/* Secretary */}
          <div className=' mb-7'>
            <label
              className={clsx(
                'fw-bold fs-6 mb-2',
                {'required': true}
              )}
            >Secretaria</label>
            <Select 
              className={clsx(
                'react-select-styled react-select-solid mb-3 mb-lg-0',
                {'is-invalid': formik.getFieldMeta('secretaryId').error}
              )}
              classNames={{
                  control: () => ('border-danger'),
              }}
              classNamePrefix='react-select' 
              options={secretaryOptions}
              placeholder='Selecione uma secretaria...'
              defaultValue={secretaryOptions.filter(option => option.value === formik.getFieldProps('secretaryId').value)}
              name='secretaryId'
              onChange={(newValue) => updateSelectValue(newValue?.value, 'secretaryId')}
              isDisabled={formik.isSubmitting || isUserLoading}
            />

            {formik.getFieldMeta('secretaryId').touched && formik.getFieldMeta('secretaryId').error && (
              <div className='fv-plugins-message-container'>
                <div className='fv-help-block'>
                  <span role='alert'>{formik.getFieldMeta('secretaryId').error}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className='text-center pt-15'>
          <button
            type='submit'
            className='btn btn-primary'
            data-kt-users-modal-action='submit'
            // disabled={isUserLoading || formik.isSubmitting || !formik.isValid || !formik.touched}
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
        {/* end::Actions */}
      </form>
      {/* {(formik.isSubmitting || isUserLoading) && <UsersListLoading />} */}
    </>
  )
}

export {ClientCreateForm}
