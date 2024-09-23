import React, { FC, useState} from 'react'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import Select from 'react-select'
import Flatpickr from "react-flatpickr"
import clsx from 'clsx'
import { useIntl } from 'react-intl'
import { Game } from '@interfaces/Game'
import BasicField from '@components/form/BasicField'
import SelectField from '@components/form/SelectField'
import { SelectOptions } from '@interfaces/Forms'

type Props = {
  isUserLoading?: boolean
  game?: Game
}

const initialGame: Game = {
  name: '',
  description: '',
  lore: '',
  purpose: '',
  proficiencyGroupIds: [],
  subjectIds: [],
}

const proficiencyOptions: SelectOptions[] = [
  { value: '1', label: 'Group 1' },
  { value: '2', label: 'Group 2' },
  { value: '3', label: 'Group 3' },
  { value: '4', label: 'Group 4' }
]

const subjectOptions: SelectOptions[] = [
  { value: '1', label: 'Subject 1' },
  { value: '2', label: 'Subject 2' },
  { value: '3', label: 'Subject 3' },
  { value: '4', label: 'Subject 4' }
]

const GameCreateForm: FC<Props> = ({ game, isUserLoading }) => {
  const [gameForEdit] = useState<Game>({
    ...game,
    name: game?.name || initialGame.name,
    description: game?.description || initialGame.description,
    lore: game?.lore || initialGame.lore,
    proficiencyGroupIds: game?.proficiencyGroupIds || initialGame.proficiencyGroupIds,
    subjectIds: game?.subjectIds || initialGame.subjectIds,
    purpose: game?.purpose || initialGame.purpose
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
      .required('Field is required'),
    subjectIds: Yup.array().of(Yup.string())
      .min(1, 'Field is required'),
    proficiencyGroupIds: Yup.array().of(Yup.string())
      .min(1, 'Field is required')
  })

  const formik = useFormik({
    initialValues: gameForEdit,
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
  )

  return (
    <>
      <form id='kt_modal_add_game_form' className='form' onSubmit={formik.handleSubmit} noValidate>
        <div className='d-flex flex-column me-n7 pe-7'>
          {/* Name */}
          {renderBasicFieldset('name', 'Name', 'Enter game name')}

          {/* Description */}
          {renderBasicFieldset('description', 'Description', 'Enter game description')}

          {/* Lore */}
          {renderBasicFieldset('lore', 'Lore', 'Enter game lore')}

          {/* Purpose */}
          {renderBasicFieldset('purpose', 'Purpose', 'Enter game purpose')}
          
          {/* Proficiency */}
          {renderSelectFieldset('proficiencyGroupIds', 'Proficiency Group', 'Select group...', proficiencyOptions, true)}
          
          {/* Subjects */}
          {renderSelectFieldset('subjectIds', 'Subject', 'Select subject...', subjectOptions, true)}
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

export { GameCreateForm }
