import React, { FC, useState, useEffect } from 'react' // Importa useEffect
import { Modal } from 'react-bootstrap'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import clsx from 'clsx'

// Tipagem simplificada para a Opção de Resposta
interface AnswerOption {
    id: number
    image: string // URL da Imagem da Opção
    text: string
    isCorrect: boolean
}

// Tipagem da Questão (Atividade)
interface Question {
    id: number
    activityType: string // Pergunta, Leitura, etc.
    sequence: number
    questionType: string // Escolha Única, Múltipla, etc.
    weight: number // Peso da pergunta
    isActive: boolean
    contentImage: string // Imagem do Conteúdo
    description: string
    comments: string // Comentários do professor regente
    options: AnswerOption[]
    shuffleAnswers: boolean
    alwaysCorrect: boolean
}

// Props do Modal
interface QuestionModalProps {
    show: boolean
    handleClose: () => void
    question: Question | null // null para criação, Question para edição
    onSave: (question: Question) => void
    stepTitle: string
}

// Esquema de validação simples
const questionSchema = Yup.object().shape({
    activityType: Yup.string().required('Atividade é obrigatória'),
    questionType: Yup.string().required('Tipo de questão é obrigatório'),
    description: Yup.string().required('Descrição é obrigatória'),
    sequence: Yup.number().min(1, 'A sequência deve ser no mínimo 1').required('Sequência é obrigatória'),
})

// Valor inicial padrão para novas questões
const defaultInitialValues: Question = {
    id: Date.now(),
    activityType: 'Pergunta',
    sequence: 1,
    questionType: 'Escolha Única',
    weight: 1,
    isActive: true,
    contentImage: '',
    description: '',
    comments: '',
    options: [],
    shuffleAnswers: false,
    alwaysCorrect: false
}

const LessonQuestionModal: FC<QuestionModalProps> = ({ show, handleClose, question, onSave, stepTitle }) => {
    const isEdit = question !== null
    
    // 1. Estado Local para as Opções de Resposta
    const [answerOptions, setAnswerOptions] = useState<AnswerOption[]>([]);
    
    // 2. Formik com valores iniciais para campos principais (sem as options)
    const formik = useFormik<Question>({
        initialValues: question || defaultInitialValues,
        validationSchema: questionSchema,
        enableReinitialize: true,
        onSubmit: (values, { setSubmitting }) => {
            // 3. Integra o estado local das opções na submissão
            const finalQuestion: Question = { ...values, options: answerOptions };
            onSave(finalQuestion);
            setSubmitting(false);
            // handleClose é chamado em LessonStepPage após o onSave, mas vamos limpá-lo aqui também para ser seguro
            // formik.resetForm(); // Descomente se onSave NÃO fecha o modal
        },
    });

    // 4. Efeito para sincronizar answerOptions quando 'question' (prop) muda
    useEffect(() => {
        if (question) {
            // Edição: Usa as opções existentes
            setAnswerOptions(question.options && question.options.length > 0
                ? question.options
                : [{ id: Date.now(), image: '', text: '', isCorrect: false }] // Garante 1 opção para edição vazia
            );
        } else {
            // Criação: Reseta para 1 opção vazia
            setAnswerOptions([{ id: Date.now(), image: '', text: '', isCorrect: false }]);
        }
    }, [question]); // Depende da prop question

    // 5. Handler de Fechamento que reseta o formulário
    const handleModalClose = () => {
        formik.resetForm();
        setAnswerOptions([]); // Limpa as opções
        handleClose();
    }
    
    // Handlers de Opções (permanecem os mesmos)
    const handleAddOption = () => {
        setAnswerOptions([...answerOptions, { id: Date.now(), image: '', text: '', isCorrect: false }]);
    };

    const handleRemoveOption = (id: number) => {
        if (answerOptions.length > 1) {
            setAnswerOptions(answerOptions.filter(opt => opt.id !== id));
        }
    };

    const handleUpdateOption = (id: number, key: keyof AnswerOption, value: any) => {
        setAnswerOptions(answerOptions.map(opt => 
            opt.id === id ? { ...opt, [key]: value } : opt
        ));
    };

    const titleText = isEdit ? `Editar Questão para Etapa: ${stepTitle}` : `Criar Questão para Etapa: ${stepTitle}`

    return (
        <Modal show={show} onHide={handleModalClose} size='xl' centered scrollable backdrop='static'>
            {/* CABEÇALHO ESCURO com a cor base do tema */}
            <Modal.Header closeButton className='border-0' style={{ backgroundColor: '#1e1e2d' }}>
                <Modal.Title className='text-white fs-3'>{titleText}</Modal.Title>
            </Modal.Header>
            
            {/* CORPO ESCURO com a cor do fundo do card */}
            <Modal.Body className='p-8' style={{ backgroundColor: '#2b2b35' }}>
                <form className='form' onSubmit={formik.handleSubmit} noValidate>
                    
                    {/* Linha 1: Configurações Básicas */}
                    <div className='row mb-8 g-5 align-items-end'>
                        {/* Atividade (Select) */}
                        <div className='col-md-3 fv-row'>
                            <label className='form-label required text-white'>Atividade</label>
                            <select className='form-select form-select-solid' {...formik.getFieldProps('activityType')}>
                                <option value='Pergunta'>Pergunta</option>
                                <option value='Conteúdo'>Conteúdo</option>
                            </select>
                        </div>
                        {/* Sequência (Input) */}
                        <div className='col-md-3 fv-row'>
                            <label className='form-label required text-white'>Sequência</label>
                            <input type='number' className='form-control form-control-solid' {...formik.getFieldProps('sequence')} />
                            {formik.touched.sequence && formik.errors.sequence && (<div className='fv-help-block text-danger'>{formik.errors.sequence}</div>)}
                        </div>
                        {/* Tipo de Pergunta (Select) */}
                        <div className='col-md-3 fv-row'>
                            <label className='form-label required text-white'>Tipo de pergunta</label>
                            <select className='form-select form-select-solid' {...formik.getFieldProps('questionType')}>
                                <option value='Escolha Única'>Escolha Única</option>
                                <option value='Múltipla Escolha'>Múltipla Escolha</option>
                            </select>
                        </div>
                        {/* Peso (Input) */}
                        <div className='col-md-2 fv-row'>
                            <label className='form-label text-white'>Peso</label>
                            <input type='number' className='form-control form-control-solid' {...formik.getFieldProps('weight')} />
                        </div>
                        {/* Ativo (Switch) */}
                        <div className='col-md-1 fv-row pt-8'>
                            <label className='form-check form-switch form-check-custom form-check-solid'>
                                <input className='form-check-input' type='checkbox' id='isActive' {...formik.getFieldProps('isActive')} checked={formik.values.isActive} />
                                <span className='form-check-label text-white'>Ativo</span>
                            </label>
                        </div>
                    </div>
                    
                    {/* Bloco de Imagem e Opções de Configuração */}
                    <div className='card card-body mb-8' style={{ backgroundColor: '#1e1e2d' }}>
                        <div className='row g-5 align-items-center'>
                            <div className='col-md-8'>
                                <label className='form-label text-white'>Imagem do Conteúdo</label>
                                {/* Placeholder de Upload no tema escuro */}
                                <input type='text' className='form-control form-control-solid' {...formik.getFieldProps('contentImage')} placeholder='URL da Imagem' />
                            </div>
                            <div className='col-md-4 d-flex flex-column justify-content-center pt-5 pt-md-0'>
                                <div className='form-check form-check-custom form-check-solid mb-3'>
                                    <input className='form-check-input' type='checkbox' id='shuffleAnswers' {...formik.getFieldProps('shuffleAnswers')} checked={formik.values.shuffleAnswers} />
                                    <label className='form-check-label text-white' htmlFor='shuffleAnswers'>
                                        Misturar Respostas
                                    </label>
                                </div>
                                <div className='form-check form-check-custom form-check-solid'>
                                    <input className='form-check-input' type='checkbox' id='alwaysCorrect' {...formik.getFieldProps('alwaysCorrect')} checked={formik.values.alwaysCorrect} />
                                    <label className='form-check-label text-white' htmlFor='alwaysCorrect'>
                                        A questão estará sempre correta?
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Descrição da Atividade e Comentários (Textareas) */}
                    <div className='fv-row mb-8'>
                        <label className='form-label required text-white'>Descrição da Atividade</label>
                        <textarea className='form-control form-control-solid' rows={3} {...formik.getFieldProps('description')} />
                        {formik.touched.description && formik.errors.description && (<div className='fv-help-block text-danger'>{formik.errors.description}</div>)}
                    </div>
                    
                    <div className='fv-row mb-8'>
                        <label className='form-label text-white'>Comentários (Espaço do Prof. Regente)</label>
                        <textarea className='form-control form-control-solid' rows={5} {...formik.getFieldProps('comments')} placeholder='Comentários e feedback para o professor regente...' />
                    </div>

                    {/* Bloco de Respostas/Opções - Tabela em Dark Mode */}
                    <div className='card card-body shadow-sm border border-dashed' style={{ backgroundColor: '#1e1e2d', borderColor: '#3a3a48' }}>
                        <h4 className='mb-5 text-white'>Opções de Resposta ({formik.values.questionType})</h4>
                        <div className='table-responsive'>
                            <table className='table table-row-bordered table-rounded gs-7'>
                                <thead>
                                    {/* Cabeçalho da tabela de opções */}
                                    <tr className='fw-bold fs-6 text-gray-400 bg-dark-700' style={{ backgroundColor: '#1e1e2d' }}>
                                        <th className='w-50px text-white'>#</th>
                                        <th className='w-100px text-white'>Imagem</th>
                                        <th className='text-white'>Opção de resposta</th>
                                        <th className='w-120px text-center text-white'>Resposta correta?</th>
                                        <th className='w-50px text-white'>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {answerOptions.map((opt, index) => (
                                        <tr key={opt.id} className='text-white'>
                                            <td>{index + 1}</td>
                                            <td>
                                                {/* Placeholder Imagem Opção */}
                                                <div className='p-2 rounded d-flex align-items-center justify-content-center' style={{height: '50px', backgroundColor: '#2b2b35', border: '1px solid #3a3a48'}}>
                                                    <i className='ki-duotone ki-picture fs-3 text-gray-600'></i>
                                                </div>
                                            </td>
                                            <td>
                                                <input 
                                                    type='text' 
                                                    className='form-control form-control-sm form-control-solid' 
                                                    value={opt.text} 
                                                    onChange={(e) => handleUpdateOption(opt.id, 'text', e.target.value)}
                                                    required // Adiciona validação nativa para texto
                                                />
                                            </td>
                                            <td className='text-center'>
                                                <div className='form-check form-check-custom form-check-solid d-inline-block'>
                                                    <input 
                                                        className='form-check-input' 
                                                        type='checkbox' 
                                                        checked={opt.isCorrect} 
                                                        onChange={(e) => handleUpdateOption(opt.id, 'isCorrect', e.target.checked)}
                                                    />
                                                </div>
                                            </td>
                                            <td>
                                                <button 
                                                    type='button' 
                                                    className='btn btn-icon btn-sm btn-light-danger' 
                                                    onClick={() => handleRemoveOption(opt.id)}
                                                    disabled={answerOptions.length === 1} // Não permite remover a última opção
                                                >
                                                    <i className='ki-duotone ki-trash fs-5'></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button type='button' className='btn btn-light-info btn-sm mt-3' onClick={handleAddOption}>
                                <i className='ki-duotone ki-plus fs-5'></i> Adicionar Opção
                            </button>
                        </div>
                    </div>


                    <div className='text-end pt-10'>
                        <button type='button' className='btn btn-light me-3' onClick={handleModalClose}>
                            Cancelar
                        </button>
                        {/* O botão de submit checa se o formulário Formik é válido */}
                        <button type='submit' className='btn btn-primary' disabled={formik.isSubmitting || !formik.isValid}>
                            <span className='indicator-label'>
                                {formik.isSubmitting ? 'Salvando...' : (isEdit ? 'Salvar e Voltar' : 'Criar Questão')}
                            </span>
                        </button>
                    </div>
                </form>
            </Modal.Body>
        </Modal>
    )
}

export default LessonQuestionModal