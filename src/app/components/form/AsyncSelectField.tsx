import React from 'react';
import { useField } from 'formik';
import AsyncSelect from 'react-select/async';
import { SelectOptions } from '@interfaces/Forms'; // Ajuste o caminho se necessário
import { FormikProps } from 'formik';

type Props = {
  label: string;
  fieldName: string;
  placeholder?: string;
  required?: boolean;
  isMulti?: boolean;
  loadOptions: (inputValue: string, callback: (options: SelectOptions[]) => void) => void;
  formik: FormikProps<any>;
};

const AsyncSelectField: React.FC<Props> = ({
  label,
  fieldName,
  placeholder,
  required = false,
  isMulti = false,
  loadOptions,
  formik,
}) => {
  const { setFieldValue, getFieldMeta, getFieldProps } = formik;

  const { touched, error } = getFieldMeta(fieldName);

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      borderColor: meta.touched && meta.error ? 'red' : provided.borderColor,
    }),
  };

  const handleChange = (selectedOption: any) => {
    if (isMulti) {
      const values = selectedOption ? selectedOption.map((option: SelectOptions) => option.value) : [];
      helpers.setValue(values);
    } else {
      const value = selectedOption ? selectedOption.value : '';
      helpers.setValue(value);
    }
  };

  return (
    <div className='mb-7'>
      <label className={`form-label fw-bold ${required ? 'required' : ''}`}>{label}</label>
      <AsyncSelect
        {...field}
        isMulti={isMulti}
        cacheOptions
        defaultOptions
        loadOptions={loadOptions}
        placeholder={placeholder}
        onChange={handleChange}
        styles={customStyles}
        getOptionValue={(option) => option.value}
        getOptionLabel={(option) => option.label}
        noOptionsMessage={() => 'Nenhuma opção encontrada'}
        loadingMessage={() => 'Buscando...'}
      />
      {meta.touched && meta.error && (
        <div className='fv-plugins-message-container'>
          <div className='fv-help-block'>
            <span role='alert'>{meta.error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsyncSelectField;