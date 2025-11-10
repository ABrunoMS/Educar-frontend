import React, { FC } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { createQuest, createQuestStep } from '@services/Lesson';
import { Quest, QuestStep } from '@interfaces/Lesson';

type Props = {
  onSuccess?: () => void;
};

// Schema de validação para Quest
const questSchema = Yup.object().shape({
  Name: Yup.string().required('Nome da aula é obrigatório'),
  Description: Yup.string().required('Descrição é obrigatória'),
  UsageTemplate: Yup.string().required('Template é obrigatório'),
  Type: Yup.string().required('Tipo é obrigatório'),
  MaxPlayers: Yup.number().min(1).required('Máximo de jogadores é obrigatório'),
  TotalQuestSteps: Yup.number().min(1).required('Total de etapas é obrigatório'),
  CombatDifficulty: Yup.string().required('Dificuldade é obrigatória'),
});

const CreateLessonForm: FC<Props> = ({ onSuccess }) => {
  const formik = useFormik<Quest>({
    initialValues: {
      Name: '',
      Description: '',
      UsageTemplate: 'Global',
      Type: 'SinglePlayer',
      MaxPlayers: 2,
      TotalQuestSteps: 1,
      CombatDifficulty: 'Passive',
    },
    validationSchema: questSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        setSubmitting(true);
        
        // 1. Criar a Quest (aula)
        const questResponse = await createQuest(values);
        const questId = questResponse.data.id;

        // 2. Criar uma etapa de exemplo
        const questStepData: QuestStep = {
          name: `Etapa 1 - ${values.Name}`,
          description: 'Etapa inicial da aula',
          order: 1,
          npcType: 'Passive',
          npcBehaviour: 'StandStill',
          questStepType: 'Npc',
          questId: questId,
          contents: [
            {
              questStepContentType: 'Exercise',
              questionType: 'MultipleChoice',
              description: 'Questão de exemplo',
              weight: 10.0,
              expectedAnswers: {
                questionType: 'MultipleChoice',
                options: [
                  {
                    description: 'Opção A',
                    is_correct: false,
                  },
                  {
                    description: 'Opção B',
                    is_correct: true,
                  },
                  {
                    description: 'Opção C',
                    is_correct: false,
                  },
                ],
              },
            },
          ],
        };

        await createQuestStep(questStepData);

        alert('Aula criada com sucesso!');
        resetForm();
        if (onSuccess) onSuccess();
      } catch (error) {
        console.error('Erro ao criar aula:', error);
        alert('Erro ao criar aula. Tente novamente.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="form">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Criar Nova Aula</h3>
        </div>
        <div className="card-body">
          <div className="row">
            {/* Nome da Aula */}
            <div className="col-md-6 mb-7">
              <label className="form-label required">Nome da Aula</label>
              <input
                type="text"
                className="form-control"
                placeholder="Digite o nome da aula"
                {...formik.getFieldProps('Name')}
              />
              {formik.touched.Name && formik.errors.Name && (
                <div className="text-danger">{formik.errors.Name}</div>
              )}
            </div>

            {/* Descrição */}
            <div className="col-md-6 mb-7">
              <label className="form-label required">Descrição</label>
              <input
                type="text"
                className="form-control"
                placeholder="Digite a descrição"
                {...formik.getFieldProps('Description')}
              />
              {formik.touched.Description && formik.errors.Description && (
                <div className="text-danger">{formik.errors.Description}</div>
              )}
            </div>

            {/* Template */}
            <div className="col-md-6 mb-7">
              <label className="form-label required">Template</label>
              <select className="form-control" {...formik.getFieldProps('UsageTemplate')}>
                <option value="Global">Global</option>
                <option value="Local">Local</option>
              </select>
            </div>

            {/* Tipo */}
            <div className="col-md-6 mb-7">
              <label className="form-label required">Tipo</label>
              <select className="form-control" {...formik.getFieldProps('Type')}>
                <option value="SinglePlayer">SinglePlayer</option>
                <option value="MultiPlayer">MultiPlayer</option>
              </select>
            </div>

            {/* Max Players */}
            <div className="col-md-6 mb-7">
              <label className="form-label required">Máximo de Jogadores</label>
              <input
                type="number"
                className="form-control"
                min="1"
                {...formik.getFieldProps('MaxPlayers')}
              />
            </div>

            {/* Total de Etapas */}
            <div className="col-md-6 mb-7">
              <label className="form-label required">Total de Etapas</label>
              <input
                type="number"
                className="form-control"
                min="1"
                {...formik.getFieldProps('TotalQuestSteps')}
              />
            </div>

            {/* Dificuldade */}
            <div className="col-md-6 mb-7">
              <label className="form-label required">Dificuldade de Combate</label>
              <select className="form-control" {...formik.getFieldProps('CombatDifficulty')}>
                <option value="Passive">Passive</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
        </div>
        <div className="card-footer">
          <div className="d-flex justify-content-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? 'Criando...' : 'Criar Aula'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreateLessonForm;