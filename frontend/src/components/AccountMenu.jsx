import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
export default function AccountMenu({ session, onLogout }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const initial = session.user.email[0].toUpperCase();
  return (
        <div className="account-menu-container" ref={menuRef}>
          <button
            type="button"
            className="account-trigger-btn"
            onClick={() => setMenuOpen(prev => !prev)}
            aria-expanded={menuOpen}
            aria-haspopup="true"
            aria-label="Menu utilisateur"
          >
            <span className="account-trigger-avatar" aria-hidden="true">{initial}</span>
            <span className="account-trigger-email">{session.user.email}</span>
            <span className="account-trigger-chevron" aria-hidden="true">▼</span>
          </button>
          {menuOpen && (
            <div className="account-dropdown-popover">
              <button
                type="button"
                className="account-dropdown-item"
                onClick={() => { navigate('/account'); setMenuOpen(false); }}
              >
                <svg className="dropdown-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Mon compte</span>
              </button>
              <button
                type="button"
                className="account-dropdown-item disconnect-item"
                onClick={onLogout}
              >
                <svg className="dropdown-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m19 5 3-3" />
                  <path d="m2 22 3-3" />
                  <path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z" />
                  <path d="M7.5 13.5 10 11" />
                  <path d="M10.5 16.5 13 14" />
                  <path d="m12 6 6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0Z" />
                </svg>
                <span>Se déconnecter</span>
              </button>
            </div>
          )}
        </div>
  );
}
