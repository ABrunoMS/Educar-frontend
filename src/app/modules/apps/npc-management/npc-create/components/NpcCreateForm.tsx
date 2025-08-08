import React, { FC, useState} from 'react'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import { useIntl } from 'react-intl'
import { Npc } from '@interfaces/Npc'
import { SelectOptions } from '@interfaces/Forms'
import BasicField from '@components/form/BasicField'
import SelectField from '@components/form/SelectField'

type Props = {
  isUserLoading?: boolean
  npc?: Npc
}

const initialNpc: Npc = {
  id: '',
  name: '',
  lore: '',
  npcType: 'Common',
  goldDropRate: 0,
  goldAmount: 0,
  itemIds: [],
  gameIds: []
}

const npcTypeOptions: SelectOptions[] = [
  { value: 'Common', label: 'Common' },
  { value: 'Boss', label: 'Boss' },
  { value: 'Enemy', label: 'Enemy' },
  { value: 'History', label: 'History' }
]

const itemOptions: SelectOptions[] = [
  { value: '1', label: 'Item 1' },
  { value: '2', label: 'Item 2' },
  { value: '3', label: 'Item 3' },
  { value: '4', label: 'Item 4' }
]

const gameOptions: SelectOptions[] = [
  { value: '1', label: 'Game 1' },
  { value: '2', label: 'Game 2' },
  { value: '3', label: 'Game 3' },
  { value: '4', label: 'Game 4' }
]

const NpcCreateForm: FC<Props> = ({ npc, isUserLoading }) => {
  const [npcForEdit] = useState<Npc>({
    ...initialNpc,
    ...npc
  })

  const intl = useIntl()

  const editNpcSchema = Yup.object().shape({
    name: Yup.string().required('Field is required'),
    lore: Yup.string().required('Field is required'),
    npcType: Yup.string().required('Field is required'),
    goldDropRate: Yup.number().required('Field is required'),
    goldAmount: Yup.number().required('Field is required'),
    itemIds: Yup.array().of(Yup.string()).min(1, 'Field is required'),
    gameIds: Yup.array().of(Yup.string()).min(1, 'Field is required')
  })

  const formik = useFormik({
    initialValues: npcForEdit,
    validationSchema: editNpcSchema,
    validateOnChange: true,
    onSubmit: async (values, { setSubmitting }) => {
      // Handle form submission
      console.log('Form values:', values)
      setSubmitting(false)
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
      <form id='kt_modal_add_npc_form' className='form' onSubmit={formik.handleSubmit} noValidate>
        <div className='d-flex flex-column me-n7 pe-7'>
          {renderBasicFieldset('name', 'Name', 'Enter NPC name')}
          {renderBasicFieldset('lore', 'Lore', 'Enter NPC lore')}
          {renderSelectFieldset('npcType', 'NPC Type', 'Select NPC type', npcTypeOptions)}
          {renderBasicFieldset('goldDropRate', 'Gold Drop Rate', 'Enter gold drop rate')}
          {renderBasicFieldset('goldAmount', 'Gold Amount', 'Enter gold amount')}
          {renderSelectFieldset('itemIds', 'Item IDs', 'Select item IDs', itemOptions, true, true)}
          {renderSelectFieldset('gameIds', 'Game IDs', 'Select game IDs', gameOptions, true, true)}
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

export { NpcCreateForm }