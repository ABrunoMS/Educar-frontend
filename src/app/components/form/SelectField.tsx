import React from "react"
import clsx from "clsx";
import { FormikProps } from "formik";
import Select from "react-select"
import { SelectOptions } from '@interfaces/Forms'

interface FieldProps {
  fieldName: string;
  label: string;
  placeholder: string | null;
  required: boolean;
  disabled?: boolean;
  multiselect: boolean;
  onChange?: (value: string | string[]) => void; // Tipagem mais específica
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
  multiselect,
  onChange // <-- Recebendo a prop
}) => {
  // Esta função agora será usada para a prop 'value'
  const getCurrentValues = (): SelectOptions | SelectOptions[] | null => {
    const formikValue = formik.getFieldProps(fieldName).value;
    if (multiselect) {
      // Para multiselect, formikValue é um array de strings (ex: ['id1', 'id2'])
      return options.filter(option => formikValue.includes(option.value));
    }
    // Para select único, formikValue é uma única string (ex: 'id1')
    return options.find(option => option.value === formikValue) || null;
  }

  const handleUpdate = (newValue: any) => {
    let finalValue: string | string[];

    // Lógica para extrair o(s) valor(es) para o Formik
    if (multiselect) {
      finalValue = newValue ? newValue.map((option: SelectOptions) => option.value) : [];
    } else {
      finalValue = newValue ? newValue.value : '';
    }

    // 1. Atualiza o Formik
    formik.setFieldValue(fieldName, finalValue);

    // 2. (CORREÇÃO DO BUG) Chama a função onChange customizada, se ela existir
    if (onChange) {
      onChange(finalValue);
    }
  }

  return (
    <div className='mb-7'>
      <label
        className={clsx(
          'fw-bold fs-6 mb-2',
          {'required': required}
        )}
      >{label}</label>
      <Select 
        className={clsx(
          'react-select-styled react-select-solid mb-3 mb-lg-0',
          {'is-invalid': formik.getFieldMeta(fieldName).touched && formik.getFieldMeta(fieldName).error}
        )}
        classNamePrefix='react-select' 
        options={options}
        placeholder={placeholder}
        // MELHORIA: Usando 'value' para ser um componente controlado
        value={getCurrentValues()}
        name={fieldName}
        onChange={handleUpdate} // Usando a nova função unificada
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