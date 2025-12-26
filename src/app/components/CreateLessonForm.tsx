import React, { FC, useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { createQuest, createQuestStep, getAllProducts, getCompatibleContents } from '@services/Lesson';
import { QuestStep, ProductDto, ContentDto } from '@interfaces/Lesson';

type Props = {
  onSuccess?: () => void;
};

// Tipo para o formulário de criação de Quest
interface QuestFormValues {
  name: string;
  description: string;
  usageTemplate: string;
  type: string;
  maxPlayers: number;
  combatDifficulty: string;
  productId: string;
  contentId: string;
}

// Schema de validação para Quest
const questSchema = Yup.object().shape({
  name: Yup.string().required('Nome da aula é obrigatório'),
  description: Yup.string().required('Descrição é obrigatória'),
  usageTemplate: Yup.string().required('Template é obrigatório'),
  type: Yup.string().required('Tipo é obrigatório'),
  maxPlayers: Yup.number().min(1).required('Máximo de jogadores é obrigatório'),
  combatDifficulty: Yup.string().required('Dificuldade é obrigatória'),
  productId: Yup.string().required('Produto é obrigatório'),
  contentId: Yup.string().required('Conteúdo é obrigatório'),
});

const CreateLessonForm: FC<Props> = ({ onSuccess }) => {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [contents, setContents] = useState<ContentDto[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingContents, setLoadingContents] = useState(false);

  // Carregar produtos ao montar o componente
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getAllProducts();
        setProducts(response.data || []);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  const formik = useFormik<QuestFormValues>({
    initialValues: {
      name: '',
      description: '',
      usageTemplate: 'Global',
      type: 'SinglePlayer',
      maxPlayers: 2,
      combatDifficulty: 'Passive',
      productId: '',
      contentId: '',
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
          name: `Etapa 1 - ${values.name}`,
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
                {...formik.getFieldProps('name')}
              />
              {formik.touched.name && formik.errors.name && (
                <div className="text-danger">{formik.errors.name}</div>
              )}
            </div>

            {/* Descrição */}
            <div className="col-md-6 mb-7">
              <label className="form-label required">Descrição</label>
              <input
                type="text"
                className="form-control"
                placeholder="Digite a descrição"
                {...formik.getFieldProps('description')}
              />
              {formik.touched.description && formik.errors.description && (
                <div className="text-danger">{formik.errors.description}</div>
              )}
            </div>

            {/* Template */}
            <div className="col-md-6 mb-7">
              <label className="form-label required">Template</label>
              <select className="form-control" {...formik.getFieldProps('usageTemplate')}>
                <option value="Global">Global</option>
                <option value="Local">Local</option>
              </select>
            </div>

            {/* Tipo */}
            <div className="col-md-6 mb-7">
              <label className="form-label required">Tipo</label>
              <select className="form-control" {...formik.getFieldProps('type')}>
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
                {...formik.getFieldProps('maxPlayers')}
              />
            </div>

            {/* Dificuldade */}
            <div className="col-md-6 mb-7">
              <label className="form-label required">Dificuldade de Combate</label>
              <select className="form-control" {...formik.getFieldProps('combatDifficulty')}>
                <option value="Passive">Passive</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Produto */}
            <div className="col-md-6 mb-7">
              <label className="form-label required">Produto</label>
              <select
                className="form-control"
                {...formik.getFieldProps('productId')}
                onChange={async (e) => {
                  const productId = e.target.value;
                  formik.setFieldValue('productId', productId);
                  formik.setFieldValue('contentId', ''); // Limpar conteúdo ao trocar produto
                  setContents([]);
                  
                  if (productId) {
                    setLoadingContents(true);
                    try {
                      const contentList = await getCompatibleContents(productId);
                      setContents(contentList);
                    } catch (error) {
                      console.error('Erro ao carregar conteúdos:', error);
                    } finally {
                      setLoadingContents(false);
                    }
                  }
                }}
                disabled={loadingProducts}
              >
                <option value="">
                  {loadingProducts ? 'Carregando...' : 'Selecione um produto'}
                </option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              {formik.touched.productId && formik.errors.productId && (
                <div className="text-danger">{formik.errors.productId}</div>
              )}
            </div>

            {/* Conteúdo */}
            <div className="col-md-6 mb-7">
              <label className="form-label required">Conteúdo</label>
              <select
                className="form-control"
                {...formik.getFieldProps('contentId')}
                disabled={!formik.values.productId || loadingContents}
              >
                <option value="">
                  {loadingContents
                    ? 'Carregando...'
                    : !formik.values.productId
                    ? 'Selecione um produto primeiro'
                    : 'Selecione um conteúdo'}
                </option>
                {contents.map((content) => (
                  <option key={content.id} value={content.id}>
                    {content.name}
                  </option>
                ))}
              </select>
              {formik.touched.contentId && formik.errors.contentId && (
                <div className="text-danger">{formik.errors.contentId}</div>
              )}
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