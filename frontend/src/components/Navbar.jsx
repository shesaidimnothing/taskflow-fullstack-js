import { Link, NavLink } from 'react-router-dom';
import AccountMenu from './AccountMenu.jsx';
export default function Navbar({ session, onLogout }) {
  return <header className="topbar">
    <Link className="brand" to="/" aria-label="TaskFlow, accueil"><span className="brand-mark">t.</span>TaskFlow<span className="brand-caption">MON ESPACE</span></Link>
    <nav className="navbar" aria-label="Navigation principale">
      {session ? <>
        <NavLink className="nav-link" to="/tasks">Mes tâches</NavLink>
        <AccountMenu session={session} onLogout={onLogout} />
      </> : <>
        <NavLink className="nav-link" to="/login">Connexion</NavLink>
        <NavLink className="nav-link" to="/register">Inscription</NavLink>
      </>}
    </nav>
  </header>;
}
