import type { Stage, StageId } from './types';
export type { Stage };

export const STAGES: Stage[] = [
  {
    id: 'red',
    name: 'Question',
    emoji: '🟥',
    icon: '❓',
    color: '#ef4444',
    bgColor: '#dc2626',
    lightBg: '#fef2f2',
  },
  {
    id: 'orange',
    name: 'Brainstorm',
    emoji: '🟧',
    icon: '⊕',
    color: '#f97316',
    bgColor: '#ea580c',
    lightBg: '#fff7ed',
  },
  {
    id: 'yellow',
    name: 'Analyze',
    emoji: '🟨',
    icon: '🧬',
    color: '#eab308',
    bgColor: '#ca8a04',
    lightBg: '#fefce8',
  },
  {
    id: 'green',
    name: 'Solve',
    emoji: '🟩',
    icon: '✦',
    color: '#22c55e',
    bgColor: '#16a34a',
    lightBg: '#f0fdf4',
  },
  {
    id: 'blue',
    name: 'Build',
    emoji: '🟦',
    icon: '⚙️',
    color: '#3b82f6',
    bgColor: '#2563eb',
    lightBg: '#eff6ff',
  },
  {
    id: 'purple',
    name: 'Measure',
    emoji: '🟪',
    icon: '📐',
    color: '#a855f7',
    bgColor: '#9333ea',
    lightBg: '#faf5ff',
  },
  {
    id: 'white',
    name: 'Review',
    emoji: '⬜',
    icon: '🔁',
    color: '#6b7280',
    bgColor: '#4b5563',
    lightBg: '#f9fafb',
  },
];

export const STAGE_MAP = new Map<StageId, Stage>(
  STAGES.map((s) => [s.id, s])
);

export function getNextStage(current: StageId): StageId {
  const idx = STAGES.findIndex((s) => s.id === current);
  return STAGES[(idx + 1) % STAGES.length].id;
}
