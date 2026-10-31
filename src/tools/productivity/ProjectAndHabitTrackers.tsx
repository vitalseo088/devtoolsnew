import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, Download, Calendar, Target, Award, AlertCircle, Copy, Calculator } from 'lucide-react';

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
  const [copied, setCopied] = useState<boolean>(false);

  // 4.5 Habit Tracker (localStorage)
  interface Habit {
    id: string;
    name: string;
    targetDaysPerWeek: number;
    completedDates: string[];
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
          { title: 'Complete all 69 tools with TypeScript & Tailwind', done: true },
          { title: 'Standardize 2-column input/output layouts', done: true },
          { title: 'Verify builds and zero telemetry privacy', done: true },
        ],
      },
    ];
  });

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

  const [appliedTasks, setAppliedTasks] = useState(tasks);
  const [appliedContingency, setAppliedContingency] = useState(contingencyPct);
  const [appliedTax, setAppliedTax] = useState(projectTaxPct);

  const hasCostChanges =
    JSON.stringify(tasks) !== JSON.stringify(appliedTasks) ||
    contingencyPct !== appliedContingency ||
    projectTaxPct !== appliedTax;

  const handleCalculateCost = () => {
    setAppliedTasks(tasks);
    setAppliedContingency(contingencyPct);
    setAppliedTax(projectTaxPct);
  };

  // Project Cost Calculations from applied state
  const totalLaborCost = appliedTasks.reduce((sum, t) => sum + (t.hours * t.laborRate * t.workers), 0);
  const totalMaterialsCost = appliedTasks.reduce((sum, t) => sum + t.materialsCost, 0);
  const totalHours = appliedTasks.reduce((sum, t) => sum + t.hours, 0);
  const baseSubtotal = totalLaborCost + totalMaterialsCost;
  const contingencyAmount = baseSubtotal * (appliedContingency / 100);
  const subtotalWithContingency = baseSubtotal + contingencyAmount;
  const taxAmount = subtotalWithContingency * (appliedTax / 100);
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

  const copySummary = () => {
    const text = `Project Estimate Summary:
Total Budget: $${totalProjectCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
Labor Subtotal (${totalHours} hrs): $${totalLaborCost.toLocaleString()}
Materials Subtotal: $${totalMaterialsCost.toLocaleString()}
Contingency Buffer (${contingencyPct}%): +$${contingencyAmount.toFixed(0)}
Tax (${projectTaxPct}%): +$${taxAmount.toFixed(0)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white card-dev27 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#8A244B] uppercase tracking-wider block">
            Productivity &amp; Management
          </span>
          <h2 className="text-lg font-bold text-[#111F35]">{titles[type]}</h2>
        </div>
        {type === 'project-cost' && (
          <div className="flex items-center gap-2">
            <button
              onClick={copySummary}
              className="px-3 py-1.5 rounded-[4px] bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5 text-[#8A244B]" />}
              <span>{copied ? 'Copied' : 'Copy Summary'}</span>
            </button>
            <button
              onClick={exportProjectCostCsv}
              className="px-3 py-1.5 text-xs font-semibold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        )}
      </div>

      {type === 'project-cost' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Tasks and Cost Inputs */}
          <div className="lg:col-span-7 space-y-5">
            <div className="p-5 bg-white card-dev27 shadow-md rounded-[4px] border border-slate-200/90 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Work Breakdown Tasks ({tasks.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setTasks([...tasks, { id: Date.now().toString(), name: 'New Activity', hours: 10, laborRate: 60, workers: 1, materialsCost: 0 }])}
                  className="px-3 py-1 text-xs font-bold bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] rounded-[4px] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#8A244B]" />
                  <span>Add Task</span>
                </button>
              </div>

              <div className="space-y-3">
                {tasks.map((t) => (
                  <div key={t.id} className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={t.name}
                        onChange={(e) => setTasks(tasks.map(item => item.id === t.id ? { ...item, name: e.target.value } : item))}
                        className="flex-1 p-1.5 border border-slate-300 rounded-[4px] bg-white font-bold text-slate-900 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setTasks(tasks.filter(item => item.id !== t.id))}
                        className="p-1 text-slate-400 hover:text-red-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">Hours:</span>
                        <input
                          type="number"
                          value={t.hours}
                          onChange={(e) => setTasks(tasks.map(item => item.id === t.id ? { ...item, hours: Number(e.target.value) } : item))}
                          className="w-full p-1.5 border border-slate-300 rounded-[4px] bg-white text-center font-mono font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">Rate ($/hr):</span>
                        <input
                          type="number"
                          value={t.laborRate}
                          onChange={(e) => setTasks(tasks.map(item => item.id === t.id ? { ...item, laborRate: Number(e.target.value) } : item))}
                          className="w-full p-1.5 border border-slate-300 rounded-[4px] bg-white text-center font-mono font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">Materials ($):</span>
                        <input
                          type="number"
                          value={t.materialsCost}
                          onChange={(e) => setTasks(tasks.map(item => item.id === t.id ? { ...item, materialsCost: Number(e.target.value) } : item))}
                          className="w-full p-1.5 border border-slate-300 rounded-[4px] bg-white text-center font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Buffer & Tax Controls */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Contingency Buffer (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={contingencyPct}
                    onChange={(e) => setContingencyPct(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-[4px] bg-slate-50 font-mono text-center font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Project Tax / Fee (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={projectTaxPct}
                    onChange={(e) => setProjectTaxPct(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-[4px] bg-slate-50 font-mono text-center font-bold"
                  />
                </div>
              </div>

              {/* Action button to calculate */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleCalculateCost}
                  className="w-full py-2.5 px-4 bg-[#8A244B] hover:bg-[#721C3D] text-white text-xs font-bold rounded-[4px] shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Calculator className="w-4 h-4" />
                  {hasCostChanges ? 'Apply & Calculate Budget' : 'Calculate Budget'}
                </button>
                {hasCostChanges && (
                  <p className="text-[11px] text-amber-800 font-semibold text-center mt-1.5 bg-amber-50 border border-amber-200 py-1 px-2 rounded-[4px]">
                    Tasks or rates modified. Click to recalculate budget.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Output Layout with Easy-to-Read Highlights */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4">
            {hasCostChanges && (
              <button
                type="button"
                onClick={handleCalculateCost}
                className="w-full py-2.5 px-4 bg-[#8A244B] hover:bg-[#721C3D] text-white text-xs font-bold rounded-[4px] shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Calculator className="w-4 h-4" />
                Apply Changes &amp; Recalculate
              </button>
            )}
            <div className="p-6 bg-white card-dev27 shadow-xl rounded-[4px] border border-slate-200/90 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8A244B]" />
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
                Total Estimated Project Budget
              </span>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#2E7D32]">
                  ${totalProjectCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <span className="text-xs text-slate-500 font-bold">USD</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
                <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Total Labor</span>
                  <span className="font-mono text-lg font-extrabold text-slate-900">${totalLaborCost.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 block">{totalHours} total hours</span>
                </div>
                <div className="p-3 bg-[#F2EFE7] rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-600 uppercase block mb-0.5">Total Materials</span>
                  <span className="font-mono text-lg font-extrabold text-slate-900">${totalMaterialsCost.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">Contingency ({contingencyPct}%)</span>
                  <span className="font-mono text-base font-bold text-[#D84315]">+${contingencyAmount.toFixed(0)}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-[4px]">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">Tax ({projectTaxPct}%)</span>
                  <span className="font-mono text-base font-bold text-slate-800">+${taxAmount.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {type === 'habit-tracker' && (
        <div className="p-5 bg-white card-dev27 shadow-md rounded-[4px] space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="Enter new habit (e.g. Daily LeetCode, Morning Workout)..."
              className="flex-1 p-2.5 border border-slate-300 rounded-[4px] text-sm bg-slate-50 focus:bg-white focus:border-[#8A244B]"
              onKeyDown={(e) => e.key === 'Enter' && addHabit()}
            />
            <button
              onClick={addHabit}
              className="px-4 py-2.5 text-xs font-bold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Habit</span>
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {habits.map((h) => {
              const isDoneToday = h.completedDates.includes(todayStr);
              return (
                <div key={h.id} className="p-4 bg-slate-50 border border-slate-200 rounded-[4px] flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleHabitToday(h.id)}
                      className={`w-7 h-7 rounded-[4px] flex items-center justify-center transition-colors border cursor-pointer ${
                        isDoneToday ? 'bg-[#2E7D32] text-white border-[#2E7D32]' : 'border-slate-300 bg-white hover:bg-slate-100'
                      }`}
                    >
                      {isDoneToday && <Check className="w-4 h-4" />}
                    </button>
                    <div>
                      <span className="font-bold text-base text-slate-900 block">{h.name}</span>
                      <span className="text-slate-500 text-xs">Target: {h.targetDaysPerWeek} days/week</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 uppercase font-bold block">Streak</span>
                      <span className="font-mono font-bold text-slate-800 text-sm">🔥 {h.currentStreak} days</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 uppercase font-bold block">Best</span>
                      <span className="font-mono font-bold text-[#8A244B] text-sm">🏆 {h.bestStreak} days</span>
                    </div>
                    <button
                      onClick={() => setHabits(habits.filter(item => item.id !== h.id))}
                      className="p-1 text-slate-400 hover:text-red-700 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {type === 'goal-tracker' && (
        <div className="space-y-4">
          {goals.map((g) => {
            const completedCount = g.milestones.filter(m => m.done).length;
            const computedPct = g.milestones.length ? Math.round((completedCount / g.milestones.length) * 100) : g.progressPct;
            const isOverdue = new Date(g.targetDate).getTime() < Date.now();

            return (
              <div key={g.id} className="p-5 bg-white card-dev27 shadow-md rounded-[4px] space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-[#8A244B] font-bold uppercase tracking-wider block">{g.category}</span>
                    <h4 className="text-base font-bold text-slate-900">{g.title}</h4>
                    <span className={`text-xs ${isOverdue ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                      Target Date: {g.targetDate} {isOverdue && '(Overdue)'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-2xl font-extrabold text-[#8A244B]">{computedPct}%</span>
                    <span className="text-xs text-slate-500 block">{completedCount} of {g.milestones.length} milestones</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-2.5 rounded-[2px] overflow-hidden">
                  <div className="bg-[#8A244B] h-full transition-all duration-300" style={{ width: `${computedPct}%` }} />
                </div>

                <div className="space-y-2 pt-2">
                  {g.milestones.map((m, mIdx) => (
                    <label key={mIdx} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={m.done}
                        onChange={(e) => {
                          const updated = [...g.milestones];
                          updated[mIdx].done = e.target.checked;
                          setGoals(goals.map(item => item.id === g.id ? { ...item, milestones: updated } : item));
                        }}
                        className="rounded-[2px] text-[#8A244B] w-4 h-4"
                      />
                      <span className={m.done ? 'line-through text-slate-400 font-normal' : 'font-medium'}>{m.title}</span>
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
