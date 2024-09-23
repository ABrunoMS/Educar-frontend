
import {useState} from 'react'
import * as Yup from 'yup'
import clsx from 'clsx'
import {useIntl} from 'react-intl'
import {Link} from 'react-router-dom'
import {useFormik} from 'formik'
import {getUserByToken, login} from '../core/_requests'
import {useAuth} from '../core/Auth'

const initialValues = {
  // email: 'admin@demo.com',
  // password: 'demo',
  email: '',
  password: '',
}

/*
  Formik+YUP+Typescript:
  https://jaredpalmer.com/formik/docs/tutorial#getfieldprops
  https://medium.com/@maurice.de.beijer/yup-validation-and-typescript-and-formik-6c342578a20e
*/

export function Login() {
  const intl = useIntl()
  const teste = import.meta.env.VITE_TESTE;
  const authUrl = import.meta.env.VITE_AUTH_BASE_URL;

  const [loading, setLoading] = useState(false)
  const {saveAuth, setCurrentUser} = useAuth()

  const loginSchema = Yup.object().shape({
    email: Yup.string()
      .email(intl.formatMessage({id: 'LOGIN.FORM_EMAIL_ERROR'}))
      .min(3, intl.formatMessage({id: 'LOGIN.FORM_EMAIL_MIN'}))
      .max(50, intl.formatMessage({id: 'LOGIN.FORM_EMAIL_MAX'}))
      .required(intl.formatMessage({id: 'LOGIN.FORM_EMAIL_REQ'})),
    password: Yup.string()
      .min(3, intl.formatMessage({id: 'LOGIN.FORM_PASSWORD_MIN'}))
      .max(50, intl.formatMessage({id: 'LOGIN.FORM_PASSWORD_MAX'}))
      .required(intl.formatMessage({id: 'LOGIN.FORM_PASSWORD_REQ'})),
  })

  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, {setStatus, setSubmitting}) => {
      setLoading(true)
      try {
        
        // const {data: auth} = await login(values.email, values.password)
        // saveAuth(auth)
        // const {data: user} = await getUserByToken(auth.api_token)
        // setCurrentUser(user)
      } catch (error) {
        // console.error(error)
        // saveAuth(undefined)
        // setStatus(intl.formatMessage({id: 'LOGIN.INVALID_CREDENTIALS'}))
        // setSubmitting(false)
        // setLoading(false)
      }
    },
  })

  return (
    <form
      className='form w-100'
      onSubmit={formik.handleSubmit}
      noValidate
      id='kt_login_signin_form'
    >
      {/* begin::Heading */}
      <div className='text-center mb-11'>
        <h1 className='text-gray-900 fw-bolder mb-3'>Vamos começar {teste}</h1>
      </div>
      {/* begin::Heading */}

      <div className='d-grid mb-10'>
        <Link
          to={`${authUrl}/`}
          id='kt_sign_in_submit'
          className='btn btn-secondary'
        >
          {!loading && <span className='indicator-label'>{intl.formatMessage({id: 'LOGIN.FORM_SUBMIT_LABEL'})}</span>}
          {loading && (
            <span className='indicator-progress' style={{display: 'block'}}>
              {intl.formatMessage({id: 'LOGIN.FORM_SUBMIT_LOADING'})}
              <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
            </span>
          )}
        </Link>
      </div>
      
      <div className='d-flex flex-stack flex-wrap gap-3 fs-base fw-semibold mb-8'>
        <Link to='/auth/forgot-password' className='link-primary'>
          {intl.formatMessage({id: 'LOGIN.FORGOT_PASSWORD'})}
        </Link>
      </div>
    </form>
  )
}
