import React, { FC, useState} from 'react'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import clsx from 'clsx'
import { useIntl } from 'react-intl'
import { Dialogue } from '@interfaces/Dialogue'
import { SelectOptions } from '@interfaces/Forms'
import BasicField from '@components/form/BasicField'
import SelectField from '@components/form/SelectField'

type Props = {
  isUserLoading?: boolean
  dialogue?: Dialogue
}

const selectOptions: SelectOptions[] = [
  { value: '1', label: 'Npc 1' },
  { value: '2', label: 'Npc 2' },
  { value: '3', label: 'Npc 3' },
  { value: '4', label: 'Npc 4' },
]

const initialDialogue: Dialogue = {
  text: '',
  npcId: '',
  order: 0
}

const DialogueCreateForm: FC<Props> = ({ dialogue, isUserLoading }) => {
  const [dialogueForEdit] = useState<Dialogue>({
    ...dialogue,
    text: dialogue?.text || initialDialogue.text,
    npcId: dialogue?.npcId || initialDialogue.npcId,
    order: dialogue?.order || initialDialogue.order,
  })

  const intl = useIntl()

  const editSchema = Yup.object().shape({
    text: Yup.string()
      .required('Field is required'),
    npcId: Yup.string()
      .required('Field is required'),
    order: Yup.number()
      .min(1, 'Must be bigger than zero')
      .required('Field is required'),
  })

  const formik = useFormik({
    initialValues: dialogueForEdit,
    validationSchema: editSchema,
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
          {/* Text */}
          {renderBasicFieldset('text', 'Text', 'Enter text...')}

          {/* Order */}
          {renderBasicFieldset('order', 'Order', 'Enter numerical order')}

          {/* Order */}
          {renderSelectFieldset('npcId', 'Npc', 'Select a NPC', selectOptions, true)}
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

export { DialogueCreateForm }
