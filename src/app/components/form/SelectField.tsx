import React from "react"
import clsx from "clsx";
import { FormikProps } from "formik";
import Select, {
  OnChangeValue,
  SingleValue,
  MultiValue
} from "react-select"

import { SelectOptions } from '@interfaces/Forms'

interface FieldProps {
  fieldName: string;
  label: string;
  placeholder: string | null;
  required: boolean;
  disabled?: boolean;
  multiselect: boolean;
  options: SelectOptions[];
  formik: FormikProps<any>;
}

const SelectField: React.FC<FieldProps> = ({
  fieldName,
  label,
  placeholder,
  required,
  disabled,
  formik,
  options,
  multiselect
}) => {
  const getDefaultSelectValues = (name: string): SelectOptions[] => {
    const initialValues = formik.getFieldProps(name).value
    return options.filter(option => initialValues.includes(option.value))
  }

  const updateSelectValue = (newValue: SingleValue<SelectOptions> | MultiValue<SelectOptions>) => {
    const option = newValue as SelectOptions;
    formik.setFieldValue(fieldName, option.value)
  }

  const updateMultiSelectValue = (newValue: MultiValue<SelectOptions>) => {
    formik.setFieldValue(fieldName, newValue!.map(option => option.value))
  }

  const updateSelectValues = (newValue: MultiValue<SelectOptions> | SingleValue<SelectOptions>) => {
    if (Array.isArray(newValue) && multiselect) {
      return updateMultiSelectValue(newValue)
    }
  
    return updateSelectValue(newValue)
  }

  return (
    <div className=' mb-7'>
      <label
        className={clsx(
          'fw-bold fs-6 mb-2',
          {'required': required}
        )}
      >{label}</label>
      <Select 
        className={clsx(
          'react-select-styled react-select-solid mb-3 mb-lg-0',
          {'is-invalid': formik.getFieldMeta(fieldName).error}
        )}
        classNamePrefix='react-select' 
        options={options}
        placeholder={placeholder}
        defaultValue={getDefaultSelectValues(fieldName)}
        name={fieldName}
        onChange={(newValue) => updateSelectValues(newValue)}
        isMulti={multiselect}
        isDisabled={formik.isSubmitting || disabled}
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
}

export default SelectField
