import { useStore } from './store';
import { Header } from './components/Header';
import { Board } from './components/Board';
import { Chat } from './components/Chat';
import { CycleIndicator } from './components/CycleIndicator';
import './App.css';

export default function App() {
  const store = useStore();
  const chain = store.chains[0];

  return (
    <div className="app">
      <Header
        chain={chain}
        users={store.users}
        currentUser={store.currentUser}
      />
      <CycleIndicator />
      <Board
        cards={store.cards}
        users={store.users}
        onMoveCard={store.moveCard}
        onToggleTag={store.toggleTag}
        onUpdateMetrics={store.updateCardMetrics}
        onDeleteCard={store.deleteCard}
        onAddCard={store.addCard}
      />
      <Chat
        messages={store.messages}
        users={store.users}
        currentUser={store.currentUser}
        onSend={store.addMessage}
        onCreateCard={store.addCard}
      />
    </div>
  );
}
