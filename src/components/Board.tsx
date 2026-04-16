import type { Card, StageId, User } from '../types';
import { STAGES } from '../stages';
import { StageColumn } from './StageColumn';

interface BoardProps {
  cards: Card[];
  users: User[];
  onMoveCard: (cardId: string, toStage: StageId) => void;
  onToggleTag: (cardId: string, tag: StageId) => void;
  onUpdateMetrics: (cardId: string, metrics: Card['metrics']) => void;
  onDeleteCard: (cardId: string) => void;
  onAddCard: (title: string, description: string) => void;
}

export function Board({
  cards,
  users,
  onMoveCard,
  onToggleTag,
  onUpdateMetrics,
  onDeleteCard,
  onAddCard,
}: BoardProps) {
  return (
    <div className="board">
      {STAGES.map((stage) => (
        <StageColumn
          key={stage.id}
          stage={stage}
          cards={cards.filter((c) => c.stage === stage.id)}
          users={users}
          onMoveCard={onMoveCard}
          onToggleTag={onToggleTag}
          onUpdateMetrics={onUpdateMetrics}
          onDeleteCard={onDeleteCard}
          onAddCard={stage.id === 'red' ? onAddCard : undefined}
        />
      ))}
    </div>
  );
}
