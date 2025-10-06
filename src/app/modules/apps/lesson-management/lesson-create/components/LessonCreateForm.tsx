import React, { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import BasicField from '@components/form/BasicField'
import SelectField from '@components/form/SelectField'
import { SelectOptions } from '@interfaces/Forms'

type OptionType = SelectOptions

const LessonCreateForm: React.FC = () => {
    const navigate = useNavigate()
    // ... (States e Options omitidos por brevidade, mas devem permanecer)

    const [schools] = useState<OptionType[]>([
        { value: '1', label: 'Escola A' },
        { value: '2', label: 'Escola B' },
    ])
    const [classes] = useState<OptionType[]>([
        { value: '1', label: 'Turma 601' },
        { value: '2', label: 'Turma 702' },
    ])
    const [disciplines] = useState<OptionType[]>([
        { value: '1', label: 'Matemática' },
        { value: '2', label: 'Português' },
    ])
    const [schoolYears] = useState<OptionType[]>([
        { value: '6', label: '6º Ano' },
        { value: '7º', label: '7º Ano' },
    ])
    const bnccOptions = [
        'BNCC',
        'Saeb',
        'Enem',
        'Educação financeira',
        'Empreendedorismo',
        'Jornada do trabalho',
    ]

    const validationSchema = Yup.object().shape({
        description: Yup.string().required('Descrição obrigatória'),
        school: Yup.string().required('Escola obrigatória'),
        class: Yup.string().required('Turma obrigatória'),
        discipline: Yup.string().required('Disciplina obrigatória'),
        schoolYear: Yup.string().required('Ano escolar obrigatório'),
        combat: Yup.string().required('Combate obrigatório'),
        bncc: Yup.array().min(1, 'Selecione ao menos uma opção BNCC'),
    })

    const formik = useFormik({
        initialValues: {
            description: '',
            school: '',
            class: '',
            discipline: '',
            schoolYear: '',
            combat: '',
            bncc: [] as string[],
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                console.log('Aula sendo salva:', values)

                // Simular a criação da aula na API e obter um ID
                const mockLessonId = 'a1b2c3d4'

                // NOVO: Navega para a rota de etapas após o "salvamento"
                // '..' sobe um nível (de 'create' para '/apps/lesson-management/') e adiciona 'steps/:id'
                navigate(`../steps/${mockLessonId}`)

            } catch (error) {
                console.error(error)
            } finally {
                setSubmitting(false)
            }
        },
    })

    return (
        <div className='w-100'>
            <h3 className='fw-bold mb-10'>
                Criar Aula
            </h3>

            <form onSubmit={formik.handleSubmit} className='form pb-10' noValidate>

                <div className='d-flex flex-column me-n7 pe-7'>

                    <div className='fv-row mb-7'>
                        <SelectField
                            fieldName='schoolYear'
                            label='Ano escolar'
                            placeholder='--- Selecione ---'
                            options={schoolYears}
                            required={true}
                            multiselect={false}
                            formik={formik}
                        // inputClassName='form-select form-select-solid' <-- REMOVIDO
                        />
                    </div>

                    <div className='fv-row mb-7'>
                        <SelectField
                            fieldName='school'
                            label='Escola'
                            placeholder='--- Selecione ---'
                            options={schools}
                            required={true}
                            multiselect={false}
                            formik={formik}
                        // inputClassName='form-select form-select-solid' <-- REMOVIDO
                        />
                    </div>

                    <div className='fv-row mb-7'>
                        <SelectField
                            fieldName='class'
                            label='Turma'
                            placeholder='--- Selecione ---'
                            options={classes}
                            required={true}
                            multiselect={false}
                            formik={formik}
                        // inputClassName='form-select form-select-solid' <-- REMOVIDO
                        />
                    </div>

                    <div className='fv-row mb-7'>
                        <SelectField
                            fieldName='discipline'
                            label='Disciplina'
                            placeholder='--- Selecione ---'
                            options={disciplines}
                            required={true}
                            multiselect={false}
                            formik={formik}
                        // inputClassName='form-select form-select-solid' <-- REMOVIDO
                        />
                    </div>

                    <div className='fv-row mb-7'>
                        <BasicField
                            fieldName='description'
                            label='Descrição da aula'
                            placeholder='Descrição da aula'
                            required={true}
                            formik={formik}
                            rows={4}
                        // inputClassName='form-control form-control-solid' <-- REMOVIDO
                        />
                    </div>

                    <div className='fv-row mb-7'>
                        <BasicField
                            fieldName='combat'
                            label='Combate'
                            placeholder='Combate'
                            required={true}
                            formik={formik}
                        // inputClassName='form-control form-control-solid' <-- REMOVIDO
                        />
                    </div>

                    {/* ... (restante do formulário) */}

                    {/* ... (Bloco BNCC) ... */}

                    <div className='fv-row mb-7'>
                        <label className={clsx('form-label fw-semibold fs-6 mb-2', { 'required': true })}>
                            BNCC
                        </label>

                        <div className='d-flex flex-wrap gap-4 align-items-center'>
                            {bnccOptions.map((opt) => (
                                <div key={opt} className='form-check'>
                                    <input
                                        id={opt}
                                        type='checkbox'
                                        value={opt}
                                        checked={formik.values.bncc.includes(opt)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                formik.setFieldValue('bncc', [...formik.values.bncc, opt])
                                            } else {
                                                formik.setFieldValue(
                                                    'bncc',
                                                    formik.values.bncc.filter((v) => v !== opt)
                                                )
                                            }
                                            formik.setFieldTouched('bncc', true);
                                        }}
                                        className='form-check-input'
                                    />
                                    <label htmlFor={opt} className='form-check-label'>
                                        {opt}
                                    </label>
                                </div>
                            ))}
                        </div>

                        {formik.touched.bncc && formik.errors.bncc && (
                            <div className='fv-plugins-message-container'>
                                <div className='fv-help-block'>
                                    <span role='alert'>{formik.errors.bncc}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className='mb-7'>
                        <div className='alert py-2 px-3' style={{ backgroundColor: '#545598', color: '#fff', border: 'none' }}>
                            Salve a aula antes de vincular etapas e alunos
                        </div>
                    </div>
                </div>

                <div className='text-end mt-10'>
                    <button
                        type='submit'
                        className='btn btn-primary'
                        data-kt-users-modal-action='submit'
                        disabled={formik.isSubmitting}
                    >
                        <span className='indicator-label'>
                            {formik.isSubmitting ? 'Aguarde...' : 'Salvar aula e continuar montando etapas'}
                        </span>
                        {formik.isSubmitting && (
                            <span className='indicator-progress'>
                                {' '}
                                <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                            </span>
                        )}
                    </button>

                    <button
                        type='button'
                        className='btn btn-link ms-8'
                        onClick={() => navigate('/aulas')}
                    >
                        Voltar
                    </button>
                </div>
            </form>
        </div>
    )
}

export default LessonCreateForm