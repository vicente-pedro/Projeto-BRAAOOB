import Logo from './Logo';
import { formatHeaderDate } from '../utils/dates';

export default function Header({
  selectedDate,
  totalTasks,
  onGoToday,
  onOpenCategories,
  statusMessage,
}) {
  const subtitle =
    statusMessage ?? `${formatHeaderDate(selectedDate)} — tudo em dia! ✨`;

  return (
    <header className="header">
      <div className="header-left">
        <Logo size={44} />
        <div className="header-titles">
          <h1>Gerenciador de Tarefas</h1>
          <p className="header-subtitle">{subtitle}</p>
        </div>
      </div>
      <div className="header-actions">
        <button type="button" className="btn-outline" onClick={onGoToday}>
          <span className="icon">↻</span> Hoje
        </button>
        <button type="button" className="btn-outline btn-categories" onClick={onOpenCategories}>
          <span className="icon">🏷</span> Categorias
        </button>
        <button type="button" className="btn-outline btn-counter">
          {totalTasks} tarefa{totalTasks !== 1 ? 's' : ''}
        </button>
      </div>
      <p className="header-tip">
        💡 Dica: arraste tarefas (não recorrentes) para outro dia no calendário para
        movê-las. Clique em &apos;Timeline&apos; para ver os horários do dia.
      </p>
    </header>
  );
}
