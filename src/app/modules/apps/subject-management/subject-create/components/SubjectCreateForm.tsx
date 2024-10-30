import React, { FC, useState} from 'react'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import clsx from 'clsx'
import { useIntl } from 'react-intl'
import { Subject } from '@interfaces/Subject'
import BasicField from '@components/form/BasicField'
import { createSubject, editSubject } from '@services/Subjects'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'

type Props = {
  isUserLoading?: boolean
  editMode?: boolean
  subject?: Subject
}

const initialSubject: Subject = {
  name: '',
  description: ''
}

const SubjectCreateForm: FC<Props> = ({ subject, isUserLoading, editMode }) => {
  const [loading, setLoading] = useState(false);
  const [subjectForEdit] = useState<Subject>({
    ...subject,
    name: subject?.name || initialSubject.name,
    description: subject?.description || initialSubject.description
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

  const create = async (values: Subject) => {
    try {
      const callback = await createSubject(values);
      if (callback.status === 200) {
        setLoading(false);
        toast.success(`Entidade '${values.name}' criada com sucesso`)
        navigate('/apps/subject-management/subjects');
      }
    } catch (error) {
      toast.error('Ocorreu um erro ao enviar.');
      setLoading(false)
    }
  }

  const editEntity = async (values: Subject) => {
    try {
      const callback = await editSubject(values.id!, values);
      if (callback.status === 200 || callback.status === 204) {
        setLoading(false);
        toast.success(`Entidade '${values.name}' criada com sucesso`)
        navigate('/apps/subject-management/subjects');
      }
    } catch (error) {
      toast.error('Ocorreu um erro ao enviar.');
      setLoading(false)
    }
  }

  const createEntity = async (values: Subject) => {
    try {
      const callback = await createSubject(values);
      if (callback.status === 200 || callback.status === 204) {
        setLoading(false);
        toast.success(`Entidade '${values.name}' editada com sucesso`)
        navigate('/apps/subject-management/subjects');
      }
    } catch (error) {
      toast.error('Ocorreu um erro ao enviar.');
      setLoading(false)
    }
  }

  const formik = useFormik({
    initialValues: subjectForEdit,
    validationSchema: editSubjectSchema,
    validateOnChange: true,
    onSubmit: async (values) => {
      if (loading) return;

      setLoading(true);

      if (editMode) {
        return editEntity(values);
      }

      return createEntity(values);
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
