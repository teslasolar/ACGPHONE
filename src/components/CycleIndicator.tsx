import { STAGES } from '../stages';

export function CycleIndicator() {
  return (
    <div className="cycle-indicator">
      {STAGES.map((stage, i) => (
        <span key={stage.id} className="cycle-item">
          <span
            className="cycle-dot"
            style={{ background: stage.color }}
            title={stage.name}
          >
            {stage.icon}
          </span>
          {i < STAGES.length - 1 && <span className="cycle-arrow">→</span>}
        </span>
      ))}
      <span className="cycle-arrow">→</span>
      <span
        className="cycle-dot"
        style={{ background: STAGES[0].color }}
        title="Cycle back"
      >
        🔁
      </span>
    </div>
  );
}
