import TaskItem from './TaskItem.jsx';
export default function TaskList({ items, busy, loading = false, filtersActive = false, onOpen, children }) {
  return <div className="task-section">
    <div className="section-label"><h2>Mes tâches</h2><span>VOTRE PROCHAINE ÉTAPE COMMENCE ICI</span></div>
    {children}
    {items.length ? <div className={loading ? 'task-grid refreshing' : 'task-grid'} aria-busy={loading}>{items.map(task => <TaskItem key={task.id} task={task} busy={busy} onOpen={onOpen} />)}</div> :
      filtersActive ? <p className="empty-state">Aucune tâche ne correspond à ces filtres.</p> :
      <div className="empty-state"><div className="empty-symbol" aria-hidden="true">↗</div><h2>Faites de la place à vos projets.</h2><p>Ajoutez votre première tâche. Le reste viendra pas à pas.</p></div>}
  </div>;
}
