import React, { FC } from 'react';
import AsyncSelect from 'react-select/async';
import { SelectOptions } from '@interfaces/Forms';
import { FormikProps } from 'formik';
import { ThemeModeComponent } from '../../../_metronic/assets/ts/layout/ThemeMode';

interface AsyncSelectFieldProps {
  label: string;
  fieldName: string;
  isMulti?: boolean;
  placeholder?: string;
  loadOptions: (inputValue: string, callback: (options: SelectOptions[]) => void) => void;
  formik: FormikProps<any>;
  isDisabled?: boolean;
  defaultOptions?: SelectOptions[]; // 💡 Mostra lista completa antes de digitar
}

const AsyncSelectField: FC<AsyncSelectFieldProps> = ({
  label,
  fieldName,
  isMulti = false,
  placeholder,
  loadOptions,
  formik,
  isDisabled = false,
  defaultOptions = [],
}) => {
  const themeMode = ThemeModeComponent.getMode();
  const currentTheme =
    themeMode === 'system' ? ThemeModeComponent.getSystemMode() : themeMode;
  const theme: 'light' | 'dark' = currentTheme as 'light' | 'dark';

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

  return (
    <div>
      <label className="form-label">{label}</label>
      <AsyncSelect
        isMulti={isMulti}
        placeholder={placeholder}
        loadOptions={loadOptions}
        defaultOptions={defaultOptions} // 💡 Lista completa antes de digitar
        isDisabled={isDisabled}
        onChange={(selected: any) =>
          formik.setFieldValue(
            fieldName,
            isMulti ? selected?.map((s: any) => s.value) || [] : selected?.value || ''
          )
        }
        value={
          isMulti
            ? formik.values[fieldName]?.map((val: string) => {
                const option = defaultOptions.find((o) => o.value === val);
                return option || { value: val, label: val };
              }) || []
            : formik.values[fieldName]
            ? defaultOptions.find((o) => o.value === formik.values[fieldName]) || {
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
    </div>
  );
};

export default AsyncSelectField;
