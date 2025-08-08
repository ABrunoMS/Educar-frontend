import React, { FC, useState} from 'react'
import * as Yup from 'yup'
import {useFormik} from 'formik'
// import Flatpickr from "react-flatpickr"
import { useIntl } from 'react-intl'
import { Address } from '@interfaces/Address'
import BasicField from '@components/form/BasicField'

type Props = {
  isUserLoading?: boolean
  address?: Address
}

const initialAddress: Address = {
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  lat: 0,
  lng: 0
}

const AddressCreateForm: FC<Props> = ({ address, isUserLoading }) => {
  const [addressForEdit] = useState<Address>({
    ...address,
    street: address?.street || initialAddress.street,
    city: address?.city || initialAddress.city,
    state: address?.state || initialAddress.state,
    postalCode: address?.postalCode || initialAddress.postalCode,
    country: address?.country || initialAddress.country,
    lat: address?.lat || initialAddress.lat,
    lng: address?.lng || initialAddress.lng
  })

  const intl = useIntl()

  const editAddressSchema = Yup.object().shape({
    street: Yup.string().required('Field is required'),
    city: Yup.string().required('Field is required'),
    state: Yup.string().required('Field is required'),
    postalCode: Yup.string().required('Field is required'),
    country: Yup.string().required('Field is required'),
    lat: Yup.number().required('Field is required'),
    lng: Yup.number().required('Field is required')
  })

  const formik = useFormik({
    initialValues: addressForEdit,
    validationSchema: editAddressSchema,
    validateOnChange: true,
    onSubmit: async (values, { setSubmitting }) => {
      // Handle form submission
    },
  })

  const renderBasicFieldset = (
    fieldName: string,
    label: string,
    placeholder: string | null,
    required: boolean = true
  ) =>
  <BasicField
    fieldName={fieldName}
    label={label}
    placeholder={placeholder}
    required={required}
    formik={formik}
  />

  return (
    <>
      <form id='kt_modal_add_address_form' className='form' onSubmit={formik.handleSubmit} noValidate>
        <div className='d-flex flex-column me-n7 pe-7'>
          {/* Street */}
          {renderBasicFieldset('street', 'Street', 'Enter street')}

          {/* City */}
          {renderBasicFieldset('city', 'City', 'Enter city')}

          {/* State */}
          {renderBasicFieldset('state', 'State', 'Enter state')}

          {/* Postal Code */}
          {renderBasicFieldset('postalCode', 'Postal Code', 'Enter postal code')}

          {/* Country */}
          {renderBasicFieldset('country', 'Country', 'Enter country')}

          {/* Latitude */}
          {renderBasicFieldset('lat', 'Latitude', 'Enter latitude')}

          {/* Longitude */}
          {renderBasicFieldset('lng', 'Longitude', 'Enter longitude')}
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
  )
}

export { AddressCreateForm }
