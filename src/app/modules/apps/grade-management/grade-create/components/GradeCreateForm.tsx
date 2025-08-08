import React, { FC, useState } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useIntl } from 'react-intl';
import { Grade } from '@interfaces/Grade';
import BasicField from '@components/form/BasicField';
import { createGrade, editGrade } from '@services/Grades';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';

type Props = {
  isUserLoading?: boolean;
  editMode?: boolean;
  grade?: Grade;
};

const initialGrade: Grade = {
  name: '',
  description: '',
};

const GradeCreateForm: FC<Props> = ({ grade, isUserLoading, editMode }) => {
  const [loading, setLoading] = useState(false);
  const [gradeForEdit] = useState<Grade>({
    ...grade,
    name: grade?.name || initialGrade.name,
    description: grade?.description || initialGrade.description,
  });

  const intl = useIntl();
  const navigate = useNavigate();

  const editGradeSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, 'Mínimo 3 caracteres')
      .required('Campo obrigatório'),
    description: Yup.string()
      .min(3, 'Mínimo 3 caracteres')
      .required('Campo obrigatório'),
  });

  const editEntity = async (values: Grade) => {
    try {
      const callback = await editGrade(values.id!, values);
      if (callback.status === 200 || callback.status === 204) {
        setLoading(false);
        toast.success(`Entidade '${values.name}' editada com sucesso`)
        navigate('/apps/grade-management/grades');
      }
    } catch (error) {
      toast.error('Ocorreu um erro ao enviar.');
      setLoading(false)
    }
  }

  const createEntity = async (values: Grade) => {
    try {
      const callback = await createGrade(values);
      if (callback.status === 200) {
        setLoading(false);
        toast.success(`Entidade '${values.name}' criada com sucesso`);
        navigate('/apps/grade-management/grades');
      }
    } catch (error) {
      toast.error('Ocorreu um erro ao enviar.');
      setLoading(false);
    }
  }

  const formik = useFormik({
    initialValues: gradeForEdit,
    validationSchema: editGradeSchema,
    validateOnChange: true,
    onSubmit: async (values, { setSubmitting }) => {
      if (loading) return;

      setLoading(true);

      if (editMode) {
        return editEntity(values);
      }

      return createEntity(values);
    },
  });

  const renderBasicFieldset = (
    fieldName: string,
    label: string,
    placeholder: string | null,
    required: boolean = true
  ) => (
    <BasicField
      fieldName={fieldName}
      label={label}
      placeholder={placeholder}
      required={required}
      formik={formik}
    />
  );

  return (
    <>
      <form
        id='kt_modal_add_grade_form'
        className='form'
        onSubmit={formik.handleSubmit}
        noValidate
      >
        <div className='d-flex flex-column me-n7 pe-7'>
          {/* Name */}
          {renderBasicFieldset('name', 'Nome', 'Nome')}

          {/* Description */}
          {renderBasicFieldset('description', 'Descrição', 'No máximo 100 caracteres')}
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
  );
};

export { GradeCreateForm };