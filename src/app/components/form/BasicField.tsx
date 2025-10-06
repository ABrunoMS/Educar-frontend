import React from "react"
import clsx from "clsx";
import { FormikProps } from "formik";

interface FieldProps {
  fieldName: string;
  label: string;
  placeholder: string | null;
  required: boolean;
  formik: FormikProps<any>;
  type?: 'text' | 'number' | 'password';
  rows?: number; // <--- Adicionado
}

const BasicField: React.FC<FieldProps> = ({
  fieldName,
  label,
  placeholder,
  required,
  formik,
  type = 'text',
  rows = 1, // <--- Adicionado com default 1
}) => {
  const isTextArea = rows > 1;

  return (
    // Removi 'fv-row' para usar 'col-12' ou 'col-md-4' no LessonCreate,
    // mas mantive a estrutura básica do label/input/erro.
    <div className='fv-row mb-7'> 
      <label
        className={clsx(
          'fw-bold fs-6 mb-2',
          {'required': required}
        )}
      >{label}</label>

      {isTextArea ? (
        <textarea
          placeholder={placeholder || undefined}
          {...formik.getFieldProps(fieldName)}
          name={fieldName}
          rows={rows} // Renderiza o número de linhas
          className={clsx(
            'form-control form-control-solid mb-3 mb-lg-0',
            {'is-invalid': formik.getFieldMeta(fieldName).touched && formik.getFieldMeta(fieldName).error},
            {
              'is-valid': formik.getFieldMeta(fieldName).touched && !formik.getFieldMeta(fieldName).error,
            }
          )}
          autoComplete='off'
          disabled={formik.isSubmitting}
        />
      ) : (
        <input
          placeholder={placeholder || undefined}
          {...formik.getFieldProps(fieldName)}
          type={type}
          name={fieldName}
          className={clsx(
            'form-control form-control-solid mb-3 mb-lg-0',
            {'is-invalid': formik.getFieldMeta(fieldName).touched && formik.getFieldMeta(fieldName).error},
            {
              'is-valid': formik.getFieldMeta(fieldName).touched && !formik.getFieldMeta(fieldName).error,
            }
          )}
          autoComplete='off'
          disabled={formik.isSubmitting}
        />
      )}
      
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

export default BasicField;