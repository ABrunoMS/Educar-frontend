import React from "react";
import clsx from "clsx";
import { FormikProps } from "formik";

interface FieldProps {
  fieldName: string;
  label: string;
  placeholder?: string | null;
  required?: boolean;
  formik: FormikProps<any>;
  type?: 'text' | 'number' | 'password';
  rows?: number;
}

const BasicField: React.FC<FieldProps> = ({
  fieldName,
  label,
  placeholder,
  required = false,
  formik,
  type = 'text',
  rows = 1,
}) => {
  const meta = formik.getFieldMeta(fieldName);
  const showError = formik.submitCount > 0 && meta.error; // só após submit
  const isTextArea = rows > 1;

  return (
    <div className='fv-row mb-7'>
      <label className='fw-bold fs-6 mb-2'>
        {label} {required && showError && <span className='text-danger'>*</span>}
      </label>

      {isTextArea ? (
        <textarea
          placeholder={placeholder || undefined}
          {...formik.getFieldProps(fieldName)}
          name={fieldName}
          rows={rows}
          className={clsx(
            'form-control form-control-solid mb-3 mb-lg-0',
            { 'is-invalid': showError },
            { 'is-valid': formik.submitCount > 0 && !meta.error }
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
            { 'is-invalid': showError },
            { 'is-valid': formik.submitCount > 0 && !meta.error }
          )}
          autoComplete='off'
          disabled={formik.isSubmitting}
        />
      )}

      {showError && (
        <div className='fv-plugins-message-container'>
          <div className='fv-help-block'>
            <span role='alert'>{meta.error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicField;
