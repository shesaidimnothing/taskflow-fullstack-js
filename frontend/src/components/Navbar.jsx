import { Link, NavLink } from 'react-router-dom';
export default function Navbar({ session, onLogout }) {
  return <header className="topbar">
    <Link className="brand" to="/" aria-label="TaskFlow, accueil"><span className="brand-mark">t.</span>TaskFlow<span className="brand-caption">MON ESPACE</span></Link>
    <nav className="navbar" aria-label="Navigation principale">
      {session ? <>
        <NavLink className="nav-link" to="/tasks">Mes tâches</NavLink>
        <div className="account"><span>{session.user.email}</span><button className="ghost" onClick={onLogout}>Se déconnecter</button></div>
      </> : <>
        <NavLink className="nav-link" to="/login">Connexion</NavLink>
        <NavLink className="nav-link" to="/register">Inscription</NavLink>
      </>}
    </nav>
  </header>;
}
