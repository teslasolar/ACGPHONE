import { useState, useRef, useEffect } from 'react';
import type { ChatMessage, User } from '../types';

interface ChatProps {
  messages: ChatMessage[];
  users: User[];
  currentUser: User;
  onSend: (text: string) => void;
  onCreateCard: (title: string, description: string) => void;
}

export function Chat({
  messages,
  users,
  currentUser,
  onSend,
  onCreateCard,
}: ChatProps) {
  const [text, setText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (trimmed.startsWith('/card ')) {
      const title = trimmed.slice(6).trim();
      if (title) {
        onCreateCard(title, '');
        onSend(`Created card: "${title}"`);
      }
    } else {
      onSend(trimmed);
    }
    setText('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className={`chat-panel ${isOpen ? 'open' : 'closed'}`}>
      <button className="chat-toggle" onClick={() => setIsOpen(!isOpen)}>
        ☕ Chat {!isOpen && messages.length > 0 && `(${messages.length})`}
      </button>

      {isOpen && (
        <>
          <div className="chat-messages">
            {messages.map((msg) => {
              const user = users.find((u) => u.id === msg.userId);
              const isMe = msg.userId === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`chat-msg ${isMe ? 'mine' : ''}`}
                >
                  <div className="chat-msg-header">
                    <span
                      className="user-dot"
                      style={{ background: user?.color }}
                    />
                    <span className="chat-msg-name">{user?.name}</span>
                    <span className="chat-msg-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="chat-msg-text">{msg.text}</p>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-area">
            <div className="chat-hint">
              Type <code>/card Title</code> to create a card
            </div>
            <div className="chat-input-row">
              <textarea
                className="chat-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message the chain..."
                rows={1}
              />
              <button className="btn btn-primary chat-send" onClick={handleSend}>
                →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
