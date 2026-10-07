import { useState } from 'react';
import { emptyTask, priorityLabels, statusLabels } from '../taskUtils.js';
export default function TaskForm({ task, busy, onSave, onCancel }) {
  const [form, setForm] = useState(task ? { title: task.title, status: task.status, priority: task.priority, description: task.description, dueDate: task.dueDate || '' } : emptyTask);
  function change(event) { setForm(current => ({ ...current, [event.target.name]: event.target.value })); }
  function submit(event) {
    event.preventDefault();
    onSave({ ...form, dueDate: form.dueDate || null });
  }
  return <form className="editor panel" onSubmit={submit}>
    <label htmlFor="title">Titre</label><input id="title" name="title" value={form.title} onChange={change} required maxLength={120} placeholder="Qu’avez-vous en tête ?" disabled={busy} />
    <div className="form-row">
      <div><label htmlFor="status">Statut</label><select id="status" name="status" value={form.status} onChange={change} disabled={busy}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      <div><label htmlFor="priority">Priorité</label><select id="priority" name="priority" value={form.priority} onChange={change} disabled={busy}>{Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
    </div>
    <label htmlFor="dueDate">Échéance (facultative)</label><input id="dueDate" name="dueDate" type="date" min="0001-01-01" max="9999-12-31" value={form.dueDate} onChange={change} disabled={busy} />
    <label htmlFor="description">Description (facultative)</label><textarea id="description" name="description" rows={5} maxLength={1000} value={form.description} onChange={change} placeholder="Quelques détails pour vous aider à avancer…" disabled={busy} />
    <div className="actions"><button className="primary" disabled={busy || !form.title.trim()}>{busy ? 'Enregistrement…' : task ? 'Enregistrer les modifications' : 'Créer la tâche'}</button><button className="ghost" type="button" disabled={busy} onClick={onCancel}>Annuler</button></div>
  </form>;
}
