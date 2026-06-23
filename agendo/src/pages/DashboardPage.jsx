import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import { todayISO } from '../utils/date.js';
import { getTasksForDate, isTaskDoneOnDate } from '../utils/task.js';
import CalendarDayPanel from '../components/CalendarDayPanel.jsx';
import CalendarView from '../components/CalendarView.jsx';
import TaskCard from '../components/TaskCard.jsx';
import TaskModal from '../components/TaskModal.jsx';

const WEEKDAY_FULL = ['Domingo', 'Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado'];
const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [viewDate, setViewDate] = useState(new Date());
  const [tab, setTab] = useState('todas'); // todas | ativas | concluidas
  const [quickTitle, setQuickTitle] = useState('');
  const [quickAddError, setQuickAddError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadData = useCallback(async () => {
    setLoadError('');
    setLoading(true);
    try {
      const [taskList, categoryList] = await Promise.all([
        api.listTasks(),
        api.listCategories(),
      ]);
      setTasks(taskList);
      setCategories(categoryList);
    } catch (err) {
      setLoadError(err.message || 'Erro ao carregar dados');
      setTasks([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => { loadData(); }, [loadData]);

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => { map[c.value] = c; });
    return map;
  }, [categories]);

  const tasksOnSelectedDate = useMemo(
    () => getTasksForDate(tasks, selectedDate),
    [tasks, selectedDate]
  );

  const tasksByTab = useMemo(() => {
    return tasksOnSelectedDate.filter((t) => {
      const done = isTaskDoneOnDate(t, selectedDate);
      if (tab === 'ativas') return !done;
      if (tab === 'concluidas') return done;
      return true;
    });
  }, [tasksOnSelectedDate, tab, selectedDate]);

  const activeCount    = tasksOnSelectedDate.filter((t) => !isTaskDoneOnDate(t, selectedDate)).length;
  const completedCount = tasksOnSelectedDate.filter((t) =>  isTaskDoneOnDate(t, selectedDate)).length;
  const totalCount     = tasksOnSelectedDate.length;
  const progress       = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  const taskDatesSet = useMemo(() => {
    const set = new Set();
    tasks.forEach((t) => {
      // marca o dia de vencimento e, se for recorrente, todo o intervalo simplificado pelo dueDate
      if (t.dueDate) set.add(t.dueDate.slice(0, 10));
    });
    return set;
  }, [tasks]);

  const completedDatesSet = useMemo(() => {
    const set = new Set();
    taskDatesSet.forEach((iso) => {
      const dayTasks = getTasksForDate(tasks, iso);
      if (dayTasks.length && dayTasks.every((t) => isTaskDoneOnDate(t, iso))) set.add(iso);
    });
    return set;
  }, [tasks, taskDatesSet]);

  async function handleToggle(task) {
    await api.toggleCompleteDay(task.id, selectedDate);
    loadData();
  }

  async function handleDelete(task) {
    if (!confirm('Excluir esta tarefa?')) return;
    await api.deleteTask(task.id);
    loadData();
  }

  async function handleDropTask(taskId, newDate) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    try {
      if (task.isRecurring) {
        await api.updateTask(taskId, {
          ...task,
          recurrenceStart: newDate,
          dueDate: task.dueDate,
        });
      } else {
        await api.updateTask(taskId, { ...task, dueDate: newDate });
      }
      setSelectedDate(newDate);
      loadData();
    } catch (err) {
      console.error('Erro ao mover tarefa:', err);
    }
  }

  async function handleQuickAdd(e) {
    e.preventDefault();
    setQuickAddError('');
    if (!quickTitle.trim()) return;

    try {
      await api.createTask({ title: quickTitle.trim(), dueDate: selectedDate });
      setQuickTitle('');
      loadData();
    } catch (err) {
      setQuickAddError(err.message || 'Erro ao adicionar tarefa');
    }
  }


  function openNewTaskModal() {
    setEditingTask(null);
    setModalOpen(true);
  }

  function openEditModal(task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  const selectedDateObj = new Date(`${selectedDate}T12:00:00`);
  const weekdayLabel = WEEKDAY_FULL[selectedDateObj.getDay()];
  const isToday = selectedDate === todayISO();
  const dateLabel = `${weekdayLabel}, ${selectedDateObj.getDate()} de ${MONTH_NAMES[selectedDateObj.getMonth()]}`;

  return (
    <div className="dashboard-page">
      <header className="dashboard-topbar">
        <div className="topbar-left">
          <div className="topbar-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <div>
            <h1 className="topbar-title">Gerenciador de Tarefas</h1>
            <p className="topbar-subtitle">
              {isToday ? 'Hoje, ' : ''}{selectedDateObj.getDate()} de {MONTH_NAMES[selectedDateObj.getMonth()]} ✨
            </p>
          </div>
        </div>

        <div className="topbar-right">
          <button className="btn-ghost" onClick={() => setSelectedDate(todayISO())}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            Hoje
          </button>
          <button className="btn-ghost">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7" y2="7"/></svg>
            Categorias
          </button>
          <span className="badge-counter">{tasks.length} tarefas</span>
          <button className="btn-ghost" onClick={logout} title="Sair">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </header>

      <p className="dashboard-tip">
        💡 Dica: clique em um dia para ver suas tarefas. Use o painel lateral para adicionar e gerenciar.
      </p>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <CalendarDayPanel
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            taskDatesSet={taskDatesSet}
          />

          <CalendarView
            viewDate={viewDate}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onChangeMonth={(delta) => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1))}
            taskDatesSet={taskDatesSet}
            completedDatesSet={completedDatesSet}
            tasks={tasks}
            onDropTask={handleDropTask}
          />
        </div>

        <div className="dashboard-side">
          <div className="progress-card">
            {loadError && (
              <div className="auth-error" style={{ margin: '0 0 12px 0' }}>
                {loadError}
              </div>
            )}

            <div className="progress-card-top">

              <span className="progress-badge">{isToday ? 'Hoje' : 'Selecionado'}</span>
              <span className="progress-timeline">⏱ Timeline</span>
            </div>
            <h2 className="progress-date">{dateLabel}</h2>
            <div className="progress-stats-row">
              <span className="stat-pill stat-active">{activeCount} ativas</span>
              <span className="stat-pill stat-done">{completedCount} concluídas</span>
            </div>
          {loadError && (
            <div className="auth-error" style={{ margin: '0 0 12px 0' }}>
              {loadError}
            </div>
          )}

          <div className="progress-circle-row">

              <div className="progress-circle" style={{ '--progress': `${progress}%` }}>
                <span>{progress}%</span>
              </div>
              <div className="progress-bar-info">
                <span className="progress-bar-label">Progresso do dia · {completedCount}/{totalCount}</span>
                <div className="progress-bar-track">
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                </div>
                <span className="progress-bar-cheer">Vamos lá, você consegue!</span>
              </div>
            </div>
          </div>

          <form className="quick-add-row" onSubmit={handleQuickAdd}>
            <input
              type="text"
              placeholder="Tarefa rápida... (Enter para adicionar)"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
            />
            <button type="submit" className="quick-add-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </form>
          {quickAddError && (
            <div className="auth-error" style={{ marginTop: 10 }}>
              {quickAddError}
            </div>
          )}


          <button className="advanced-add-btn" onClick={openNewTaskModal}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            + Adicionar com horário, categoria ou recorrência
          </button>

          <div className="task-tabs">
            {[
              { key: 'todas', label: 'Todas' },
              { key: 'ativas', label: 'Ativas' },
              { key: 'concluidas', label: 'Concluídas' },
            ].map((t) => (
              <button
                key={t.key}
                className={`task-tab ${tab === t.key ? 'task-tab-active' : ''}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="task-list">
            {loading && <p className="task-list-empty">Carregando...</p>}
            {!loading && tasksByTab.length === 0 && (
              <p className="task-list-empty">Nenhuma tarefa por aqui ainda.</p>
            )}
            {tasksByTab.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                category={categoryMap[task.category]}
                done={isTaskDoneOnDate(task, selectedDate)}
                onToggle={() => handleToggle(task)}
                onEdit={() => openEditModal(task)}
                onDelete={() => handleDelete(task)}
              />
            ))}
          </div>
        </div>
      </div>

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={loadData}
        initialDate={selectedDate}
        task={editingTask}
      />
    </div>
  );
}
