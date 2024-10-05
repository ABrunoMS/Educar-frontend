import React, { FC, useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useIntl } from 'react-intl';
import { Game } from '@interfaces/Game';
import { SelectOptions } from '@interfaces/Forms';
import BasicField from '@components/form/BasicField';
import SelectField from '@components/form/SelectField';
import { getSubjects } from '@services/Subjects';
import { getProficiencyGroups } from '@services/ProficiencyGroups';

type Props = {
  isUserLoading?: boolean;
  game?: Game;
  editMode: boolean;
};

const initialGame: Game = {
  id: '',
  name: '',
  description: '',
  lore: '',
  purpose: '',
  subjectIds: [],
  proficiencyGroupIds: []
};

const GameCreateForm: FC<Props> = ({ game, isUserLoading }) => {
  const [gameForEdit] = useState<Game>({
    ...initialGame,
    ...game,
  });

  const [subjects, setSubjects] = useState<SelectOptions[]>([]);
  const [proficiencyGroups, setProficiencyGroups] = useState<SelectOptions[]>([]);
  const intl = useIntl();

  useEffect(() => {
    // Fetch subjects from the API
    getSubjects().then((response) => {
      const subjectOptions = response.data.map((subject: any) => ({
        value: subject.id,
        label: subject.name,
      }));
      setSubjects(subjectOptions);
    });

    // Fetch proficiency groups from the API
    getProficiencyGroups().then((response) => {
      const proficiencyGroupOptions = response.data.map((group: any) => ({
        value: group.id,
        label: group.name,
      }));
      setProficiencyGroups(proficiencyGroupOptions);
    });
  }, []);

  const editGameSchema = Yup.object().shape({
    name: Yup.string().required('Field is required'),
    description: Yup.string().required('Field is required'),
    lore: Yup.string().required('Field is required'),
    purpose: Yup.string().required('Field is required'),
    subjectIds: Yup.array().of(Yup.string()).min(1, 'Field is required'),
    proficiencyGroupIds: Yup.array().of(Yup.string()).min(1, 'Field is required')
  });

  const formik = useFormik({
    initialValues: gameForEdit,
    validationSchema: editGameSchema,
    validateOnChange: true,
    onSubmit: async (values, { setSubmitting }) => {
      // Handle form submission
      console.log('Form values:', values);
      setSubmitting(false);
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
  );

  return (
    <>
      <form id='kt_modal_add_game_form' className='form' onSubmit={formik.handleSubmit} noValidate>
        <div className='d-flex flex-column me-n7 pe-7'>
          {renderBasicFieldset('name', 'Nome', 'Insira um nome')}
          {renderBasicFieldset('description', 'Descrição', 'No máximo 100 caracteres')}
          {renderBasicFieldset('lore', 'Lore', 'Insira um lore')}
          {renderBasicFieldset('purpose', 'Propósito', 'Insira um propósito')}
          {renderSelectFieldset('subjectIds', 'Disciplinas', 'Seleciones disciplinas', subjects, true, true)}
          {renderSelectFieldset('proficiencyGroupIds', 'Grupos', 'Selecione os grupos', proficiencyGroups, true, true)}
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
  );
};

export { GameCreateForm };