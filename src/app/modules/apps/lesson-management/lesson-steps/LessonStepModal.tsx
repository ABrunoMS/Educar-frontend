import React, { FC } from 'react'
import { Modal } from 'react-bootstrap'
import { useFormik } from 'formik'
import * as Yup from 'yup'

// Tipagem para a Etapa (Mantendo a estrutura do Card)
interface Step {
    id: number
    type: string // Apelido (ex: Conteúdo, Atividade, Quiz)
    title: string // Título/Apelido
    active: boolean
    sequence: number
    character: string // Novo campo: Personagem
    suggestion: string // Novo campo: Sugestões
}

// Props do Modal
interface StepModalProps {
    show: boolean
    handleClose: () => void
    step: Step | null // null para criação, Step para edição
    lessonSequence: number // Para sugerir a próxima sequência
    onSave: (step: Omit<Step, 'id'>) => void
}

const stepSchema = Yup.object().shape({
    title: Yup.string().required('O título (apelido) é obrigatório'),
    type: Yup.string().required('O tipo de etapa é obrigatório'),
    character: Yup.string().required('O personagem é obrigatório'),
    sequence: Yup.number().min(1, 'A sequência deve ser 1 ou mais').required('A sequência é obrigatória'),
    active: Yup.boolean().required('O status é obrigatório'),
    suggestion: Yup.string(),
})

const StepModal: FC<StepModalProps> = ({ show, handleClose, step, lessonSequence, onSave }) => {
    const isEdit = step !== null

    const formik = useFormik({
        initialValues: {
            title: step?.title || '',
            type: step?.type || '',
            active: step?.active ?? true, // Default ativo na criação
            sequence: step?.sequence || lessonSequence,
            character: step?.character || '',
            suggestion: step?.suggestion || '',
        },
        validationSchema: stepSchema,
        enableReinitialize: true,
        onSubmit: (values, { setSubmitting }) => {
            onSave(values); // Chama a função de salvar no LessonStepPage
            setSubmitting(false);
            handleClose();
        },
    })

    const titleText = isEdit ? `Editar Etapa: ${step?.title}` : `Adicionar Nova Etapa (${lessonSequence}º)`

    return (
        <Modal show={show} onHide={handleClose} size='lg' centered>
            <Modal.Header closeButton className='bg-dark text-white border-0' style={{ backgroundColor: '#1e1e2d' }}>
                <Modal.Title className='text-white'>{titleText}</Modal.Title>
            </Modal.Header>
            <Modal.Body className='bg-dark' style={{ backgroundColor: '#2b2b35' }}>
                <form className='form' onSubmit={formik.handleSubmit} noValidate>
                    <div className='row mb-5'>
                        
                        {/* Campo Apelido/Título */}
                        <div className='col-md-6 fv-row mb-5'>
                            <label className='form-label required text-white'>Apelido/Título</label>
                            <input
                                type='text'
                                className='form-control form-control-solid'
                                placeholder='Ex: Quiz Básico de Verbos'
                                {...formik.getFieldProps('title')}
                            />
                            {formik.touched.title && formik.errors.title && (
                                <div className='fv-plugins-message-container'>
                                    <div className='fv-help-block'>{formik.errors.title}</div>
                                </div>
                            )}
                        </div>

                        {/* Campo Tipo/Conteúdo */}
                        <div className='col-md-6 fv-row mb-5'>
                            <label className='form-label required text-white'>Tipo da Etapa (Para saber mais, Atividade, etc.)</label>
                            <input
                                type='text'
                                className='form-control form-control-solid'
                                placeholder='Ex: Atividade, Conteúdo, Quiz'
                                {...formik.getFieldProps('type')}
                            />
                            {formik.touched.type && formik.errors.type && (
                                <div className='fv-plugins-message-container'>
                                    <div className='fv-help-block'>{formik.errors.type}</div>
                                </div>
                            )}
                        </div>

                        {/* Campo Sequência */}
                        <div className='col-md-4 fv-row mb-5'>
                            <label className='form-label required text-white'>Sequência</label>
                            <input
                                type='number'
                                className='form-control form-control-solid'
                                {...formik.getFieldProps('sequence')}
                            />
                            {formik.touched.sequence && formik.errors.sequence && (
                                <div className='fv-plugins-message-container'>
                                    <div className='fv-help-block'>{formik.errors.sequence}</div>
                                </div>
                            )}
                        </div>
                        
                        {/* Campo Personagem */}
                        <div className='col-md-4 fv-row mb-5'>
                            <label className='form-label required text-white'>Personagem</label>
                            <select
                                className='form-select form-select-solid'
                                {...formik.getFieldProps('character')}
                            >
                                <option value=''>Selecione o Personagem</option>
                                <option value='Professor'>Professor</option>
                                <option value='Aluno-Guia'>Aluno-Guia</option>
                                <option value='Assistente'>Assistente</option>
                            </select>
                            {formik.touched.character && formik.errors.character && (
                                <div className='fv-plugins-message-container'>
                                    <div className='fv-help-block'>{formik.errors.character}</div>
                                </div>
                            )}
                        </div>

                        {/* Checkbox Ativo */}
                        <div className='col-md-4 fv-row mb-5 pt-10'>
                            <div className='form-check form-check-custom form-check-solid'>
                                <input
                                    className='form-check-input'
                                    type='checkbox'
                                    id='active'
                                    checked={formik.values.active}
                                    {...formik.getFieldProps('active')}
                                />
                                <label className='form-check-label text-white' htmlFor='active'>
                                    Está Ativo?
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Campo Sugestões (Textarea) */}
                    <div className='fv-row mb-5'>
                        <label className='form-label text-white'>Sugestões</label>
                        <textarea
                            className='form-control form-control-solid'
                            rows={3}
                            placeholder='Sugestões de conteúdo ou links...'
                            {...formik.getFieldProps('suggestion')}
                        />
                        {formik.touched.suggestion && formik.errors.suggestion && (
                            <div className='fv-plugins-message-container'>
                                <div className='fv-help-block'>{formik.errors.suggestion}</div>
                            </div>
                        )}
                    </div>
                    
                    <div className='text-end pt-5'>
                        <button
                            type='button'
                            className='btn btn-light me-3'
                            onClick={handleClose}
                            disabled={formik.isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type='submit'
                            className='btn btn-primary'
                            disabled={formik.isSubmitting || !formik.isValid || !formik.touched}
                        >
                            <span className='indicator-label'>
                                {formik.isSubmitting ? 'Salvando...' : (isEdit ? 'Salvar Edição' : 'Adicionar Etapa')}
                            </span>
                        </button>
                    </div>
                </form>
            </Modal.Body>
        </Modal>
    )
}

export default StepModal