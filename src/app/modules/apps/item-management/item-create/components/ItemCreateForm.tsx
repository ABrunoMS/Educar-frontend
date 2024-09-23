import React, { FC, useState} from 'react'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import { useIntl } from 'react-intl'
import { Item } from '@interfaces/Item'
import { SelectOptions } from '@interfaces/Forms'
import BasicField from '@components/form/BasicField'
import SelectField from '@components/form/SelectField'
import clsx from 'clsx'

type Props = {
  isUserLoading?: boolean
  itemData?: Item
}

const initialItem: Item = {
  name: '',
  lore: '',
  itemType: 'Common',
  itemRarity: 'Common',
  sellValue: 0,
  dismantleId: '',
  reference2D: '',
  reference3D: '',
  dropRate: 0
}

const itemTypeOptions: SelectOptions[] = [
  { value: 'None', label: 'None' },
  { value: 'Common', label: 'Common' },
  { value: 'Equipment', label: 'Equipment' },
  { value: 'Consumable', label: 'Consumable' },
  { value: 'CraftingMaterial', label: 'Crafting Material' }
]

const itemRarityOptions: SelectOptions[] = [
  { value: 'None', label: 'None' },
  { value: 'Common', label: 'Common' },
  { value: 'Uncommon', label: 'Uncommon' },
  { value: 'Rare', label: 'Rare' },
  { value: 'Epic', label: 'Epic' },
  { value: 'Legendary', label: 'Legendary' },
  { value: 'Artifact', label: 'Artifact' }
]

const ItemCreateForm: FC<Props> = ({ itemData, isUserLoading }) => {
  const [itemForEdit] = useState<Item>({
    ...initialItem,
    ...itemData
  })

  const intl = useIntl()

  const editItemSchema = Yup.object().shape({
    name: Yup.string().required('Field is required'),
    lore: Yup.string().required('Field is required'),
    itemType: Yup.string().oneOf(['Common', 'Equipment', 'Consumable', 'CraftingMaterial'], 'Required').required('Field is required'),
    itemRarity: Yup.string().oneOf(['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Artifact'], 'Required').required('Field is required'),
    sellValue: Yup.number().required('Field is required'),
    dismantleId: Yup.string().required('Field is required'),
    reference2D: Yup.string().required('Field is required'),
    reference3D: Yup.string().required('Field is required'),
    dropRate: Yup.number().required('Field is required')
  })

  const formik = useFormik({
    initialValues: itemForEdit,
    validationSchema: editItemSchema,
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

  const renderNumberFieldset = (fieldName: string, label: string, placeholder: string | null, required: boolean = true) => (
    <div className='fv-row mb-7'>
      <label
        className={clsx(
          'fw-bold fs-6 mb-2',
          { 'required': required }
        )}
      >{label}</label>
      <input
        placeholder={placeholder || undefined}
        {...formik.getFieldProps(fieldName)}
        type='number'
        name={fieldName}
        className={clsx(
          'form-control form-control-solid mb-3 mb-lg-0',
          { 'is-invalid': formik.getFieldMeta(fieldName).touched && formik.getFieldMeta(fieldName).error },
          {
            'is-valid': formik.getFieldMeta(fieldName).touched && !formik.getFieldMeta(fieldName).error,
          }
        )}
        autoComplete='off'
        disabled={formik.isSubmitting || isUserLoading}
      />
      {formik.getFieldMeta(fieldName).touched && formik.getFieldMeta(fieldName).error && (
        <div className='fv-plugins-message-container'>
          <div className='fv-help-block'>
            <span role='alert'>{formik.getFieldMeta(fieldName).error}</span>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <>
      <form id='kt_modal_add_item_form' className='form' onSubmit={formik.handleSubmit} noValidate>
        <div className='d-flex flex-column me-n7 pe-7'>
          {renderBasicFieldset('name', 'Name', 'Enter item name')}
          {renderBasicFieldset('lore', 'Lore', 'Enter item lore')}
          {renderSelectFieldset('itemType', 'Item Type', 'Select item type', itemTypeOptions)}
          {renderSelectFieldset('itemRarity', 'Item Rarity', 'Select item rarity', itemRarityOptions)}
          {renderNumberFieldset('sellValue', 'Sell Value', 'Enter sell value')}
          {renderBasicFieldset('dismantleId', 'Dismantle ID', 'Enter dismantle ID')}
          {renderBasicFieldset('reference2D', 'Reference 2D', 'Enter 2D reference')}
          {renderBasicFieldset('reference3D', 'Reference 3D', 'Enter 3D reference')}
          {renderNumberFieldset('dropRate', 'Drop Rate', 'Enter drop rate')}
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

export { ItemCreateForm }
