import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { KTCard } from '@metronic/helpers';
import { ToolbarWrapper } from '@metronic/layout/components/toolbar';
import { Content } from '@metronic/layout/components/content';
import { GameCreateForm } from '../game-create/components/GameCreateForm';
import { getGameById } from '@services/Games';
import { toast } from 'react-toastify';
import { Game } from '@interfaces/Game';

const GameEdit = () => {
  const [game, setGame] = useState<Game>();

  const { id } = useParams();

  useEffect(() => {
    if (id) {
      getGameById(id)
        .then((response) => {
          setGame(response.data);
        })
        .catch((error) => {
          toast.error(`Erro ao recuperar dados no servidor: ${error}`);
        });
    }
  }, []);

  return (
    <>
      <KTCard className='p-5 h-100'>
        {game ? (
          <GameCreateForm game={game} editMode />
        ) : (
          <div>
            <span className='indicator-progress'>
              Carregando...{' '}
              <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
            </span>
          </div>
        )}
      </KTCard>
    </>
  );
};

const GameEditWrapper = () => (
  <div>
    <ToolbarWrapper />
    <Content>
      <GameEdit />
    </Content>
  </div>
);

export { GameEditWrapper };