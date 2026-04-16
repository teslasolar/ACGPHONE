import { useState } from 'react';
import type { Card as CardType, StageId, User } from '../types';
import type { Stage } from '../stages';
import { STAGE_MAP, getNextStage } from '../stages';
import { CardItem } from './CardItem';

interface StageColumnProps {
  stage: Stage;
  cards: CardType[];
  users: User[];
  onMoveCard: (cardId: string, toStage: StageId) => void;
  onToggleTag: (cardId: string, tag: StageId) => void;
  onUpdateMetrics: (cardId: string, metrics: CardType['metrics']) => void;
  onDeleteCard: (cardId: string) => void;
  onAddCard?: (title: string, description: string) => void;
}

export function StageColumn({
  stage,
  cards,
  users,
  onMoveCard,
  onToggleTag,
  onUpdateMetrics,
  onDeleteCard,
  onAddCard,
}: StageColumnProps) {
  const [dragOver, setDragOver] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const cardId = e.dataTransfer.getData('text/plain');
    if (cardId) {
      onMoveCard(cardId, stage.id);
    }
  }

  function handleAdd() {
    if (newTitle.trim() && onAddCard) {
      onAddCard(newTitle.trim(), '');
      setNewTitle('');
      setShowAdd(false);
    }
  }

  const nextStage = STAGE_MAP.get(getNextStage(stage.id));

  return (
    <div
      className={`stage-column ${dragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="stage-header" style={{ borderTopColor: stage.color }}>
        <div className="stage-title-row">
          <span className="stage-icon">{stage.icon}</span>
          <span className="stage-name">{stage.name}</span>
          <span className="stage-count">{cards.length}</span>
        </div>
        <div className="stage-cycle">
          {stage.emoji} → {nextStage?.emoji}
        </div>
      </div>

      <div className="stage-cards">
        {cards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            stage={stage}
            users={users}
            onMove={onMoveCard}
            onToggleTag={onToggleTag}
            onUpdateMetrics={onUpdateMetrics}
            onDelete={onDeleteCard}
          />
        ))}

        {stage.id === 'red' && (
          <div className="add-card-area">
            {showAdd ? (
              <div className="add-card-form">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder="What's the question?"
                  className="add-card-input"
                  autoFocus
                />
                <div className="add-card-actions">
                  <button className="btn btn-primary" onClick={handleAdd}>
                    Add
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={() => setShowAdd(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="btn btn-add"
                onClick={() => setShowAdd(true)}
              >
                + Add Question
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
