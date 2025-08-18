import React, { FC, useState, useEffect } from 'react'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import { KTSVG } from '@metronic/helpers'
import { Address } from '@interfaces/Address'
import BasicField from '@components/form/BasicField'
import { createAddress } from '@services/Addresses'

type Props = {
  isOpen: boolean
  onClose: () => void
  onAddressCreated: (addressId: string, addressLabel: string) => void
}

const initialAddress: Address = {
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: ''
}

const AddressModal: FC<Props> = ({ isOpen, onClose, onAddressCreated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addressSchema = Yup.object().shape({
    street: Yup.string().required('Rua é obrigatória'),
    city: Yup.string().required('Cidade é obrigatória'),
    state: Yup.string().required('Estado é obrigatório'),
    postalCode: Yup.string().required('CEP é obrigatório'),
    country: Yup.string().required('País é obrigatório'),
  })

  const formik = useFormik({
    initialValues: initialAddress,
    validationSchema: addressSchema,
    validateOnChange: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSubmitting(true)
      setIsSubmitting(true)
      try {
        const response = await createAddress(values)
        const addressLabel = `${values.street}, ${values.city} - ${values.state}`
        onAddressCreated(response.data.id, addressLabel)
        resetForm()
        onClose()
      } catch (ex) {
        console.error(ex)
        alert('Houve um erro ao criar o endereço. Por favor, tente novamente.')
      } finally {
        setSubmitting(false)
        setIsSubmitting(false)
      }
    },
  })

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
  )

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      formik.resetForm()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      <div
        className='modal fade show d-block'
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose()
          }
        }}
      >
        <div className='modal-dialog modal-dialog-centered mw-650px'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'>Criar Novo Endereço</h5>
              <div
                className='btn btn-icon btn-sm btn-active-light-primary ms-2'
                onClick={onClose}
              >
                <KTSVG
                  path='media/icons/duotune/arrows/arr061.svg'
                  className='svg-icon svg-icon-2x'
                />
              </div>
            </div>
            <div className='modal-body scroll-y mx-5 mx-xl-15 my-7'>
              <form onSubmit={formik.handleSubmit} noValidate>
                <div className='d-flex flex-column me-n7 pe-7'>
                  {renderBasicFieldset('street', 'Rua', 'Digite a rua')}
                  {renderBasicFieldset('city', 'Cidade', 'Digite a cidade')}
                  {renderBasicFieldset('state', 'Estado', 'Digite o estado')}
                  {renderBasicFieldset('postalCode', 'CEP', 'Digite o CEP')}
                  {renderBasicFieldset('country', 'País', 'Digite o país')}
                </div>

                <div className='text-center pt-15'>
                  <button
                    type='button'
                    className='btn btn-light me-3'
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type='submit'
                    className='btn btn-primary'
                    disabled={isSubmitting || !formik.isValid || !formik.touched}
                  >
                    <span className='indicator-label'>Criar Endereço</span>
                    {isSubmitting && (
                      <span className='indicator-progress'>
                        Aguarde...{' '}
                        <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className='modal-backdrop fade show'></div>
    </>
  )
}

export { AddressModal }
