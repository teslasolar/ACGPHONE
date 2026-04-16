import { useState, useCallback } from 'react';
import type { Card, ChatMessage, User, Chain, StageId } from './types';

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

const DEMO_USERS: User[] = [
  { id: 'u1', name: 'You', color: '#3b82f6' },
  { id: 'u2', name: 'Kai', color: '#22c55e' },
  { id: 'u3', name: 'Mika', color: '#a855f7' },
];

const DEMO_CARDS: Card[] = [
  {
    id: 'c1',
    title: 'How to reduce notification latency?',
    description: 'Users report delays in chain notifications',
    stage: 'red',
    tags: ['red', 'blue'],
    createdBy: 'u1',
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'c2',
    title: 'Batch notifications by priority',
    description: 'Group low-priority notifications into digests',
    stage: 'orange',
    tags: ['orange'],
    createdBy: 'u2',
    createdAt: Date.now() - 2400000,
  },
  {
    id: 'c3',
    title: 'Analyze message delivery patterns',
    description: 'Study timing and frequency of chain messages',
    stage: 'yellow',
    tags: ['yellow', 'green'],
    createdBy: 'u3',
    createdAt: Date.now() - 1800000,
    metrics: { effort: 3, timeEstimate: '2 days', score: 7 },
  },
  {
    id: 'c4',
    title: 'WebSocket real-time pipeline',
    description: 'Replace polling with persistent connections',
    stage: 'green',
    tags: ['green', 'blue'],
    createdBy: 'u1',
    createdAt: Date.now() - 1200000,
  },
  {
    id: 'c5',
    title: 'Build push notification service',
    description: 'Implement service worker for background delivery',
    stage: 'blue',
    tags: ['blue'],
    createdBy: 'u2',
    createdAt: Date.now() - 600000,
    metrics: { effort: 5, timeEstimate: '1 week', score: 9 },
  },
];

const DEMO_MESSAGES: ChatMessage[] = [
  { id: 'm1', text: 'Team, let\'s focus on the latency issue today', userId: 'u1', timestamp: Date.now() - 60000 },
  { id: 'm2', text: 'I have some data on delivery patterns', userId: 'u3', timestamp: Date.now() - 30000 },
  { id: 'm3', text: 'Great, let\'s analyze and move forward', userId: 'u2', timestamp: Date.now() - 10000 },
];

const DEMO_CHAIN: Chain = {
  id: 'chain1',
  name: 'Notification Team',
  users: ['u1', 'u2', 'u3'],
  cards: ['c1', 'c2', 'c3', 'c4', 'c5'],
};

export function useStore() {
  const [users] = useState<User[]>(DEMO_USERS);
  const [cards, setCards] = useState<Card[]>(DEMO_CARDS);
  const [messages, setMessages] = useState<ChatMessage[]>(DEMO_MESSAGES);
  const [chains] = useState<Chain[]>([DEMO_CHAIN]);
  const currentUser = users[0];

  const addCard = useCallback((title: string, description: string) => {
    const card: Card = {
      id: generateId(),
      title,
      description,
      stage: 'red',
      tags: ['red'],
      createdBy: currentUser.id,
      createdAt: Date.now(),
    };
    setCards((prev) => [...prev, card]);
    return card;
  }, [currentUser.id]);

  const moveCard = useCallback((cardId: string, toStage: StageId) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, stage: toStage } : c))
    );
  }, []);

  const updateCardMetrics = useCallback(
    (cardId: string, metrics: Card['metrics']) => {
      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, metrics } : c))
      );
    },
    []
  );

  const toggleTag = useCallback((cardId: string, tag: StageId) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== cardId) return c;
        const tags = c.tags.includes(tag)
          ? c.tags.filter((t) => t !== tag)
          : [...c.tags, tag];
        return { ...c, tags };
      })
    );
  }, []);

  const addMessage = useCallback(
    (text: string, cardId?: string) => {
      const msg: ChatMessage = {
        id: generateId(),
        text,
        userId: currentUser.id,
        timestamp: Date.now(),
        cardId,
      };
      setMessages((prev) => [...prev, msg]);
      return msg;
    },
    [currentUser.id]
  );

  const deleteCard = useCallback((cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
  }, []);

  return {
    users,
    cards,
    messages,
    chains,
    currentUser,
    addCard,
    moveCard,
    updateCardMetrics,
    toggleTag,
    addMessage,
    deleteCard,
  };
}
