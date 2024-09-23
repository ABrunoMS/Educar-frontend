import React, { FC, useState} from 'react'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import clsx from 'clsx'
import { useIntl } from 'react-intl'
import { Proficiency } from '@interfaces/Proficiency'
import BasicField from '@components/form/BasicField'

type Props = {
  isUserLoading?: boolean
  proficiency?: Proficiency
}

const initialProficiency: Proficiency = {
  id: '',
  name: '',
  description: '',
  purpose: ''
}

const ProficiencyCreateForm: FC<Props> = ({ proficiency, isUserLoading }) => {
  const [proficiencyForEdit] = useState<Proficiency>({
    ...initialProficiency,
    ...proficiency
  })

  const intl = useIntl()

  const editProficiencySchema = Yup.object().shape({
    name: Yup.string().required('Field is required'),
    description: Yup.string().required('Field is required'),
    purpose: Yup.string().required('Field is required')
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

  return (
    <>
      <form id='kt_modal_add_proficiency_form' className='form' onSubmit={formik.handleSubmit} noValidate>
        <div className='d-flex flex-column me-n7 pe-7'>
          {renderBasicFieldset('name', 'Name', 'Enter proficiency name')}
          {renderBasicFieldset('description', 'Description', 'Enter proficiency description')}
          {renderBasicFieldset('purpose', 'Purpose', 'Enter proficiency purpose')}
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

export { ProficiencyCreateForm }