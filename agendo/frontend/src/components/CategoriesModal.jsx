const CATEGORY_ICONS = {
  graduation: '🎓',
  briefcase: '💼',
  home: '🏠',
  heart: '❤️',
  circle: '○',
  tag: '🏷',
};

export default function CategoriesModal({ open, categories, onClose }) {
  if (!open) return null;

  const usable = categories.filter((c) => c.slug !== 'none');

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal modal-sm"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="categories-title"
      >
        <header className="modal-header">
          <h2 id="categories-title">🏷 Categorias</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </header>
        <div className="modal-body categories-body">
          <p className="categories-intro">
            Use categorias ao criar ou editar uma tarefa para organizar melhor suas atividades.
          </p>
          <ul className="categories-list">
            {usable.map((cat) => (
              <li key={cat.id} className="categories-item">
                <span
                  className="categories-chip"
                  style={{ borderColor: cat.borderColor }}
                >
                  {CATEGORY_ICONS[cat.icon] || '🏷'} {cat.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
