import { displayDate, statusLabels } from '../taskUtils.js';
export default function TaskItem({ task, busy, onOpen }) {
  return <button className="task-card" disabled={busy} onClick={() => onOpen(task.id)} aria-label={`Consulter ${task.title}`}>
    <div className="card-top"><span className={`badge ${task.status}`}>{statusLabels[task.status]}</span><span aria-hidden="true">↗</span></div>
    <h3>{task.title}</h3>
    <p>{task.description || 'Un petit pas de plus vers votre objectif.'}</p>
    <div className="card-bottom">{displayDate(task.dueDate)}<span>Voir la tâche →</span></div>
  </button>;
}
