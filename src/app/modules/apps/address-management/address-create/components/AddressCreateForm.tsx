import { FC, useState } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useIntl } from 'react-intl';
import { Address } from '@interfaces/Address';
import BasicField from '@components/form/BasicField';
import { createAddress, updateAddress, AddressType } from '../../address-list/core/_requests';
import { isNotEmpty } from '@metronic/helpers';

type Props = {
  isUserLoading?: boolean;
  address?: Address;
};

const initialAddress: Address = {
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: ''
};

const AddressCreateForm: FC<Props> = ({ address, isUserLoading }) => {
  const [addressForEdit] = useState<Address>({
    ...initialAddress,
    ...address,
  });

  const intl = useIntl();

  const editAddressSchema = Yup.object().shape({
    street: Yup.string().required('Street is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    postalCode: Yup.string().required('Postal code is required'),
    country: Yup.string().required('Country is required'),
  });

  const formik = useFormik({
    initialValues: addressForEdit,
    validationSchema: editAddressSchema,
    validateOnChange: true,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      try {
        if (isNotEmpty(values.id)) {
          // Usando type cast para resolver o erro de tipagem.
          await updateAddress(values as AddressType);
          alert('Endereço atualizado com sucesso!');
        } else {
          await createAddress(values);
          alert('Endereço criado com sucesso!');
        }
      } catch (ex) {
        console.error(ex);
        alert('Houve um erro ao salvar o endereço. Por favor, tente novamente.');
      } finally {
        setSubmitting(false);
        formik.resetForm();
      }
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

  return (
    <form id='kt_modal_add_address_form' className='form' onSubmit={formik.handleSubmit} noValidate>
      <div className='d-flex flex-column me-n7 pe-7'>
        {renderBasicFieldset('street', 'Street', 'Enter street')}
        {renderBasicFieldset('city', 'City', 'Enter city')}
        {renderBasicFieldset('state', 'State', 'Enter state')}
        {renderBasicFieldset('postalCode', 'Postal Code', 'Enter postal code')}
        {renderBasicFieldset('country', 'Country', 'Enter country')}
      </div>

      <div className='text-center pt-15'>
        <button
          type='submit'
          className='btn btn-primary'
          data-kt-users-modal-action='submit'
          disabled={formik.isSubmitting || isUserLoading || !formik.isValid || !formik.touched}
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
  );
};

export { AddressCreateForm };