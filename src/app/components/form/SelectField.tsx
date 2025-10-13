import React from "react"
import clsx from "clsx";
import { FormikProps } from "formik";
import Select from "react-select";
import { SelectOptions } from '@interfaces/Forms';

interface FieldProps {
  fieldName: string;
  label: string;
  placeholder?: string | null;
  required?: boolean;
  loading?: boolean;
  isDisabled?: boolean;
  disabled?: boolean;
  multiselect?: boolean;
  onChange?: (value: string | string[]) => void;
  options: SelectOptions[];
  formik: FormikProps<any>;
}

const SelectField: React.FC<FieldProps> = ({
  fieldName,
  label,
  placeholder,
  required = false,
  loading = false,
  isDisabled = false,
  disabled,
  formik,
  options,
  multiselect = false,
  onChange
}) => {
  const finalDisabledState = formik.isSubmitting || loading || isDisabled || disabled;
  const formikValue = formik.values[fieldName];

  const getCurrentValues = (): SelectOptions | SelectOptions[] | null => {
    if (multiselect) {
      return options.filter(option => formikValue?.includes(option.value));
    }
    return options.find(option => option.value === formikValue) || null;
  }

  const handleUpdate = (newValue: any) => {
    let finalValue: string | string[];
    if (multiselect) {
      finalValue = newValue ? newValue.map((opt: SelectOptions) => opt.value) : [];
    } else {
      finalValue = newValue ? newValue.value : '';
    }

    formik.setFieldValue(fieldName, finalValue);
    formik.setFieldTouched(fieldName, true);

    if (onChange) onChange(finalValue);
  }

  const meta = formik.getFieldMeta(fieldName);
  const showError = formik.submitCount > 0 && meta.error; // só após submit

  return (
    <div className='mb-7'>
      <label className='fw-bold fs-6 mb-2'>
        {label} {required && showError && <span className='text-danger'>*</span>}
      </label>
      <Select
        className={clsx(
          'react-select-styled react-select-solid mb-3 mb-lg-0',
          { 'is-invalid': showError }
        )}
        classNamePrefix='react-select'
        options={options}
        placeholder={placeholder}
        value={getCurrentValues()}
        name={fieldName}
        onChange={handleUpdate}
        onBlur={() => formik.setFieldTouched(fieldName, true)}
        isMulti={multiselect}
        isDisabled={finalDisabledState}
      />
      {showError && (
        <div className='fv-plugins-message-container'>
          <div className='fv-help-block'>
            <span role='alert'>{meta.error}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default SelectField;
