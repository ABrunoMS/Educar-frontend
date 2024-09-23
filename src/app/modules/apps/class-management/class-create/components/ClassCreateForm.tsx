import React, { FC, useState} from 'react'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import { useIntl } from 'react-intl'
import { Class } from '@interfaces/Class'
import { SelectOptions } from '@interfaces/Forms'
import BasicField from '@components/form/BasicField'
import SelectField from '@components/form/SelectField'

type Props = {
  isUserLoading?: boolean
  classData?: Class
}

const initialClass: Class = {
  id: '',
  name: '',
  description: '',
  purpose: '',
  accountIds: []
}

const selectOptions: SelectOptions[] = [
  { value: '1', label: 'Account 1' },
  { value: '2', label: 'Account 2' },
  { value: '3', label: 'Account 3' },
  { value: '4', label: 'Account 4' },
]

const ClassCreateForm: FC<Props> = ({ classData, isUserLoading }) => {
  const [classForEdit] = useState<Class>({
    ...initialClass,
    ...classData
  })

  const intl = useIntl()

  const editClassSchema = Yup.object().shape({
    name: Yup.string().required('Field is required'),
    description: Yup.string().required('Field is required'),
    purpose: Yup.string().required('Field is required'),
    accountIds: Yup.array().of(Yup.string()).min(1, 'Field is required')
  })

  const formik = useFormik({
    initialValues: classForEdit,
    validationSchema: editClassSchema,
    validateOnChange: true,
    onSubmit: async (values, { setSubmitting }) => {
      // Handle form submission
      console.log('Form values:', values)
      setSubmitting(false)
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
      <form id='kt_modal_add_class_form' className='form' onSubmit={formik.handleSubmit} noValidate>
        <div className='d-flex flex-column me-n7 pe-7'>
          {renderBasicFieldset('name', 'Name', 'Enter class name')}
          {renderBasicFieldset('description', 'Description', 'Enter class description')}
          {renderBasicFieldset('purpose', 'Purpose', 'Enter class purpose')}
          {renderSelectFieldset('accountIds', 'Account IDs', 'Select account IDs', selectOptions, true, true)}
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

export { ClassCreateForm }