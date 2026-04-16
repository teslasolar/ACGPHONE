import type { Chain, User } from '../types';

interface HeaderProps {
  chain: Chain;
  users: User[];
  currentUser: User;
}

export function Header({ chain, users, currentUser }: HeaderProps) {
  const chainUsers = chain.users
    .map((uid) => users.find((u) => u.id === uid))
    .filter(Boolean) as User[];

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="logo">
          <span className="logo-icon">🧬</span>
          <span>ACG-TEL</span>
        </h1>
        <span className="header-subtitle">和</span>
      </div>

      <div className="header-chain">
        <span className="chain-label">🔗 {chain.name}</span>
        <div className="chain-users">
          {chainUsers.map((user, i) => (
            <span key={user.id} className="chain-user-badge">
              <span
                className="user-dot"
                style={{ background: user.color }}
              />
              <span className={user.id === currentUser.id ? 'current-user' : ''}>
                {user.name}
              </span>
              {i < chainUsers.length - 1 && <span className="chain-arrow">→</span>}
            </span>
          ))}
        </div>
      </div>

      <div className="header-right">
        <span className="free-badge">💰 $0 · Free</span>
      </div>
    </header>
  );
}
