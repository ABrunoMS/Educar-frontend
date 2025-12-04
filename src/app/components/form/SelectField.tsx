import React from "react";
import clsx from "clsx";
import { FormikProps } from "formik";
import Select from "react-select";
import { SelectOptions } from "@interfaces/Forms";
import { components } from "react-select";

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

const CustomMultiValue = (props: any) => (
  <components.MultiValue {...props}>
    <span className="badge bg-primary text-white px-2 py-1 me-1 mb-1 rounded-pill d-flex align-items-center">
      {props.data.label}
      <span
        style={{ cursor: "pointer", marginLeft: 6 }}
        onClick={(e) => {
          e.stopPropagation();
          props.removeProps.onClick();
        }}
      >
        &times;
      </span>
    </span>
  </components.MultiValue>
);

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

  // Monta o valor para o Select
  const selectValue = multiselect
    ? (formikValue || []).map((val: string) => {
        const option = options.find((o) => o.value === val);
        return option || { value: val, label: val };
      })
    : formikValue
    ? options.find((o) => o.value === formikValue) || { value: formikValue, label: formikValue }
    : null;

  const handleUpdate = (selected: any) => {
    let finalValue: string | string[];
    if (multiselect) {
      finalValue = selected ? selected.map((opt: SelectOptions) => opt.value) : [];
    } else {
      finalValue = selected ? selected.value : '';
    }
    formik.setFieldValue(fieldName, finalValue);
    formik.setFieldTouched(fieldName, true);
    if (onChange) onChange(finalValue);
  };

  const meta = formik.getFieldMeta(fieldName);
  const showError = formik.submitCount > 0 && meta.error;

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
        value={selectValue}
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
  );
}

export default SelectField;
