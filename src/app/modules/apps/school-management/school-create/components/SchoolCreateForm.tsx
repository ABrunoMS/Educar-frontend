import React, { FC, useState} from 'react'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import clsx from 'clsx'
import { useIntl } from 'react-intl'
import { School } from '@interfaces/School'
import { SelectOptions } from '@interfaces/Forms'
import BasicField from '@components/form/BasicField'
import SelectField from '@components/form/SelectField'

type Props = {
  isUserLoading?: boolean
  school?: School
}

const addressOptions: SelectOptions[] = [
  { value: '1', label: 'Address 1' },
  { value: '2', label: 'Address 2' },
  { value: '3', label: 'Address 3' },
  { value: '4', label: 'Address 4' },
]

const clientOptions: SelectOptions[] = [
  { value: '1', label: 'Client 1' },
  { value: '2', label: 'Client 2' },
  { value: '3', label: 'Client 3' },
  { value: '4', label: 'Client 4' },
]

const initialSchool: School = {
  id: '',
  name: '',
  description: '',
  address: '',
  client: ''
}

const SchoolCreateForm: FC<Props> = ({ school, isUserLoading }) => {
  const [dialogueForEdit] = useState<School>({
    ...school,
    name: school?.name || initialSchool.name,
    description: school?.description || initialSchool.description,
    address: school?.address || initialSchool.address,
    client: school?.client || initialSchool.client
  })

  const intl = useIntl()

  const editSchema = Yup.object().shape({
    name: Yup.string()
      .required('Field is required'),
    description: Yup.string()
      .required('Field is required'),
    address: Yup.string()
      .required('Field is required'),
    client: Yup.string()
      .required('Field is required'),
  })

  const formik = useFormik({
    initialValues: dialogueForEdit,
    validationSchema: editSchema,
    validateOnChange: true,
    onSubmit: async (values, { setSubmitting }) => {
      // Handle form submission
    },
  })

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

  return (
    <>
      <form id='kt_modal_add_game_form' className='form' onSubmit={formik.handleSubmit} noValidate>
        <div className='d-flex flex-column me-n7 pe-7'>
          {/* Name */}
          {renderBasicFieldset('name', 'Nome', 'Enter name...')}

          {/* Description */}
          {renderBasicFieldset('description', 'Description', 'Enter description')}

          {/* Address */}
          {renderSelectFieldset('address', 'Address', 'Select a address', addressOptions, false, true)}

          {/* Client */}
          {renderSelectFieldset('client', 'Client', 'Select a client', clientOptions, false, true)}
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
    </>
  )
}

export { SchoolCreateForm }
