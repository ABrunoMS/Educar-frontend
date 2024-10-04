import React, { FC, useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useIntl } from 'react-intl';
import { ProficiencyGroup } from '@interfaces/Proficiency';
import { SelectOptions } from '@interfaces/Forms';
import BasicField from '@components/form/BasicField';
import SelectField from '@components/form/SelectField';
import { getProficiencies } from '@services/Proficiencies';

type Props = {
  isUserLoading?: boolean;
  proficiencyGroup?: ProficiencyGroup;
  editMode?: boolean;
};

const initialProficiencyGroup: ProficiencyGroup = {
  id: '',
  name: '',
  description: '',
  proficiencyIds: []
};

const ProficiencyGroupCreateForm: FC<Props> = ({ proficiencyGroup, isUserLoading }) => {
  const [proficiencyForEdit] = useState<ProficiencyGroup>({
    ...initialProficiencyGroup,
    ...proficiencyGroup,
  });

  const [proficiencies, setProficiencies] = useState<SelectOptions[]>([]);
  const intl = useIntl();

  useEffect(() => {
    // Fetch proficiencies from the API
    getProficiencies().then((response) => {
      const proficiencyOptions = response.data.map((proficiency: any) => ({
        value: proficiency.id,
        label: proficiency.name,
      }));
      setProficiencies(proficiencyOptions);
    });
  }, []);

  const editProficiencyGroupSchema = Yup.object().shape({
    name: Yup.string().required('Field is required'),
    description: Yup.string().required('Field is required'),
    proficiencyIds: Yup.array().of(Yup.string()).min(1, 'Field is required'),
  });

  const formik = useFormik({
    initialValues: proficiencyForEdit,
    validationSchema: editProficiencyGroupSchema,
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
      <form id='kt_modal_add_proficiency_group_form' className='form' onSubmit={formik.handleSubmit} noValidate>
        <div className='d-flex flex-column me-n7 pe-7'>
          {renderBasicFieldset('name', 'Name', 'Enter proficiency group name')}
          {renderBasicFieldset('description', 'Description', 'Enter proficiency group description')}
          {renderSelectFieldset('proficiencyIds', 'Proficiencies', 'Select proficiencies', proficiencies, true, true)}
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

export { ProficiencyGroupCreateForm };