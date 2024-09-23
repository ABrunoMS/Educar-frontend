import React, { FC, useState} from 'react'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import clsx from 'clsx'
import { useIntl } from 'react-intl'
import { Grade } from '@interfaces/Grade'
import BasicField from '@components/form/BasicField'

type Props = {
  isUserLoading?: boolean
  grade?: Grade
}

const initialGrade: Grade = {
  name: '',
  description: ''
}

const GradeCreateForm: FC<Props> = ({ grade, isUserLoading }) => {
  const [gradeForEdit] = useState<Grade>({
    ...grade,
    name: grade?.name || initialGrade.name,
    description: grade?.description || initialGrade.description
  })

  const intl = useIntl()

  const editGameSchema = Yup.object().shape({
    name: Yup.string()
      .required('Field is required'),
    description: Yup.string()
      .required('Field is required'),
    lore: Yup.string()
      .required('Field is required'),
    purpose: Yup.string()
      .required('Field is required')
  })

  const formik = useFormik({
    initialValues: gradeForEdit,
    validationSchema: editGameSchema,
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

  return (
    <>
      <form id='kt_modal_add_game_form' className='form' onSubmit={formik.handleSubmit} noValidate>
        <div className='d-flex flex-column me-n7 pe-7'>
          {/* Name */}
          {renderBasicFieldset('name', 'Name', 'Enter grade name')}

          {/* Description */}
          {renderBasicFieldset('description', 'Description', 'Enter grade description')}
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

export { GradeCreateForm }
