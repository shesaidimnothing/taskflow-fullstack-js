import TaskItem from './TaskItem.jsx';
export default function TaskList({ items, busy, onOpen }) {
  return <div className="task-section">
    <div className="section-label"><h2>Mes tâches</h2><span>VOTRE PROCHAINE ÉTAPE COMMENCE ICI</span></div>
    {items.length ? <div className="task-grid">{items.map(task => <TaskItem key={task.id} task={task} busy={busy} onOpen={onOpen} />)}</div> :
      <div className="empty-state"><div className="empty-symbol" aria-hidden="true">↗</div><h2>Faites de la place à vos projets.</h2><p>Ajoutez votre première tâche. Le reste viendra pas à pas.</p></div>}
  </div>;
}
