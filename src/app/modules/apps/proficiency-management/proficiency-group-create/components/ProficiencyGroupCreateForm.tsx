import React, { FC, useState} from 'react'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import clsx from 'clsx'
import { useIntl } from 'react-intl'
import { ProficiencyGroup } from '@interfaces/Proficiency'
import { SelectOptions } from '@interfaces/Forms'
import BasicField from '@components/form/BasicField'
import SelectField from '@components/form/SelectField'

type Props = {
  isUserLoading?: boolean
  proficiency?: ProficiencyGroup
}

const initialProficiency: ProficiencyGroup = {
  id: '',
  name: '',
  description: '',
  proficiencyIds: []
}

const selectOptions: SelectOptions[] = [
  { value: '1', label: 'Proficiency 1' },
  { value: '2', label: 'Proficiency 2' },
  { value: '3', label: 'Proficiency 3' },
  { value: '4', label: 'Proficiency 4' },
]

const ProficiencyGroupCreateForm: FC<Props> = ({ proficiency, isUserLoading }) => {
  const [proficiencyForEdit] = useState<ProficiencyGroup>({
    ...initialProficiency,
    ...proficiency
  })

  const intl = useIntl()

  const editProficiencySchema = Yup.object().shape({
    name: Yup.string().required('Field is required'),
    description: Yup.string().required('Field is required'),
    proficiencyIds: Yup.array().of(Yup.string()).min(1, 'Field is required')
  })

  const formik = useFormik({
    initialValues: proficiencyForEdit,
    validationSchema: editProficiencySchema,
    validateOnChange: true,
    onSubmit: async (values, { setSubmitting }) => {
      // Handle form submission
      console.log('Form values:', values)
      setSubmitting(false)
    }
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
      <form id='kt_modal_add_proficiency_form' className='form' onSubmit={formik.handleSubmit} noValidate>
        <div className='d-flex flex-column me-n7 pe-7'>
          {renderBasicFieldset('name', 'Name', 'Enter proficiency name')}
          {renderBasicFieldset('description', 'Description', 'Enter proficiency description')}
          {renderSelectFieldset('proficiencyIds', 'Proficiencies', 'Enter proficiencies', selectOptions, true, true)}
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

export { ProficiencyGroupCreateForm }