import React from 'react';
import AsyncSelect from 'react-select/async';
import { SelectOptions } from '@interfaces/Forms';
import { FormikProps } from 'formik';

type Props = {
  label: string;
  fieldName: string;
  placeholder?: string;
  isMulti?: boolean;
  loadOptions: (inputValue: string, callback: (options: SelectOptions[]) => void) => void;
  formik: FormikProps<any>;
};

const AsyncSelectField: React.FC<Props> = ({
  label,
  fieldName,
  placeholder,
  isMulti = false,
  loadOptions,
  formik,
}) => {
  // 1. Pegamos as funções e estados que precisamos diretamente do 'formik'
  const { setFieldValue, getFieldMeta, values } = formik;

  // 2. Usamos 'getFieldMeta' para obter 'touched' e 'error'
  const { touched, error } = getFieldMeta(fieldName);

  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      // Usamos 'touched' e 'error' que pegamos do getFieldMeta
      borderColor: touched && error ? 'red' : provided.borderColor,
    }),
  };

  const handleChange = (selectedOption: any) => {
    const value = isMulti
      ? selectedOption ? selectedOption.map((option: SelectOptions) => option.value) : []
      : selectedOption ? selectedOption.value : '';
    // Usamos 'setFieldValue' do formik
    setFieldValue(fieldName, value);
  };

  // Lógica para encontrar as opções selecionadas atualmente para exibir no campo
  const findSelectedValue = () => {
    const currentValue = values[fieldName];
    if (isMulti) {
        // Se for multi-select, precisamos de um array de objetos de opção
        if (!Array.isArray(currentValue)) return [];
        // Esta é uma simplificação. O ideal seria ter acesso a todas as opções para encontrar o 'label'.
        // Por agora, vamos exibir o próprio valor como label se a opção não for encontrada.
        return currentValue.map(v => ({ value: v, label: v }));
    }
    // Se for single-select
    if (currentValue) {
        return { value: currentValue, label: currentValue };
    }
    return null;
  }

  return (
    <div className='mb-7'>
      <label className='form-label fw-bold'>{label}</label>
      <AsyncSelect
        name={fieldName} // <-- Conectado ao Formik
        value={findSelectedValue()} // <-- Exibe o valor atual
        isMulti={isMulti}
        cacheOptions
        defaultOptions
        loadOptions={loadOptions}
        placeholder={placeholder}
        onChange={handleChange}
        styles={customStyles}
        getOptionValue={(option: any) => option.value} // Tipagem para 'any' para evitar erro
        getOptionLabel={(option: any) => option.label}
        noOptionsMessage={() => 'Nenhuma opção encontrada'}
        loadingMessage={() => 'Buscando...'}
      />
      {touched && error && (
        <div className='fv-plugins-message-container'>
          <div className='fv-help-block'>
            <span role='alert'>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsyncSelectField;