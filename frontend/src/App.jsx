import { useCallback, useEffect, useState } from 'react';
import { addMonths, subMonths, isToday } from 'date-fns';
import { api } from './api';
import { toDateString, formatDisplayDate } from './utils/dates';
import Header from './components/Header';
import WeeklyCalendar from './components/WeeklyCalendar';
import MonthlyCalendar from './components/MonthlyCalendar';
import TaskSidebar from './components/TaskSidebar';
import TaskModal from './components/TaskModal';
import TimelineModal from './components/TimelineModal';
import './styles/App.css';

export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [dayTasks, setDayTasks] = useState([]);
  const [monthTasks, setMonthTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingTask, setEditingTask] = useState(null);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dateStr = toDateString(selectedDate);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth() + 1;

  const loadCategories = useCallback(async () => {
    const data = await api.getCategories();
    setCategories(data);
  }, []);

  const loadDayTasks = useCallback(async () => {
    const data = await api.getTasksByDate(dateStr);
    setDayTasks(data);
  }, [dateStr]);

  const loadMonthTasks = useCallback(async () => {
    const data = await api.getTasksByMonth(year, month);
    setMonthTasks(data);
  }, [year, month]);

  const loadStats = useCallback(async () => {
    const data = await api.getStats();
    setTotalTasks(Number(data.total) || 0);
  }, []);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      await Promise.all([loadDayTasks(), loadMonthTasks(), loadStats()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loadDayTasks, loadMonthTasks, loadStats]);

  useEffect(() => {
    loadCategories().catch((err) => setError(err.message));
  }, [loadCategories]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function getStatusMessage() {
    const pending = dayTasks.filter((t) => !t.isCompleted).length;
    if (isToday(selectedDate) && pending === 0 && dayTasks.length >= 0) {
      return null;
    }
    return undefined;
  }

  async function handleQuickAdd(text) {
    await api.createTask({
      title: text,
      taskDate: dateStr,
      priority: 'medium',
      recurrence: 'none',
    });
    await refresh();
  }

  function handleOpenModal(task) {
    setEditingTask(task);
    setModalMode(task ? 'edit' : 'create');
    setModalOpen(true);
  }

  async function handleSave(form) {
    if (modalMode === 'edit' && editingTask) {
      await api.updateTask(editingTask.id, form);
    } else {
      await api.createTask({ ...form, taskDate: form.taskDate || dateStr });
    }
    setModalOpen(false);
    setEditingTask(null);
    await refresh();
  }

  async function handleToggle(task) {
    await api.patchTask(task.id, { isCompleted: !task.isCompleted });
    await refresh();
  }

  async function handleDelete(task) {
    if (!window.confirm('Excluir esta tarefa?')) return;
    await api.deleteTask(task.id);
    await refresh();
  }

  async function handleDropTask(taskId, newDate) {
    const task = monthTasks.find((t) => t.id === taskId);
    if (!task || task.taskDate === newDate) return;
    try {
      await api.patchTask(taskId, { taskDate: newDate });
      await refresh();
    } catch (err) {
      alert(err.message);
    }
  }

  function handleGoToday() {
    const today = new Date();
    setSelectedDate(today);
    setViewDate(today);
  }

  const timelineLabel = formatDisplayDate(selectedDate);
  const capitalizedTimeline =
    timelineLabel.charAt(0).toUpperCase() + timelineLabel.slice(1);

  if (loading && categories.length === 0) {
    return (
      <div className="app-loading">
        <LogoPlaceholder />
        <p>Carregando Agendo...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {error && (
        <div className="app-error" role="alert">
          <strong>Erro:</strong> {error}. Verifique se o backend e o MySQL estão rodando.
        </div>
      )}
      <Header
        selectedDate={selectedDate}
        totalTasks={totalTasks}
        onGoToday={handleGoToday}
        statusMessage={getStatusMessage()}
      />
      <main className="main-layout">
        <div className="calendar-column">
          <WeeklyCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            monthTasks={monthTasks}
            onDropTask={handleDropTask}
          />
          <MonthlyCalendar
            viewDate={viewDate}
            selectedDate={selectedDate}
            monthTasks={monthTasks}
            onSelectDate={(d) => {
              setSelectedDate(d);
              setViewDate(d);
            }}
            onPrevMonth={() => setViewDate((d) => subMonths(d, 1))}
            onNextMonth={() => setViewDate((d) => addMonths(d, 1))}
            onDropTask={handleDropTask}
          />
        </div>
        <TaskSidebar
          selectedDate={selectedDate}
          tasks={dayTasks}
          filter={filter}
          priorityFilter={priorityFilter}
          onFilterChange={setFilter}
          onPriorityFilterChange={setPriorityFilter}
          onQuickAdd={handleQuickAdd}
          onOpenModal={handleOpenModal}
          onToggle={handleToggle}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          onOpenTimeline={() => setTimelineOpen(true)}
        />
      </main>
      <TaskModal
        open={modalOpen}
        mode={modalMode}
        task={editingTask}
        categories={categories}
        defaultDate={dateStr}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSave}
      />
      <TimelineModal
        open={timelineOpen}
        tasks={dayTasks}
        dateLabel={capitalizedTimeline}
        onClose={() => setTimelineOpen(false)}
      />
    </div>
  );
}

function LogoPlaceholder() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden>
      <path d="M8 36 L26 10" stroke="#3B9AE8" strokeWidth="7" strokeLinecap="round" />
      <path d="M20 12 L40 12 L30 34 Z" fill="#F5C518" />
      <circle cx="34" cy="34" r="7" fill="#E53935" />
    </svg>
  );
}
