import React, { FC, useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useIntl } from 'react-intl';
import { Class } from '@interfaces/Class';
import { SelectOptions } from '@interfaces/Forms';
import BasicField from '@components/form/BasicField';
import SelectField from '@components/form/SelectField';
import { getAccounts } from '@services/Accounts';

type Props = {
  isUserLoading?: boolean;
  classItem?: Class;
  editMode?: boolean;
};

const initialClass: Class = {
  id: '',
  name: '',
  description: '',
  purpose: 'Default',
  accountIds: []
};

const purposeOptions: SelectOptions[] = [
  { value: 'Default', label: 'Padrão' },
  { value: 'Reinforcement', label: 'Reforços' },
  { value: 'SpecialProficiencies', label: 'Habilidade especial' }
];

const ClassCreateForm: FC<Props> = ({ classItem, isUserLoading }) => {
  const [classForEdit] = useState<Class>({
    ...initialClass,
    ...classItem,
  });

  const [accounts, setAccounts] = useState<SelectOptions[]>([]);
  const intl = useIntl();

  useEffect(() => {
    // Fetch accounts from the API
    getAccounts().then((response) => {
      const accountOptions = response.data.map((account: any) => ({
        value: account.id,
        label: account.name,
      }));
      setAccounts(accountOptions);
    });
  }, []);

  const editClassSchema = Yup.object().shape({
    name: Yup.string().required('Field is required'),
    description: Yup.string().required('Field is required'),
    purpose: Yup.string().oneOf(['Reinforcement', 'Default', 'SpecialProficiencies']).required('Field is required'),
    accountIds: Yup.array().of(Yup.string()).min(1, 'Field is required')
  });

  const formik = useFormik({
    initialValues: classForEdit,
    validationSchema: editClassSchema,
    validateOnChange: true,
    onSubmit: async (values, { setSubmitting }) => {
      // Handle form submission
      console.log('Form values:', values);
      setSubmitting(false);
    },
  });

  const renderBasicFieldset = (
    fieldName: string,
    label: string,
    placeholder: string | null,
    required: boolean = true
  ) => (
    <BasicField
      fieldName={fieldName}
      label={label}
      placeholder={placeholder}
      required={required}
      formik={formik}
    />
  );

  const renderSelectFieldset = (
    fieldName: string,
    label: string,
    placeholder: string | null,
    options: SelectOptions[],
    multiselect: boolean = false,
    required: boolean = true
  ) => (
    <SelectField
      fieldName={fieldName}
      label={label}
      placeholder={placeholder}
      required={required}
      multiselect={multiselect}
      options={options}
      formik={formik}
    />
  );

  return (
    <>
      <form id='kt_modal_add_class_form' className='form' onSubmit={formik.handleSubmit} noValidate>
        <div className='d-flex flex-column me-n7 pe-7'>
          {renderBasicFieldset('name', 'Name', 'Enter class name')}
          {renderBasicFieldset('description', 'Description', 'Enter class description')}
          {renderSelectFieldset('purpose', 'Purpose', 'Select purpose', purposeOptions, false, true)}
          {renderSelectFieldset('accountIds', 'Accounts', 'Select accounts', accounts, true, true)}
        </div>

        <div className='text-center pt-15'>
          <button
            type='submit'
            className='btn btn-primary'
            data-kt-users-modal-action='submit'
          >
            <span className='indicator-label'>Submit</span>
            {(formik.isSubmitting || isUserLoading) && (
              <span className='indicator-progress'>
                Please wait...{' '}
                <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
              </span>
            )}
          </button>
        </div>
      </form>
    </>
  );
};

export { ClassCreateForm };