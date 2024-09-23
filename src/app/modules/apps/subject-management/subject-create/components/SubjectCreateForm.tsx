import React, { FC, useState} from 'react'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import clsx from 'clsx'
import { useIntl } from 'react-intl'
import { Subject } from '@interfaces/Subject'
import BasicField from '@components/form/BasicField'
import { createSubject } from '@services/Subjects'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'

type Props = {
  isUserLoading?: boolean
  subject?: Subject
}

const initialGame: Subject = {
  name: '',
  description: ''
}

const SubjectCreateForm: FC<Props> = ({ subject, isUserLoading }) => {
  const [loading, setLoading] = useState(false);
  const [subjectForEdit] = useState<Subject>({
    ...subject,
    name: subject?.name || initialGame.name,
    description: subject?.description || initialGame.description
  })

  const intl = useIntl()
  const navigate = useNavigate()

  const editSubjectSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, 'Mínimo 3 caracteres')
      .required('Campo obrigatório'),
    description: Yup.string()
      .min(3, 'Mínimo 3 caracteres')
      .required('Campo obrigatório')
  })

  const formik = useFormik({
    initialValues: subjectForEdit,
    validationSchema: editSubjectSchema,
    validateOnChange: true,
    onSubmit: async (values, { setSubmitting }) => {
      if (loading) return;

      setLoading(true);

      try {
        const callback = await createSubject(values);
        if (callback.status === 200) {
          setLoading(false);
          toast.success(`Entidade '${values.name}' criada com sucesso`)
          navigate('/apps/subject-management/subjects');
        }
      } catch (error) {
        toast.error('Ocorreu um erro ao enviar.');
        setSubmitting(false)
        setLoading(false)
      }
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
          {renderBasicFieldset('name', 'Nome', 'Nome')}

          {/* Description */}
          {renderBasicFieldset('description', 'Descrição', 'No máximo 100 caratecers')}
        </div>

        <div className='text-center pt-15'>
          <button
            type='submit'
            className='btn btn-primary'
            data-kt-users-modal-action='submit'
          >
            {loading ? (
              <span className='indicator-progress'>
                Aguarde...{' '}
                <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
              </span>
            ) : (
              <span className='indicator-label'>Enviar</span>
            )}
          </button>
        </div>
      </form>
    </>
  )
}

export { SubjectCreateForm }
