import React, { FC, useState} from 'react'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import Select from 'react-select'
import {isNotEmpty, toAbsoluteUrl} from '../../../../../../_metronic/helpers'
import { User} from '../../../../../../interfaces/User'
import clsx from 'clsx'
import { useIntl } from 'react-intl'
// import {useListView} from '../core/ListViewProvider'
// import {UsersListLoading} from '../components/loading/UsersListLoading'
// import {createUser, updateUser} from '../core/_requests'
// import {useQueryResponse} from '../core/QueryResponseProvider'

type Props = {
  isUserLoading?: boolean
  user?: User
}

type SelectOptions = {
  value: string;
  label: string;
}

export const initialUser: User = {
  avatar: 'avatars/300-3.jpg',
  role: 'Developer',
  name: '',
  email: '',
  registration: '',
  average: 0,
  institution: ''
}

const options: SelectOptions[] = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3' },
  { value: '4', label: 'Option 4' },
]

const UserCreateForm: FC<Props> = ({user, isUserLoading}) => {
  const [userForEdit] = useState<User>({
    ...user,
    avatar: user?.avatar || initialUser.avatar,
    role: user?.role || initialUser.role,
    name: user?.name || initialUser.name,
    email: user?.email || initialUser.email,
    registration: user?.registration || initialUser.registration,
    institution: user?.institution || initialUser.institution
  })

  const intl = useIntl()

  const editUserSchema = Yup.object().shape({
    email: Yup.string()
      .email('Wrong email format')
      .min(3, 'Minimum 3 symbols')
      .max(50, 'Maximum 50 symbols')
      .required('Email is required'),
    name: Yup.string()
      .min(3, 'Minimum 3 symbols')
      .max(50, 'Maximum 50 symbols')
      .required('Name is required'),
    registration: Yup.string()
        .length(10, 'Must have 10 digits')
        .required('Registration is required'),
    average: Yup.number()
      .max(5, 'Value between 0 and 5')
      .required('Average is required'),
    institution: Yup.string()
      .required('Institution is required')
  })

  const formik = useFormik({
    initialValues: userForEdit,
    validationSchema: editUserSchema,
    validateOnChange: true,
    onSubmit: async (values, {setSubmitting}) => {
      // setSubmitting(true)
      // try {
      //   if (isNotEmpty(values.id)) {
      //     await updateUser(values)
      //   } else {
      //     await createUser(values)
      //   }
      // } catch (ex) {
      //   console.error(ex)
      // } finally {
      //   setSubmitting(true)
      //   cancel(true)
      // }
    },
  })

  const getDefaultSelectValue = (name: string): SelectOptions[] => {
    const initialValue = formik.getFieldProps(name).value;
    return options.filter(option => option.value === initialValue);
  }

  const updateSelectValue = (newValue: string | undefined) => {
    formik.setFieldValue('institution', newValue)
  }

  return (
    <>
      <form id='kt_modal_add_user_form' className='form' onSubmit={formik.handleSubmit} noValidate>
        {/* begin::Scroll */}
        <div
          className='d-flex flex-column me-n7 pe-7'
          // id='kt_modal_add_user_scroll'
          // data-kt-scroll='true'
          // data-kt-scroll-activate='{default: false, lg: true}'
          // data-kt-scroll-max-height='auto'
          // data-kt-scroll-dependencies='#kt_modal_add_user_header'
          // data-kt-scroll-wrappers='#kt_modal_add_user_scroll'
          // data-kt-scroll-offset='300px'
        >
          {/* <div className='fv-row mb-7'>
            <label className='d-block fw-bold fs-6 mb-5'>Avatar</label>
            <div
              className='image-input image-input-outline'
              data-kt-image-input='true'
              style={{backgroundImage: `url('${blankImg}')`}}
            >
              <div
                className='image-input-wrapper w-125px h-125px'
                style={{backgroundImage: `url('${userAvatarImg}')`}}
              ></div>
              <label
                className='btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-body shadow'
                data-kt-image-input-action='change'
                data-bs-toggle='tooltip'
                title='Change avatar'
              >
                <i className='bi bi-pencil-fill fs-7'></i>

                <input type='file' name='avatar' accept='.png, .jpg, .jpeg' />
                <input type='hidden' name='avatar_remove' />
              </label>
              <span
                className='btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-body shadow'
                data-kt-image-input-action='cancel'
                data-bs-toggle='tooltip'
                title='Cancel avatar'
              >
                <i className='bi bi-x fs-2'></i>
              </span>
              <span
                className='btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-body shadow'
                data-kt-image-input-action='remove'
                data-bs-toggle='tooltip'
                title='Remove avatar'
              >
                <i className='bi bi-x fs-2'></i>
              </span>
            </div>
            <div className='form-text'>Allowed file types: png, jpg, jpeg.</div>
          </div> */}
          
          <div className='fv-row mb-7'>
            <label className='required fw-bold fs-6 mb-2'>Full Name</label>
            <input
              placeholder='Full name'
              {...formik.getFieldProps('name')}
              type='text'
              name='name'
              className={clsx(
                'form-control form-control-solid mb-3 mb-lg-0',
                {'is-invalid': formik.touched.name && formik.errors.name},
                {
                  'is-valid': formik.touched.name && !formik.errors.name,
                }
              )}
              autoComplete='off'
              disabled={formik.isSubmitting || isUserLoading}
            />
            {formik.touched.name && formik.errors.name && (
              <div className='fv-plugins-message-container'>
                <div className='fv-help-block'>
                  <span role='alert'>{formik.errors.name}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className='fv-row mb-7'>
            <label className='required fw-bold fs-6 mb-2'>Email</label>
            <input
              placeholder='Email'
              {...formik.getFieldProps('email')}
              className={clsx(
                'form-control form-control-solid mb-3 mb-lg-0',
                {'is-invalid': formik.touched.email && formik.errors.email},
                {
                  'is-valid': formik.touched.email && !formik.errors.email,
                }
              )}
              type='email'
              name='email'
              autoComplete='off'
              disabled={formik.isSubmitting || isUserLoading}
            />

            {formik.touched.email && formik.errors.email && (
              <div className='fv-plugins-message-container'>
                <div className='fv-help-block'>
                  <span role='alert'>{formik.errors.email}</span>
                </div>
              </div>
            )}
          </div>

          <div className='fv-row mb-7'>
            <label className='required fw-bold fs-6 mb-2'>Registration number</label>
            <input
              placeholder='Registration number'
              {...formik.getFieldProps('registration')}
              className={clsx(
                'form-control form-control-solid mb-3 mb-lg-0',
                {'is-invalid': formik.touched.registration && formik.errors.registration},
                {
                  'is-valid': formik.touched.registration && !formik.errors.registration,
                }
              )}
              type='text'
              name='registration'
              autoComplete='off'
              disabled={formik.isSubmitting || isUserLoading}
            />

            {formik.touched.registration && formik.errors.registration && (
              <div className='fv-plugins-message-container'>
                <div className='fv-help-block'>
                  <span role='alert'>{formik.errors.registration}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className=' mb-7'>
            <label className='required fw-bold fs-6 mb-2'>Institution</label>
            <Select 
              className={clsx(
                'react-select-styled react-select-solid mb-3 mb-lg-0',
                {'is-invalid': formik.errors.institution}
              )}
              classNames={{
                  control: () => ('border-danger'),
              }}
              classNamePrefix='react-select' 
              options={options}
              placeholder={'Intitution...'}
              // {...formik.getFieldProps('institution')}
              defaultValue={getDefaultSelectValue('institution')}
              name='institution'
              onChange={(newValue) => updateSelectValue(newValue?.value)}
              isDisabled={formik.isSubmitting || isUserLoading}
            />

            {formik.touched.institution && formik.errors.institution && (
              <div className='fv-plugins-message-container'>
                <div className='fv-help-block'>
                  <span role='alert'>{formik.errors.institution}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className='mb-7'>
            <label className='required fw-bold fs-6 mb-5'>Role</label>
            <div className='d-flex fv-row'>
              
              <div className='form-check form-check-custom form-check-solid'>
                <input
                  className='form-check-input me-3'
                  {...formik.getFieldProps('role')}
                  name='role'
                  type='radio'
                  value='Administrator'
                  id='kt_modal_update_role_option_0'
                  checked={formik.values.role === 'Administrator'}
                  disabled={formik.isSubmitting || isUserLoading}
                />
                <label className='form-check-label' htmlFor='kt_modal_update_role_option_0'>
                  <div className='fw-bolder text-gray-800'>Administrator</div>
                </label>
              </div>
            </div>
            <div className='separator separator-dashed my-5'></div>
            <div className='d-flex fv-row'>
              
              <div className='form-check form-check-custom form-check-solid'>
                <input
                  className='form-check-input me-3'
                  {...formik.getFieldProps('role')}
                  name='role'
                  type='radio'
                  value='Developer'
                  id='kt_modal_update_role_option_1'
                  checked={formik.values.role === 'Developer'}
                  disabled={formik.isSubmitting || isUserLoading}
                />
                <label className='form-check-label' htmlFor='kt_modal_update_role_option_1'>
                  <div className='fw-bolder text-gray-800'>Developer</div>
                </label>
              </div>
            </div>
          </div>
        </div>
        {/* end::Scroll */}

        {/* begin::Actions */}
        <div className='text-center pt-15'>
          <button
            type='submit'
            className='btn btn-primary'
            data-kt-users-modal-action='submit'
            // disabled={isUserLoading || formik.isSubmitting || !formik.isValid || !formik.touched}
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
        {/* end::Actions */}
      </form>
      {/* {(formik.isSubmitting || isUserLoading) && <UsersListLoading />} */}
    </>
  )
}

export {UserCreateForm}
