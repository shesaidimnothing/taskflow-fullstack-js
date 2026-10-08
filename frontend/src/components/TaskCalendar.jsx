import { useState } from 'react';
import { statusLabels } from '../taskUtils.js';

export function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
function dateKey(date) { return date.toISOString().slice(0, 10); }
function dateLabel(key) {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(`${key}T00:00:00Z`));
}
function density(count) { return count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count < 5 ? 3 : 4; }

export default function TaskCalendar({ items, busy, selectedDate, onSelectDate, onOpen, onStatus }) {
  const [annual, setAnnual] = useState(false);
  const [undated, setUndated] = useState(false);
  const current = new Date(`${selectedDate}T00:00:00Z`);
  const year = current.getUTCFullYear();
  const month = current.getUTCMonth();
  const today = todayKey();
  const byDate = new Map();
  for (const task of items) {
    const key = task.dueDate || '';
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key).push(task);
  }
  const first = new Date(`${year.toString().padStart(4, '0')}-${annual ? '01' : String(month + 1).padStart(2, '0')}-01T00:00:00Z`);
  const end = new Date(first);
  if (annual) end.setUTCFullYear(year + 1); else end.setUTCMonth(month + 1);
  const days = Array.from({ length: Math.round((end - first) / 86400000) }, (_, index) => {
    const date = new Date(first); date.setUTCDate(index + 1); return dateKey(date);
  });
  const offset = (first.getUTCDay() + 6) % 7;
  const visibleTasks = byDate.get(undated ? '' : selectedDate) || [];
  const completed = visibleTasks.filter(task => task.status === 'done').length;
  function move(amount) {
    const next = new Date(first);
    if (annual) next.setUTCFullYear(year + amount); else next.setUTCMonth(month + amount);
    onSelectDate(dateKey(next)); setUndated(false);
  }
  function select(key) { onSelectDate(key); setUndated(false); }
  return <section className="calendar-panel" aria-label="Calendrier des tâches">
    <div className="calendar-heading">
      <div><h2>Votre rythme, jour après jour.</h2><p>Chaque carré représente une journée. Plus il est foncé, plus la journée compte de tâches, terminées comprises.</p></div>
      <div className="filters" aria-label="Affichage du calendrier">
        <button className={`filter ${!annual ? 'active' : ''}`} aria-pressed={!annual} onClick={() => setAnnual(false)}>Vue mensuelle</button>
        <button className={`filter ${annual ? 'active' : ''}`} aria-pressed={annual} onClick={() => setAnnual(true)}>Vue annuelle</button>
      </div>
    </div>
    <div className="calendar-navigation">
      <button className="ghost" aria-label={annual ? 'Année précédente' : 'Mois précédent'} disabled={year === 1 && (annual || month === 0)} onClick={() => move(-1)}>←</button>
      <h3>{annual ? year : new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(first)}</h3>
      <button className="ghost" aria-label={annual ? 'Année suivante' : 'Mois suivant'} disabled={year === 9999 && (annual || month === 11)} onClick={() => move(1)}>→</button>
      <button className="text-button" onClick={() => select(today)}>Aujourd’hui</button>
    </div>
    <div className="calendar-scroll" tabIndex={0} role="region" aria-label={annual ? 'Grille annuelle des échéances, défilement horizontal' : 'Grille mensuelle des échéances'}>
      {annual && <div className="calendar-month-labels" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => {
        const start = new Date(first); start.setUTCMonth(index);
        const column = Math.floor((Math.round((start - first) / 86400000) + offset) / 7) + 1;
        return <span key={index} style={{ gridColumn: `${column} / span 3` }}>{new Intl.DateTimeFormat('fr-FR', { month: 'short', timeZone: 'UTC' }).format(start)}</span>;
      })}</div>}
      {!annual && <div className="calendar-weekdays" aria-hidden="true">{['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => <span key={day}>{day}</span>)}</div>}
      <div className={annual ? 'calendar-heatmap' : 'calendar-month'}>
        {Array.from({ length: offset }, (_, index) => <span key={`blank-${index}`} aria-hidden="true" />)}
        {days.map(key => {
          const tasks = byDate.get(key) || [];
          const label = `${dateLabel(key)} : ${tasks.length} tâche${tasks.length === 1 ? '' : 's'}`;
          return <button key={key} className={`calendar-day density-${density(tasks.length)} ${key === today ? 'is-today' : ''}`} data-date={key} data-count={tasks.length} aria-label={label} title={label} aria-pressed={!undated && key === selectedDate} onClick={() => select(key)}>
            {!annual && <><span>{Number(key.slice(-2))}</span><small>{tasks.length ? `${tasks.length} tâche${tasks.length === 1 ? '' : 's'}` : '—'}</small></>}
          </button>;
        })}
      </div>
    </div>
    <div className="calendar-legend" aria-label="Légende : aucune tâche, 1, 2, 3 à 4, 5 ou plus">
      <span>Moins</span>{['0', '1', '2', '3–4', '5+'].map((label, index) => <span key={label} className={`legend-square density-${index}`} title={`${label} tâche(s)`} aria-hidden="true" />)}<span>Plus</span>
      <button className="text-button" aria-pressed={undated} onClick={() => setUndated(true)}>Sans échéance ({(byDate.get('') || []).length})</button>
    </div>
    <div className="calendar-agenda" aria-live="polite">
      <h3>{undated ? 'Tâches sans échéance' : dateLabel(selectedDate)}</h3>
      <p>{visibleTasks.length} tâche(s) · {completed} terminée(s) · {visibleTasks.length - completed} restante(s)</p>
      {visibleTasks.length ? <ul className="agenda-list">{visibleTasks.map(task => <li key={task.id}>
        <button className="agenda-title" disabled={busy} onClick={() => onOpen(task.id)}>{task.title}<span className={`badge ${task.status}`}>{statusLabels[task.status]}</span></button>
        <button className="ghost" disabled={busy} onClick={() => onStatus(task, task.status === 'done' ? 'todo' : 'done')}>{task.status === 'done' ? 'À reprendre' : 'Terminer'}</button>
      </li>)}</ul> : <p className="calendar-empty">{undated ? 'Toutes vos tâches ont une échéance.' : 'Aucune tâche prévue ce jour-là.'}</p>}
    </div>
  </section>;
}
