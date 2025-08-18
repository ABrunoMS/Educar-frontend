import React, { FC, useState } from 'react'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import { useIntl } from 'react-intl'
import { Secretary, SecretaryType } from '@interfaces/Secretary'
import BasicField from '@components/form/BasicField'
import { createSecretary } from '@services/Secretaries'

type Props = {
  isUserLoading?: boolean
  secretary?: Secretary
}

const initialSecretary: Secretary = {
  id: '',
  name: '',
  description: '',
  code: ''
}

const SecretaryCreateForm: FC<Props> = ({ secretary, isUserLoading }) => {
  const [secretaryForEdit] = useState<Secretary>({
    ...secretary,
    name: secretary?.name || initialSecretary.name,
    description: secretary?.description || initialSecretary.description,
    code: secretary?.code || initialSecretary.code
  })

  const intl = useIntl()

  const editSchema = Yup.object().shape({
    name: Yup.string()
      .required('Nome é obrigatório'),
    description: Yup.string()
      .optional(),
    code: Yup.string()
      .optional(),
  })

  const formik = useFormik({
    initialValues: secretaryForEdit,
    validationSchema: editSchema,
    validateOnChange: true,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      try {
        const secretaryData: SecretaryType = {
          name: values.name,
          description: values.description,
          code: values.code,
        };
        
        await createSecretary(secretaryData);
        alert('Secretaria criada com sucesso!');
        formik.resetForm();
      } catch (ex) {
        console.error(ex);
        alert('Houve um erro ao salvar a secretaria. Por favor, tente novamente.');
      } finally {
        setSubmitting(false);
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
      <form id='kt_modal_add_secretary_form' className='form' onSubmit={formik.handleSubmit} noValidate>
        <div className='d-flex flex-column me-n7 pe-7'>
          {/* Name */}
          {renderBasicFieldset('name', 'Nome', 'Digite o nome da secretaria')}

          {/* Description */}
          {renderBasicFieldset('description', 'Descrição', 'Digite a descrição', false)}

          {/* Code */}
          {renderBasicFieldset('code', 'Código', 'Digite o código', false)}
        </div>

        <div className='text-center pt-15'>
          <button
            type='submit'
            className='btn btn-primary'
            data-kt-users-modal-action='submit'
          >
            <span className='indicator-label'>Salvar</span>
            {(formik.isSubmitting || isUserLoading) && (
              <span className='indicator-progress'>
                Aguarde...{' '}
                <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
              </span>
            )}
          </button>
        </div>
      </form>
    </>
  )
}

export { SecretaryCreateForm }
