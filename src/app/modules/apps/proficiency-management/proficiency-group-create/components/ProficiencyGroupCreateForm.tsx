import React, { FC, useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useIntl } from 'react-intl';
import { ProficiencyGroup } from '@interfaces/Proficiency';
import { SelectOptions } from '@interfaces/Forms';
import BasicField from '@components/form/BasicField';
import SelectField from '@components/form/SelectField';
import { getProficiencies } from '@services/Proficiencies';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { createProficiencyGroup, editProficiencyGroup } from '@services/ProficiencyGroups';

type Props = {
  isUserLoading?: boolean;
  proficiencyGroup?: ProficiencyGroup;
  editMode?: boolean;
};

const initialProficiencyGroup: ProficiencyGroup = {
  id: '',
  name: '',
  description: '',
  proficiencyIds: []
};

const ProficiencyGroupCreateForm: FC<Props> = ({ proficiencyGroup, isUserLoading, editMode }) => {
  const [proficiencyForEdit] = useState<ProficiencyGroup>({
    ...initialProficiencyGroup,
    ...proficiencyGroup,
  });

  const [proficiencies, setProficiencies] = useState<SelectOptions[]>([]);

  const [loading, setLoading] = useState(false);
  
  const intl = useIntl()
  const navigate = useNavigate()

  useEffect(() => {
    // Fetch proficiencies from the API
    getProficiencies().then((response) => {
      const proficiencyOptions = response.data.items.map((proficiency: any) => ({
        value: proficiency.id,
        label: proficiency.name,
      }));
      setProficiencies(proficiencyOptions);
    });
  }, []);

  const proficiencyGroupSchema = Yup.object().shape({
    name: Yup.string().required('Campo obrigatório'),
    description: Yup.string().required('Campo obrigatório'),
    // proficiencyIds: Yup.array().of(Yup.string()).min(1, 'Campo obrigatório'),
    proficiencyIds: Yup.array()
      .of(Yup.string().required('Campo obrigatório'))
      .when([], {
        is: () => !editMode,
        then: () => Yup.array().min(1, 'At least one item is required').required('Items are required')
      }),
  });

  const editEntity = async (values: ProficiencyGroup) => {
    try {
      const callback = await editProficiencyGroup(values.id!, values);
      if (callback.status === 200 || callback.status === 204) {
        setLoading(false);
        toast.success(`Entidade '${values.name}' editada com sucesso`)
        navigate('/apps/proficiency-management/groups');
      }
    } catch (error) {
      toast.error('Ocorreu um erro ao enviar.');
      setLoading(false)
    }
  }

  const createEntity = async (values: ProficiencyGroup) => {
    try {
      const callback = await createProficiencyGroup(values);
      if (callback.status === 200 || callback.status === 204) {
        setLoading(false);
        toast.success(`Entidade '${values.name}' criada com sucesso`)
        navigate('/apps/proficiency-management/groups');
      }
    } catch (error) {
      toast.error('Erro: "Nome" deve ser único');
      setLoading(false)
    }
  }

  const formik = useFormik({
    initialValues: proficiencyForEdit,
    validationSchema: proficiencyGroupSchema,
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

  const renderSelectFieldset = (
    fieldName: string,
    label: string,
    placeholder: string | null,
    options: SelectOptions[],
    multiselect: boolean = false,
    required: boolean = true,
    disabled: boolean = false
  ) => (
    <SelectField
      fieldName={fieldName}
      label={label}
      placeholder={placeholder}
      required={required}
      multiselect={multiselect}
      options={options}
      formik={formik}
      disabled={disabled}
    />
  );

  return (
    <>
      <form id='kt_modal_add_proficiency_group_form' className='form' onSubmit={formik.handleSubmit} noValidate>
        <div className='d-flex flex-column me-n7 pe-7'>
          {renderBasicFieldset('name', 'Nome', 'Entre o nome do grupo')}
          {renderBasicFieldset('description', 'Descrição', 'Máximo 100 caracteres')}
          {renderSelectFieldset('proficiencyIds', 'Habilidades', 'Selecione...', proficiencies, true, !editMode, editMode)}
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

export { ProficiencyGroupCreateForm };