
import {useState} from 'react'
import * as Yup from 'yup'
import clsx from 'clsx'
import {useIntl} from 'react-intl'
import {Link} from 'react-router-dom'
import {useFormik} from 'formik'
import {getUserByToken, login} from '../core/_requests'
import {useAuth} from '../core/Auth'
import { UserModel } from '../core/_models'
import { toast } from 'react-toastify'
import { useRole } from '@contexts/RoleContext'
import { setupAxios } from '../core/AuthHelpers'
import axios from 'axios'

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

  const [loading, setLoading] = useState(false)
  const {saveAuth, setCurrentUser} = useAuth()
  const {setRoles} = useRole()

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
        const { data: auth } = await login(values.email, values.password)
        saveAuth(auth)
        setupAxios(axios)
        const user = await getUserByToken()
        console.log('[Login] User from API:', user)
        console.log('[Login] User roles from API:', user?.roles)
        if (user) {
        setCurrentUser(user)
        // A lógica de Role agora funciona com o objeto 'user' real
        const { mapRoleString } = await import('@contexts/roles.generated')
        const mappedRoles = (user.roles || [])
          .map((r: string) => mapRoleString(r))
          .filter(Boolean) as any
        console.log('[Login] Mapped roles:', mappedRoles)
        if (mappedRoles.length) {
          setRoles(mappedRoles)
          console.log('[Login] setRoles called with:', mappedRoles)
        }

        toast.success(`Bem vindo, ${user.name}`) // Use user.name que vem da API
      } else {
        throw new Error("Não foi possível obter os dados do usuário após o login.")
      }

    } catch (error) {
      console.error(error)
      saveAuth(undefined)
      setStatus('As credenciais de login estão incorretas ou o servidor está indisponível.')
      toast.error('As credenciais de login estão incorretas.');
    } finally {
      setSubmitting(false)
      setLoading(false)
    }
  },
})

       /* toast.success(`Bem vindo, ${user.email}`)
        setRole(user.roles!.filter(item => (item === 'Admin' || item === 'Teacher' || item === 'Student'))[0])
        setCurrentUser(user)
      } catch (error) {
        console.error(error)
        saveAuth(undefined)
        setStatus('Credenciais inválidas')
        toast.error('Credenciais inválidas');
        setSubmitting(false)
        setLoading(false)
      }
    },
  })*/

  return (
    <form
      className='form w-100'
      onSubmit={formik.handleSubmit}
      noValidate
      id='kt_login_signin_form'
    >
      {/* begin::Heading */}
      <div className='text-center mb-11'>
        <h1 className='text-gray-900 fw-bolder mb-3'>{intl.formatMessage({id: 'LOGIN.TITLE'})}</h1>
      </div>
      {/* begin::Heading */}

      {formik.status && (
        <div className='mb-lg-15 alert alert-danger'>
          <div className='alert-text font-weight-bold'>{formik.status}</div>
        </div>
      )}

      {/* begin::Form group */}
      <div className='fv-row mb-8'>
        <label className='form-label fs-6 fw-bolder text-gray-900'>
          {intl.formatMessage({id: 'LOGIN.FORM_EMAIL_LABEL'})}
        </label>
        <input
          placeholder={intl.formatMessage({id: 'LOGIN.FORM_EMAIL_LABEL'})}
          {...formik.getFieldProps('email')}
          className={clsx(
            'form-control bg-transparent',
            {'is-invalid': formik.touched.email && formik.errors.email},
            {
              'is-valid': formik.touched.email && !formik.errors.email,
            }
          )}
          type='email'
          name='email'
          autoComplete='off'
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
      <div className='fv-row mb-3'>
        <label className='form-label fw-bolder text-gray-900 fs-6 mb-0'>
          {intl.formatMessage({id: 'LOGIN.FORM_PASSWORD_LABEL'})}
        </label>
        <input
          type='password'
          placeholder={intl.formatMessage({id: 'LOGIN.FORM_PASSWORD_LABEL'})}
          autoComplete='off'
          {...formik.getFieldProps('password')}
          className={clsx(
            'form-control bg-transparent',
            {
              'is-invalid': formik.touched.password && formik.errors.password,
            },
            {
              'is-valid': formik.touched.password && !formik.errors.password,
            }
          )}
        />
        {formik.touched.password && formik.errors.password && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.password}</span>
            </div>
          </div>
        )}
      </div>
      {/* end::Form group */}

      {/* begin::Wrapper */}
      <div className='d-flex flex-stack flex-wrap gap-3 fs-base fw-semibold mb-8'>
        <div />

        {/* begin::Link */}
        <Link to='/auth/forgot-password' className='link-primary'>
          {intl.formatMessage({id: 'LOGIN.FORGOT_PASSWORD'})}
        </Link>
        {/* end::Link */}
      </div>
      {/* end::Wrapper */}

      {/* begin::Action */}
      <div className='d-grid mb-10'>
        <button
          type='submit'
          id='kt_sign_in_submit'
          className='btn btn-secondary'
          disabled={formik.isSubmitting || !formik.isValid}
        >
          {!loading && <span className='indicator-label'>{intl.formatMessage({id: 'LOGIN.FORM_SUBMIT_LABEL'})}</span>}
          {loading && (
            <span className='indicator-progress' style={{display: 'block'}}>
              {intl.formatMessage({id: 'LOGIN.FORM_SUBMIT_LOADING'})}
              <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
            </span>
          )}
        </button>
      </div>
      {/* end::Action */}

      {/* <div className='text-gray-500 text-center fw-semibold fs-6'>
        Não é membro ainda?{' '}
        <Link to='/auth/registration' className='link-primary'>
          Cadastrar
        </Link>
      </div> */}
    </form>
  )
}
