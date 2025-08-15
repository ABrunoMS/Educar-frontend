import React, { FC, useState} from 'react'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import Select from 'react-select'
import Flatpickr from "react-flatpickr"
import clsx from 'clsx'
import { useIntl } from 'react-intl'
import { ContractCreate } from '@interfaces/Contract'
import BasicField from '@components/form/BasicField'
import SelectField from '@components/form/SelectField'
import { SelectOptions } from '@interfaces/Forms'

type Props = {
  isUserLoading?: boolean
  contract?: ContractCreate
}

export const initialContract: ContractCreate = {
  contractDurationInYears: 0,
  contractSigningDate: null,
  implementationDate: null,
  totalAccounts: 0,
  remainingAccounts: 0,
  deliveryReport: '',
  status: 'Signed',
  clientId: '',
  gameId: '',
}

const options: SelectOptions[] = [
  { value: '1', label: 'Client 1' },
  { value: '2', label: 'Client 2' },
  { value: '3', label: 'Client 3' },
  { value: '4', label: 'Client 4' },
]

const gameOptions: SelectOptions[] = [
  { value: '1', label: 'Game 1' },
  { value: '2', label: 'Game 2' },
  { value: '3', label: 'Game 3' },
  { value: '4', label: 'Game 4' },
]

const statusOptions: SelectOptions[] = [
  { value: 'Signed', label: 'Assinado' },
  { value: 'Expired', label: 'Expirado' },
  { value: 'Canceled', label: 'Cancelado' }
]

const ContractCreateForm: FC<Props> = ({contract, isUserLoading}) => {
  const [userForEdit] = useState<ContractCreate>({
    ...contract,
    contractDurationInYears: contract?.contractDurationInYears || initialContract.contractDurationInYears,
    contractSigningDate: contract?.contractSigningDate || initialContract.contractSigningDate,
    implementationDate: contract?.implementationDate || initialContract.implementationDate,
    totalAccounts: contract?.totalAccounts || initialContract.totalAccounts,
    remainingAccounts: contract?.remainingAccounts || initialContract.remainingAccounts,
    deliveryReport: contract?.deliveryReport || initialContract.deliveryReport,
    status: contract?.status || initialContract.status,
    clientId: contract?.clientId || initialContract.clientId,
    gameId: contract?.gameId || initialContract.gameId,
  })

  const intl = useIntl()

  const editUserSchema = Yup.object().shape({
    contractDurationInYears: Yup.number()
      .min(1, 'At least one year')
      .required('Field is required'),
    contractSigningDate: Yup.date()
      .required('Field is required'),
    implementationDate: Yup.date()
      .required('Field is required'),
    totalAccounts: Yup.number()
      .moreThan(0, 'Bigger than zero'),
    remainingAccounts: Yup.number()
      .required('Field is required'),
    deliveryReport: Yup.string()
      .required('Field is required'),
    status: Yup.string()
      .required('Field is required'),
    clientId: Yup.string()
      .required('Field is required'),
    gameId: Yup.string()
      .required('Field is required'),
  })

  const formik = useFormik({
    initialValues: userForEdit,
    validationSchema: editUserSchema,
    validateOnChange: true,
    onSubmit: async (values, {setSubmitting}) => {},
  })

  const getDefaultSelectValue = (name: string): SelectOptions[] => {
    const initialValue = formik.getFieldProps(name).value; 
    return options.filter(option => option.value === initialValue);
  }

  const updateCalendarValue = (newValue: Date | undefined, field: string) => {
    formik.setFieldValue(field, newValue)
  }

  const renderBasicFieldset = (
    fieldName: string,
    label: string,
    placeholder: string | null,
    required: boolean = true
  ) =>
  <BasicField
    fieldName={fieldName}
    label={label}
    placeholder={placeholder}
    required={required}
    formik={formik}
  />

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

  const renderCalendarField = (fieldName: string, label: string, placeholder: string | null, required: boolean = true) => (
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
        data-enable-time
        // value={getDefaultSelectValue(fieldName)}
        onChange={(date: Date[]) => {
          if(date[0] instanceof Date) return updateCalendarValue(date[0], fieldName)
          return updateCalendarValue(undefined, fieldName)
        }}
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
          {renderBasicFieldset('contractDurationInYears', 'Total time', 'Total years...')}

          {/* Sign date */}
          {renderCalendarField('contractSigningDate', 'Contract date', 'Date')}

          {/* Sign date */}
          {renderCalendarField('implementationDate', 'Implementation date', 'Date')}

          {/* Total accounts */}
          {renderBasicFieldset('totalAccounts', 'Total accounts', 'Number of accounts')}

          {/* Remaining accounts */}
          {renderBasicFieldset('remainingAccounts', 'Remaining accounts', 'Number of accounts')}

          {/* Report */}
          {renderBasicFieldset('deliveryReport', 'Report', 'Report')}

          {/* Status */}
          {renderBasicFieldset('status', 'Status', 'Status')}

          {/* Client */}
          {renderSelectFieldset('clientId', 'Client', 'Select...', options)}

          {/* Game */}
          {renderSelectFieldset('gameId', 'Game', 'Select...', gameOptions)}
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

export {ContractCreateForm}
