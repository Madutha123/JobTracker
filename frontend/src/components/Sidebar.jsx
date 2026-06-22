import { useNavigate } from 'react-router-dom';
import { useToast } from './Toast';

/* ── SVG Icons ─────────────────────────────────────────── */
function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function PlusCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export default function Sidebar({ activeTab }) {
  const navigate = useNavigate();
  const toast = useToast();

  /* Get user from localStorage */
  const userStr = localStorage.getItem('jt_user');
  const user = userStr ? JSON.parse(userStr) : { username: 'Candidate', email: 'hunter@jobtracker.com' };

  /* Format user initials for avatar */
  const getInitials = (name) => {
    if (!name) return 'C';
    const clean = name.trim();
    if (clean.includes(' ')) {
      const parts = clean.split(' ');
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  /* Logout action */
  const handleLogout = () => {
    localStorage.removeItem('jt_token');
    localStorage.removeItem('jt_user');
    toast.success('Logged out successfully', 'See you next time!');
    navigate('/login');
  };

  return (
    <aside className="db-sidebar">
      <div className="db-sidebar-brand">
        <div className="db-sidebar-brand-dots">
          <span className="db-sidebar-brand-dot" />
          <span className="db-sidebar-brand-dot db-sidebar-brand-dot--accent" />
          <span className="db-sidebar-brand-dot" />
        </div>
        <span className="db-sidebar-brand-name">JobTracker</span>
      </div>

      <nav className="db-menu-list">
        <button
          onClick={() => navigate('/dashboard')}
          className={`db-menu-item${activeTab === 'dashboard' ? ' db-menu-item--active' : ''}`}
        >
          <GridIcon />
          Dashboard
        </button>
        <button
          onClick={() => navigate('/applications')}
          className={`db-menu-item${activeTab === 'applications' ? ' db-menu-item--active' : ''}`}
        >
          <BriefcaseIcon />
          Application List
        </button>
        <button
          onClick={() => navigate('/create-application')}
          className={`db-menu-item${activeTab === 'create' ? ' db-menu-item--active' : ''}`}
        >
          <PlusCircleIcon />
          Create Application
        </button>
      </nav>

      <div className="db-sidebar-footer">
        <button onClick={handleLogout} className="db-logout-btn">
          <LogOutIcon />
          Log Out
        </button>

        <div className="db-user-profile">
          <div className="db-user-avatar">
            {getInitials(user.username)}
          </div>
          <div className="db-user-info">
            <span className="db-user-name">{user.username}</span>
            <span className="db-user-role">{user.email}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
