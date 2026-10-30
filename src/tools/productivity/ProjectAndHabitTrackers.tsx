import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, Download, Calendar, Target, Award, AlertCircle } from 'lucide-react';

interface Props {
  type: 'project-cost' | 'weekly-schedule' | 'habit-tracker' | 'goal-tracker';
}

export const ProjectAndHabitTrackers: React.FC<Props> = ({ type }) => {
  // 4.3 Project Cost
  interface ProjectTask {
    id: string;
    name: string;
    hours: number;
    laborRate: number;
    workers: number;
    materialsCost: number;
  }
  const [tasks, setTasks] = useState<ProjectTask[]>([
    { id: '1', name: 'UI / UX Wireframing & Design', hours: 35, laborRate: 65, workers: 1, materialsCost: 150 },
    { id: '2', name: 'Frontend React Architecture', hours: 60, laborRate: 85, workers: 1, materialsCost: 200 },
    { id: '3', name: 'API Integration & State Sync', hours: 40, laborRate: 90, workers: 1, materialsCost: 350 },
    { id: '4', name: 'End-to-End QA Testing', hours: 25, laborRate: 50, workers: 1, materialsCost: 100 },
  ]);
  const [contingencyPct, setContingencyPct] = useState<number>(10);
  const [projectTaxPct, setProjectTaxPct] = useState<number>(8.0);

  // 4.5 Habit Tracker (localStorage)
  interface Habit {
    id: string;
    name: string;
    targetDaysPerWeek: number;
    completedDates: string[]; // YYYY-MM-DD
    currentStreak: number;
    bestStreak: number;
  }
  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const saved = localStorage.getItem('dev27_habits');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: '1', name: 'Daily Code Review & PRs', targetDaysPerWeek: 5, completedDates: [], currentStreak: 4, bestStreak: 12 },
      { id: '2', name: 'Read 20 min Technical Docs', targetDaysPerWeek: 7, completedDates: [], currentStreak: 6, bestStreak: 21 },
      { id: '3', name: '30 min Exercise / Stretching', targetDaysPerWeek: 4, completedDates: [], currentStreak: 2, bestStreak: 8 },
    ];
  });
  const [newHabitName, setNewHabitName] = useState<string>('');

  // 4.6 Goal Tracker (localStorage)
  interface Goal {
    id: string;
    title: string;
    category: string;
    targetDate: string;
    progressPct: number;
    milestones: { title: string; done: boolean }[];
  }
  const [goals, setGoals] = useState<Goal[]>(() => {
    try {
      const saved = localStorage.getItem('dev27_goals');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: '1',
        title: 'Launch Dev27 Online Tools Suite',
        category: 'Development',
        targetDate: '2026-11-15',
        progressPct: 85,
        milestones: [
          { title: 'Build 12 Developer Utilities', done: true },
          { title: 'Build 13 Creator & Podcast Tools', done: true },
          { title: 'Build Construction & Ecom Calculators', done: true },
          { title: 'Run Cross-Device Verification', done: false },
        ],
      },
      {
        id: '2',
        title: 'Reach $10k Monthly Recurring Revenue',
        category: 'Business',
        targetDate: '2026-12-31',
        progressPct: 40,
        milestones: [
          { title: 'Validate product-market fit', done: true },
          { title: 'Acquire first 100 paid users', done: false },
          { title: 'Automate customer onboarding', done: false },
        ],
      },
    ];
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dev27_habits', JSON.stringify(habits));
    } catch {}
  }, [habits]);

  useEffect(() => {
    try {
      localStorage.setItem('dev27_goals', JSON.stringify(goals));
    } catch {}
  }, [goals]);

  // Project Cost Calculations
  const totalLaborCost = tasks.reduce((sum, t) => sum + (t.hours * t.laborRate * t.workers), 0);
  const totalMaterialsCost = tasks.reduce((sum, t) => sum + t.materialsCost, 0);
  const baseSubtotal = totalLaborCost + totalMaterialsCost;
  const contingencyAmount = baseSubtotal * (contingencyPct / 100);
  const subtotalWithContingency = baseSubtotal + contingencyAmount;
  const taxAmount = subtotalWithContingency * (projectTaxPct / 100);
  const totalProjectCost = subtotalWithContingency + taxAmount;

  const exportProjectCostCsv = () => {
    const header = 'Task Name,Hours,Hourly Rate,Workers,Labor Cost,Materials,Task Total\n';
    const rows = tasks.map(t => {
      const labor = t.hours * t.laborRate * t.workers;
      const total = labor + t.materialsCost;
      return `"${t.name}",${t.hours},$${t.laborRate},${t.workers},$${labor},$${t.materialsCost},$${total}`;
    }).join('\n');
    const summary = `\n"Labor Subtotal",,,,,,$${totalLaborCost}\n"Materials Subtotal",,,,,,$${totalMaterialsCost}\n"Contingency (${contingencyPct}%)",,,,,,$${contingencyAmount.toFixed(2)}\n"Tax (${projectTaxPct}%)",,,,,,$${taxAmount.toFixed(2)}\n"TOTAL PROJECT COST",,,,,,$${totalProjectCost.toFixed(2)}`;
    const blob = new Blob([header + rows + summary], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-estimate-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  const toggleHabitToday = (id: string) => {
    setHabits(habits.map(h => {
      if (h.id === id) {
        const isDone = h.completedDates.includes(todayStr);
        const newDates = isDone
          ? h.completedDates.filter(d => d !== todayStr)
          : [...h.completedDates, todayStr];
        const newStreak = isDone ? Math.max(0, h.currentStreak - 1) : h.currentStreak + 1;
        return {
          ...h,
          completedDates: newDates,
          currentStreak: newStreak,
          bestStreak: Math.max(h.bestStreak, newStreak),
        };
      }
      return h;
    }));
  };

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    setHabits([
      ...habits,
      {
        id: Date.now().toString(),
        name: newHabitName.trim(),
        targetDaysPerWeek: 7,
        completedDates: [todayStr],
        currentStreak: 1,
        bestStreak: 1,
      },
    ]);
    setNewHabitName('');
  };

  const titles = {
    'project-cost': 'Interactive Project Cost & Labor Estimator',
    'weekly-schedule': 'Weekly Schedule Planner',
    'habit-tracker': 'Habit Tracker with Streaks & Persistence',
    'goal-tracker': 'Goal & Milestone Progress Tracker',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-4 bg-white card-dev27 space-y-3">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block pb-2 border-b border-slate-100">
          {titles[type]}
        </span>

        {type === 'project-cost' && (
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-600 font-medium">Contingency Buffer:</span>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={contingencyPct}
                  onChange={(e) => setContingencyPct(Number(e.target.value))}
                  className="w-16 p-1 border border-slate-300 rounded-[4px] text-center"
                />
                <span className="text-slate-500">%</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-600 font-medium">Sales / Service Tax:</span>
                <input
                  type="number"
                  step="0.5"
                  value={projectTaxPct}
                  onChange={(e) => setProjectTaxPct(Number(e.target.value))}
                  className="w-16 p-1 border border-slate-300 rounded-[4px] text-center"
                />
                <span className="text-slate-500">%</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTasks([...tasks, { id: Date.now().toString(), name: 'New Activity', hours: 10, laborRate: 60, workers: 1, materialsCost: 0 }])}
                className="px-3 py-1.5 text-xs font-semibold bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] rounded-[4px] flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 text-[#8A244B]" />
                Add Task
              </button>
              <button
                onClick={exportProjectCostCsv}
                className="px-3 py-1.5 text-xs font-semibold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                Export Estimate (CSV)
              </button>
            </div>
          </div>
        )}

        {type === 'habit-tracker' && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="Enter new habit (e.g. Daily LeetCode, Hydration)..."
              className="flex-1 p-2 border border-slate-300 rounded-[4px] text-xs bg-white"
              onKeyDown={(e) => e.key === 'Enter' && addHabit()}
            />
            <button
              onClick={addHabit}
              className="px-4 py-2 text-xs font-semibold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Habit
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards Strip */}
      {type === 'project-cost' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-white card-dev27 text-xs">
            <span className="text-slate-500 block mb-0.5">Labor Subtotal</span>
            <span className="font-mono text-lg font-bold text-slate-900">
              ${totalLaborCost.toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-white card-dev27 text-xs">
            <span className="text-slate-500 block mb-0.5">Materials Subtotal</span>
            <span className="font-mono text-lg font-bold text-slate-800">
              ${totalMaterialsCost.toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-white card-dev27 text-xs">
            <span className="text-slate-500 block mb-0.5">Contingency ({contingencyPct}%)</span>
            <span className="font-mono text-lg font-bold text-[#D84315]">
              +${contingencyAmount.toFixed(0)}
            </span>
          </div>
          <div className="p-3 bg-white card-dev27 text-xs">
            <span className="text-slate-500 block mb-0.5">Total Estimated Budget</span>
            <span className="font-mono text-lg font-bold text-[#2E7D32]">
              ${totalProjectCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      )}

      {/* Task List / Habit List / Goal List */}
      {type === 'project-cost' && (
        <div className="p-4 bg-white card-dev27 space-y-2">
          <span className="text-xs font-bold text-slate-800 block pb-2 border-b border-slate-100">
            Work Breakdown Structure ({tasks.length} tasks)
          </span>

          <div className="space-y-2">
            {tasks.map((t) => (
              <div key={t.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-[4px] grid grid-cols-1 sm:grid-cols-6 gap-2 text-xs items-center">
                <input
                  type="text"
                  value={t.name}
                  onChange={(e) => setTasks(tasks.map(item => item.id === t.id ? { ...item, name: e.target.value } : item))}
                  className="sm:col-span-2 p-1.5 border border-slate-300 rounded bg-white text-xs font-medium"
                />
                <div>
                  <span className="text-[10px] text-slate-400 block">Hours:</span>
                  <input
                    type="number"
                    value={t.hours}
                    onChange={(e) => setTasks(tasks.map(item => item.id === t.id ? { ...item, hours: Number(e.target.value) } : item))}
                    className="p-1 border border-slate-300 rounded bg-white text-xs text-center w-full"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Rate ($/hr):</span>
                  <input
                    type="number"
                    value={t.laborRate}
                    onChange={(e) => setTasks(tasks.map(item => item.id === t.id ? { ...item, laborRate: Number(e.target.value) } : item))}
                    className="p-1 border border-slate-300 rounded bg-white text-xs text-center w-full font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Materials ($):</span>
                  <input
                    type="number"
                    value={t.materialsCost}
                    onChange={(e) => setTasks(tasks.map(item => item.id === t.id ? { ...item, materialsCost: Number(e.target.value) } : item))}
                    className="p-1 border border-slate-300 rounded bg-white text-xs text-center w-full font-mono"
                  />
                </div>
                <div className="flex items-center justify-between font-mono text-right font-bold text-[#8A244B]">
                  <span>${((t.hours * t.laborRate * t.workers) + t.materialsCost).toLocaleString()}</span>
                  <button
                    onClick={() => setTasks(tasks.filter(item => item.id !== t.id))}
                    className="p-1 text-slate-400 hover:text-red-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {type === 'habit-tracker' && (
        <div className="space-y-3">
          {habits.map((h) => {
            const isDoneToday = h.completedDates.includes(todayStr);
            return (
              <div key={h.id} className="p-3 bg-white card-dev27 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleHabitToday(h.id)}
                    className={`w-6 h-6 rounded-[4px] flex items-center justify-center transition-colors border ${
                      isDoneToday ? 'bg-[#2E7D32] text-white border-[#2E7D32]' : 'border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {isDoneToday && <Check className="w-4 h-4" />}
                  </button>
                  <div>
                    <span className="font-bold text-sm text-slate-900 block">{h.name}</span>
                    <span className="text-slate-500 text-[11px]">Target: {h.targetDaysPerWeek} days/wk</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Current Streak</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">🔥 {h.currentStreak} days</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Best Streak</span>
                    <span className="font-mono font-bold text-[#8A244B] text-sm">🏆 {h.bestStreak} days</span>
                  </div>
                  <button
                    onClick={() => setHabits(habits.filter(item => item.id !== h.id))}
                    className="p-1 text-slate-400 hover:text-red-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {type === 'goal-tracker' && (
        <div className="space-y-3">
          {goals.map((g) => {
            const completedCount = g.milestones.filter(m => m.done).length;
            const computedPct = g.milestones.length ? Math.round((completedCount / g.milestones.length) * 100) : g.progressPct;
            const isOverdue = new Date(g.targetDate).getTime() < Date.now();

            return (
              <div key={g.id} className="p-4 bg-white card-dev27 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-[#8A244B] font-bold uppercase tracking-wider block">{g.category}</span>
                    <h4 className="text-sm font-bold text-slate-900">{g.title}</h4>
                    <span className={`text-[11px] ${isOverdue ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                      Target Date: {g.targetDate} {isOverdue && '(Overdue)'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-lg font-bold text-[#8A244B]">{computedPct}%</span>
                    <span className="text-[11px] text-slate-400 block">{completedCount} of {g.milestones.length} milestones</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-2 rounded-[2px] overflow-hidden">
                  <div className="bg-[#8A244B] h-full transition-all duration-300" style={{ width: `${computedPct}%` }} />
                </div>

                {/* Milestones list */}
                <div className="space-y-1.5 pt-1">
                  {g.milestones.map((m, mIdx) => (
                    <label key={mIdx} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={m.done}
                        onChange={(e) => {
                          const updated = [...g.milestones];
                          updated[mIdx].done = e.target.checked;
                          setGoals(goals.map(item => item.id === g.id ? { ...item, milestones: updated } : item));
                        }}
                        className="rounded-[2px] text-[#8A244B]"
                      />
                      <span className={m.done ? 'line-through text-slate-400' : ''}>{m.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
