import React, { FC } from 'react';
import Select from 'react-select';
import { SelectOptions } from '@interfaces/Forms';
import { FormikProps } from 'formik';
import { ThemeModeComponent } from '../../../_metronic/assets/ts/layout/ThemeMode';

interface SelectFieldProps {
  label: string;
  fieldName: string;
  options: SelectOptions[];
  formik: FormikProps<any>;
  
  // Compatibilidade: aceita tanto isMulti (novo) quanto multiselect (antigo)
  isMulti?: boolean;
  multiselect?: boolean;
  
  placeholder?: string;
  
  // Compatibilidade: aceita tanto isDisabled (novo) quanto disabled (antigo)
  isDisabled?: boolean;
  disabled?: boolean; // <--- ADICIONADO PARA CORRIGIR O ERRO
  
  isClearable?: boolean;
  isSearchable?: boolean;
  onChange?: (value: any) => void;
  required?: boolean; 
}

const SelectField: FC<SelectFieldProps> = ({
  label,
  fieldName,
  options,
  formik,
  isMulti = false,
  multiselect = false,
  placeholder,
  isDisabled = false,
  disabled = false, // <--- Recebe a prop aqui
  isClearable = false,
  isSearchable = true,
  onChange,
  required = false,
}) => {
  const themeMode = ThemeModeComponent.getMode();
  const currentTheme = themeMode === 'system' ? ThemeModeComponent.getSystemMode() : themeMode;
  const theme: 'light' | 'dark' = currentTheme as 'light' | 'dark';

  const isMultiple = isMulti || multiselect;
  
  // Unifica as propriedades de desabilitar
  const disabledState = isDisabled || disabled;

  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: theme === 'dark' ? '#1e1e2f' : '#fff',
      borderColor: theme === 'dark' ? '#555' : '#ccc',
      color: theme === 'dark' ? '#fff' : '#000',
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: theme === 'dark' ? '#1e1e2f' : '#fff',
      color: theme === 'dark' ? '#fff' : '#000',
      zIndex: 9999,
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: theme === 'dark' ? '#fff' : '#000',
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: theme === 'dark' ? '#333' : '#eee',
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: theme === 'dark' ? '#fff' : '#000',
    }),
    input: (provided: any) => ({
      ...provided,
      color: theme === 'dark' ? '#fff' : '#000',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: theme === 'dark' ? '#aaa' : '#666',
    }),
  };

  const handleChange = (selected: any) => {
    const finalValue = isMultiple
      ? selected?.map((s: any) => s.value) || []
      : selected?.value || null;

    formik.setFieldValue(fieldName, finalValue);

    if (onChange) {
      onChange(finalValue);
    }
  };

  return (
    <div className='mb-7'>
      <label className={`form-label fw-bold ${required ? 'required' : ''}`}>
        {label}
      </label>
      
      <Select
        name={fieldName}
        isMulti={isMultiple}
        placeholder={placeholder}
        options={options}
        
        // Passamos o estado combinado
        isDisabled={disabledState}
        
        isClearable={isClearable}
        isSearchable={isSearchable}
        onChange={handleChange}
        value={
          isMultiple
            ? (formik.values[fieldName] || []).map((val: string) => {
                const option = options.find((o) => o.value === val);
                return option || { value: val, label: val };
              })
            : formik.values[fieldName]
            ? options.find((o) => o.value === formik.values[fieldName]) || {
                value: formik.values[fieldName],
                label: formik.values[fieldName],
              }
            : null
        }
        styles={customStyles}
        theme={(baseTheme) => ({
          ...baseTheme,
          colors: {
            ...baseTheme.colors,
            primary25: theme === 'dark' ? '#444' : '#ddd',
            primary: theme === 'dark' ? '#6666ff' : '#2684FF',
          },
        })}
      />
      
      {formik.touched[fieldName] && formik.errors[fieldName] && (
        <div className='fv-plugins-message-container'>
          <div className='fv-help-block'>
            <span role='alert'>{String(formik.errors[fieldName])}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectField;