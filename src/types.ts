export type StageId = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'white';

export interface Stage {
  id: StageId;
  name: string;
  emoji: string;
  icon: string;
  color: string;
  bgColor: string;
  lightBg: string;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  stage: StageId;
  tags: StageId[];
  createdBy: string;
  createdAt: number;
  metrics?: CardMetrics;
}

export interface CardMetrics {
  effort: number;
  timeEstimate: string;
  score: number;
}

export interface User {
  id: string;
  name: string;
  color: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  userId: string;
  timestamp: number;
  cardId?: string;
}

export interface Chain {
  id: string;
  name: string;
  users: string[];
  cards: string[];
}
