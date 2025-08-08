import {useState} from 'react'
import * as Yup from 'yup'
import clsx from 'clsx'
import {useIntl} from 'react-intl'
import {Link} from 'react-router-dom'
import {useFormik} from 'formik'
import {resetPassword} from '../core/_requests'

const initialValues = {
  // email: 'admin@demo.com',
  email: '',
}

export function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [hasErrors, setHasErrors] = useState<boolean | undefined>(undefined)
  
  const intl = useIntl()
  const forgotPasswordSchema = Yup.object().shape({
    email: Yup.string()
      .email(intl.formatMessage({id: 'FORGOT_PASS.FORM_EMAIL_ERROR'}))
      .min(3, intl.formatMessage({id: 'FORGOT_PASS.FORM_EMAIL_MIN'}))
      .max(50, intl.formatMessage({id: 'FORGOT_PASS.FORM_EMAIL_MAX'}))
      .required(intl.formatMessage({id: 'FORGOT_PASS.FORM_EMAIL_REQ'})),
  })

  const formik = useFormik({
    initialValues,
    validationSchema: forgotPasswordSchema,
    onSubmit: (values, {setStatus, setSubmitting}) => {
      setLoading(true)
      setHasErrors(undefined)
      setTimeout(() => {
        resetPassword(values.email)
          .then(() => {
            setHasErrors(false)
            setLoading(false)
          })
          .catch(() => {
            setHasErrors(true)
            setLoading(false)
            setSubmitting(false)
            setStatus('The login detail is incorrect')
          })
      }, 1000)
    },
  })

  return (
    <form
      className='form w-100 fv-plugins-bootstrap5 fv-plugins-framework'
      noValidate
      id='kt_login_password_reset_form'
      onSubmit={formik.handleSubmit}
    >
      <div className='text-center mb-10'>
        {/* begin::Title */}
        <h1 className='text-gray-900 fw-bolder mb-3'>{intl.formatMessage({id: 'FORGOT_PASS.TITLE'})}</h1>
        {/* end::Title */}

        {/* begin::Link */}
        <div className='text-gray-500 fw-semibold fs-6'>
          {intl.formatMessage({id: 'FORGOT_PASS.DISCLAIMER'})}
        </div>
        {/* end::Link */}
      </div>

      {/* begin::Title */}
      {hasErrors === true && (
        <div className='mb-lg-15 alert alert-danger'>
          <div className='alert-text font-weight-bold'>
            {intl.formatMessage({id: 'FORGOT_PASS.ERROR'})}
          </div>
        </div>
      )}

      {hasErrors === false && (
        <div className='mb-10 bg-light-info p-8 rounded'>
          <div className='text-info'>{intl.formatMessage({id: 'FORGOT_PASS.SUCCESS'})}</div>
        </div>
      )}
      {/* end::Title */}

      {/* begin::Form group */}
      <div className='fv-row mb-8'>
        <label className='form-label fw-bolder text-gray-900 fs-6'>{intl.formatMessage({id: 'FORGOT_PASS.EMAIL_LABEL'})}</label>
        <input
          type='email'
          placeholder={intl.formatMessage({id: 'FORGOT_PASS.EMAIL_LABEL'})}
          autoComplete='off'
          {...formik.getFieldProps('email')}
          className={clsx(
            'form-control bg-transparent',
            {'is-invalid': formik.touched.email && formik.errors.email},
            {
              'is-valid': formik.touched.email && !formik.errors.email,
            }
          )}
        />
        {formik.touched.email && formik.errors.email && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.email}</span>
            </div>
          </div>
        )}
      </div>
      {/* end::Form group */}

      {/* begin::Form group */}
      <div className='d-flex flex-wrap justify-content-center pb-lg-0'>
        <button type='submit' id='kt_password_reset_submit' className='btn btn-primary me-4'>
          <span className='indicator-label'>{intl.formatMessage({id: 'FORGOT_PASS.SUBMIT_LABEL'})}</span>
          {loading && (
            <span className='indicator-progress'>
              {intl.formatMessage({id: 'FORGOT_PASS.LOADING'})}
              <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
            </span>
          )}
        </button>
        <Link to='/auth/login'>
          <button
            type='button'
            id='kt_login_password_reset_form_cancel_button'
            className='btn btn-light'
            disabled={formik.isSubmitting || !formik.isValid}
          >
            {intl.formatMessage({id: 'FORGOT_PASS.CANCEL_LABEL'})}
          </button>
        </Link>{' '}
      </div>
      {/* end::Form group */}
    </form>
  )
}
