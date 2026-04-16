import { useState } from 'react';
import type { Card, StageId, User } from '../types';
import type { Stage } from '../stages';
import { STAGES, STAGE_MAP, getNextStage } from '../stages';

interface CardItemProps {
  card: Card;
  stage: Stage;
  users: User[];
  onMove: (cardId: string, toStage: StageId) => void;
  onToggleTag: (cardId: string, tag: StageId) => void;
  onUpdateMetrics: (cardId: string, metrics: Card['metrics']) => void;
  onDelete: (cardId: string) => void;
}

export function CardItem({
  card,
  stage,
  users,
  onMove,
  onToggleTag,
  onUpdateMetrics,
  onDelete,
}: CardItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const creator = users.find((u) => u.id === card.createdBy);
  const nextStageId = getNextStage(card.stage);
  const nextStage = STAGE_MAP.get(nextStageId);

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData('text/plain', card.id);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleAdvance() {
    onMove(card.id, nextStageId);
  }

  function handleCycleBack() {
    onMove(card.id, 'red');
  }

  function handleSaveMetrics(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    onUpdateMetrics(card.id, {
      effort: Number(form.get('effort')) || 0,
      timeEstimate: (form.get('time') as string) || '',
      score: Number(form.get('score')) || 0,
    });
    setShowMetrics(false);
  }

  const timeAgo = getTimeAgo(card.createdAt);

  return (
    <div
      className="card-item"
      draggable
      onDragStart={handleDragStart}
      style={{ borderLeftColor: stage.color }}
    >
      <div className="card-top" onClick={() => setExpanded(!expanded)}>
        <h4 className="card-title">{card.title}</h4>
        <span className="card-expand">{expanded ? '▾' : '▸'}</span>
      </div>

      <div className="card-tags">
        {card.tags.map((tag) => {
          const tagStage = STAGE_MAP.get(tag);
          return tagStage ? (
            <span
              key={tag}
              className="card-tag"
              style={{ background: tagStage.color }}
              title={tagStage.name}
            />
          ) : null;
        })}
      </div>

      {expanded && (
        <div className="card-expanded">
          {card.description && (
            <p className="card-desc">{card.description}</p>
          )}

          <div className="card-meta">
            <span className="card-creator">
              {creator && (
                <span className="user-dot" style={{ background: creator.color }} />
              )}
              {creator?.name}
            </span>
            <span className="card-time">{timeAgo}</span>
          </div>

          {card.metrics && (
            <div className="card-metrics">
              <span>⚙️ Effort: {card.metrics.effort}/10</span>
              <span>⏱️ {card.metrics.timeEstimate}</span>
              <span>📐 Score: {card.metrics.score}/10</span>
            </div>
          )}

          <div className="card-tag-editor">
            {STAGES.map((s) => (
              <button
                key={s.id}
                className={`tag-btn ${card.tags.includes(s.id) ? 'active' : ''}`}
                style={{
                  background: card.tags.includes(s.id) ? s.color : 'transparent',
                  borderColor: s.color,
                }}
                onClick={() => onToggleTag(card.id, s.id)}
                title={s.name}
              >
                {s.emoji}
              </button>
            ))}
          </div>

          <div className="card-actions">
            <button className="btn btn-sm" onClick={handleAdvance}>
              → {nextStage?.name}
            </button>
            {card.stage === 'white' && (
              <button className="btn btn-sm btn-cycle" onClick={handleCycleBack}>
                🔁 Cycle to Red
              </button>
            )}
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => setShowMetrics(!showMetrics)}
            >
              🧬
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => onDelete(card.id)}
            >
              ✕
            </button>
          </div>

          {showMetrics && (
            <form className="metrics-form" onSubmit={handleSaveMetrics}>
              <label>
                ⚙️ Effort (0-10)
                <input
                  type="number"
                  name="effort"
                  min={0}
                  max={10}
                  defaultValue={card.metrics?.effort ?? 5}
                />
              </label>
              <label>
                ⏱️ Time Estimate
                <input
                  type="text"
                  name="time"
                  defaultValue={card.metrics?.timeEstimate ?? ''}
                  placeholder="e.g. 2 days"
                />
              </label>
              <label>
                📐 Score (0-10)
                <input
                  type="number"
                  name="score"
                  min={0}
                  max={10}
                  defaultValue={card.metrics?.score ?? 5}
                />
              </label>
              <button type="submit" className="btn btn-sm btn-primary">
                Save 🧬
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function getTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
