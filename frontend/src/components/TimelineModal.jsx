export default function TimelineModal({ open, tasks, dateLabel, onClose }) {
  if (!open) return null;

  const withTime = tasks
    .filter((t) => t.startTime)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const withoutTime = tasks.filter((t) => !t.startTime);

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()} role="dialog">
        <header className="modal-header">
          <h2>🕐 Timeline — {dateLabel}</h2>
          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </header>
        <div className="modal-body timeline-body">
          {tasks.length === 0 ? (
            <p className="empty-text">Nenhuma tarefa com horário neste dia.</p>
          ) : (
            <>
              {withTime.map((t) => (
                <div key={t.id} className={`timeline-row ${t.isCompleted ? 'done' : ''}`}>
                  <span className="timeline-time">{t.startTime}</span>
                  <span>{t.description}</span>
                </div>
              ))}
              {withoutTime.length > 0 && (
                <>
                  <p className="timeline-divider">Sem horário definido</p>
                  {withoutTime.map((t) => (
                    <div key={t.id} className={`timeline-row ${t.isCompleted ? 'done' : ''}`}>
                      <span>—</span>
                      <span>{t.description}</span>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
