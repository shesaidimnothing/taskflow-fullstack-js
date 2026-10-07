export default function AuthLayout({ title, subtitle, notice, children }) {
  return <section className="auth-layout">
    <div className="intro"><p className="eyebrow">DE LA PLACE POUR L’ESSENTIEL</p><h1>Vos idées.<br />Vos tâches.<br /><em>À votre rythme.</em></h1><p className="intro-copy">Un espace simple pour organiser ce qui compte, avancer pas à pas et profiter du chemin.</p><div className="intro-note"><span className="note-line" />Un espace personnel. Des tâches qui restent privées.</div></div>
    <div className="auth-card">
      <p className="eyebrow">BIENVENUE CHEZ VOUS</p><h2>{title}</h2><p>{subtitle}</p>
      {notice && <p role="status" className="message">{notice}</p>}
      {children}
    </div>
  </section>;
}
