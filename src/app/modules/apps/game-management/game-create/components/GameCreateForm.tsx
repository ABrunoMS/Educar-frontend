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
import { createGame, editGame } from '@services/Games';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';

type Props = {
  isUserLoading?: boolean;
  game?: Game;
  editMode?: boolean;
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

const GameCreateForm: FC<Props> = ({ game, isUserLoading, editMode }) => {
  const [loading, setLoading] = useState(false);
  const [gameForEdit] = useState<Game>({
    ...initialGame,
    ...game,
    id: game?.id || initialGame.id,
    name: game?.name || initialGame.name,
    description: game?.description || initialGame.description,
    lore: game?.lore || initialGame.lore,
    purpose: game?.purpose || initialGame.purpose,
    subjectIds: game?.subjectIds || initialGame.subjectIds,
    proficiencyGroupIds: game?.proficiencyGroupIds || initialGame.proficiencyGroupIds
  });

  const [subjects, setSubjects] = useState<SelectOptions[]>([]);
  const [proficiencyGroups, setProficiencyGroups] = useState<SelectOptions[]>([]);
  const intl = useIntl();
  const navigate = useNavigate()

  useEffect(() => {
    // Fetch subjects from the API
    getSubjects().then((response) => {
      const subjectOptions = response.data.items.map((subject: any) => ({
        value: subject.id,
        label: subject.name,
      }));
      setSubjects(subjectOptions);
    });

    // Fetch proficiency groups from the API
    getProficiencyGroups().then((response) => {
      const proficiencyGroupOptions = response.data.items.map((group: any) => ({
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

  const editEntity = async (values: Game) => {
    try {
      const callback = await editGame(values.id!, values);
      if (callback.status === 200 || callback.status === 204) {
        setLoading(false);
        toast.success(`Entidade '${values.name}' editada com sucesso`)
        navigate('/apps/game-management/games');
      }
    } catch (error) {
      toast.error('Ocorreu um erro ao enviar.');
      setLoading(false)
    }
  }

  const createEntity = async (values: Game) => {
    try {
      const callback = await createGame(values);
      if (callback.status === 200 || callback.status === 204) {
        setLoading(false);
        toast.success(`Entidade '${values.name}' criada com sucesso`)
        navigate('/apps/game-management/games');
      }
    } catch (error) {
      toast.error('Ocorreu um erro ao enviar.');
      setLoading(false)
    }
  }

  const formik = useFormik({
    initialValues: gameForEdit,
    validationSchema: editGameSchema,
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

export { GameCreateForm };