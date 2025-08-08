import React, { FC, useState} from 'react'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import clsx from 'clsx'
import { useIntl } from 'react-intl'
import { Proficiency } from '@interfaces/Proficiency'
import BasicField from '@components/form/BasicField'
import { useNavigate } from 'react-router'
import { createProficiency, editProficiency } from '@services/Proficiencies'
import { toast } from 'react-toastify'

type Props = {
  isUserLoading?: boolean
  proficiency?: Proficiency
  editMode?: boolean
}

const initialProficiency: Proficiency = {
  id: '',
  name: '',
  description: '',
  purpose: ''
}

const ProficiencyCreateForm: FC<Props> = ({ proficiency, isUserLoading, editMode }) => {
  const [loading, setLoading] = useState(false);

  const [proficiencyForEdit] = useState<Proficiency>({
    ...initialProficiency,
    ...proficiency
  })
  
  const intl = useIntl()
  const navigate = useNavigate()

  const editProficiencySchema = Yup.object().shape({
    name: Yup.string().required('Campo obrigatório'),
    description: Yup.string().required('Campo obrigatório'),
    purpose: Yup.string().required('Campo obrigatório')
  })

  const editEntity = async (values: Proficiency) => {
    try {
      const callback = await editProficiency(values.id!, values);
      if (callback.status === 200 || callback.status === 204) {
        setLoading(false);
        toast.success(`Entidade '${values.name}' editada com sucesso`)
        navigate('/apps/proficiency-management/proficiencies');
      }
    } catch (error) {
      toast.error('Ocorreu um erro ao enviar.');
      setLoading(false)
    }
  }

  const createEntity = async (values: Proficiency) => {
    try {
      const callback = await createProficiency(values);
      if (callback.status === 200 || callback.status === 204) {
        setLoading(false);
        toast.success(`Entidade '${values.name}' criada com sucesso`)
        navigate('/apps/proficiency-management/proficiencies');
      }
    } catch (error) {
      toast.error('Ocorreu um erro ao enviar.');
      setLoading(false)
    }
  }

  const formik = useFormik({
    initialValues: proficiencyForEdit,
    validationSchema: editProficiencySchema,
    validateOnChange: true,
    onSubmit: async (values, { setSubmitting }) => {
      if (loading) return;

      setLoading(true);

      if (editMode) {
        return editEntity(values);
      }

      return createEntity(values);
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
          {renderBasicFieldset('name', 'Nome', 'Entre o nome')}
          {renderBasicFieldset('description', 'Descrição', 'No máximo 100 caracteres')}
          {renderBasicFieldset('purpose', 'Finalidade', 'No máximo 100 caracteres')}
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

export { ProficiencyCreateForm }