"use client";

import { useState, useEffect, useCallback } from "react";
import { STORAGE_KEYS, FOCUS_AREAS, type FocusAreaId } from "@/lib/constants";
import { getItem, setItem } from "@/lib/storage";
import { type Goal, type GoalTask, generateId } from "@/lib/models";

type View = "list" | "create" | "detail";

const FOCUS_EMOJI: Record<string, string> = {
  pray: "\u{1F64F}", heart: "\u{2764}\u{FE0F}", brain: "\u{1F9E0}",
  briefcase: "\u{1F4BC}", users: "\u{1F465}", book: "\u{1F4DA}",
  "check-circle": "\u{2705}", wallet: "\u{1F4B0}",
};

function getFocusLabel(id: FocusAreaId): string {
  return FOCUS_AREAS.find((f) => f.id === id)?.label ?? id;
}

function getFocusEmoji(id: FocusAreaId): string {
  const icon = FOCUS_AREAS.find((f) => f.id === id)?.icon ?? "";
  return FOCUS_EMOJI[icon] ?? "\u{2B50}";
}

function goalProgress(goal: Goal): number {
  if (goal.tasks.length === 0) return goal.completed ? 100 : 0;
  const done = goal.tasks.filter((t) => t.completed).length;
  return Math.round((done / goal.tasks.length) * 100);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function daysUntil(iso: string): number {
  const target = new Date(iso + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}

function daysLabel(n: number): string {
  if (n < 0) return `${Math.abs(n)} day${Math.abs(n) !== 1 ? "s" : ""} overdue`;
  if (n === 0) return "Due today";
  if (n === 1) return "1 day left";
  return `${n} days left`;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [view, setView] = useState<View>("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [justCompleted, setJustCompleted] = useState<string | null>(null);

  // Create form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [focusArea, setFocusArea] = useState<FocusAreaId>("habits");
  const [targetDate, setTargetDate] = useState("");
  const [tasks, setTasks] = useState<GoalTask[]>([]);
  const [newTask, setNewTask] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");

  useEffect(() => {
    setGoals(getItem<Goal[]>(STORAGE_KEYS.GOALS, []));
  }, []);

  const persist = useCallback((updated: Goal[]) => {
    setGoals(updated);
    setItem(STORAGE_KEYS.GOALS, updated);
  }, []);

  const resetForm = () => {
    setTitle(""); setDescription(""); setFocusArea("habits");
    setTargetDate(""); setTasks([]); setNewTask(""); setNewTaskDate("");
  };

  const handleCreate = () => {
    if (!title.trim() || !targetDate) return;
    const goal: Goal = {
      id: generateId(),
      title: title.trim(),
      description: description.trim(),
      focusArea,
      tasks,
      createdAt: new Date().toISOString(),
      targetDate,
      completed: false,
    };
    persist([goal, ...goals]);
    resetForm();
    setView("list");
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, {
      id: generateId(),
      title: newTask.trim(),
      completed: false,
      targetDate: newTaskDate || undefined,
    }]);
    setNewTask("");
    setNewTaskDate("");
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const toggleTask = (goalId: string, taskId: string) => {
    const updated = goals.map((g) => {
      if (g.id !== goalId) return g;
      const newTasks = g.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t,
      );
      const allDone = newTasks.length > 0 && newTasks.every((t) => t.completed);
      return { ...g, tasks: newTasks, completed: allDone };
    });
    persist(updated);
    const goal = updated.find((g) => g.id === goalId);
    const task = goal?.tasks.find((t) => t.id === taskId);
    if (task?.completed) {
      setJustCompleted(taskId);
      setTimeout(() => setJustCompleted(null), 500);
    }
  };

  const toggleGoalComplete = (goalId: string) => {
    const updated = goals.map((g) => {
      if (g.id !== goalId) return g;
      const nowComplete = !g.completed;
      return {
        ...g,
        completed: nowComplete,
        tasks: g.tasks.map((t) => ({ ...t, completed: nowComplete })),
      };
    });
    persist(updated);
  };

  const deleteGoal = (goalId: string) => {
    if (!confirm("Delete this goal?")) return;
    persist(goals.filter((g) => g.id !== goalId));
    setView("list");
    setSelectedId(null);
  };

  const selectedGoal = goals.find((g) => g.id === selectedId);

  // ===== CREATE VIEW =====
  if (view === "create") {
    const todayISO = new Date().toISOString().split("T")[0];
    const daysLeft = targetDate ? daysUntil(targetDate) : null;

    return (
      <div style={{ padding: "0 20px" }}>
        {/* Hero header */}
        <div className="slide-up" style={{ padding: "24px 0 20px", textAlign: "center", position: "relative" }}>
          <button onClick={() => { resetForm(); setView("list"); }} aria-label="Back"
            className="icon-btn back-btn"
            style={{ background: "var(--bg-secondary)", position: "absolute", left: 0, top: 24 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <div className="pop-in" style={{ fontSize: 44, marginBottom: 8 }}>{"\u{1F3AF}"}</div>
          <h1 className="font-display gradient-text" style={{ fontSize: 26, fontWeight: 700, margin: "0 0 4px" }}>Set a New Goal</h1>
          <p style={{ fontSize: 14, color: "var(--text-dim)", margin: 0 }}>What do you want to achieve?</p>
        </div>

        <div className="stagger-children" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Title */}
          <div className="fade-in-up">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="My goal is to..."
              autoFocus maxLength={100}
              style={{
                width: "100%", padding: "18px 20px", fontSize: 20, fontWeight: 600,
                borderRadius: "var(--radius-lg)", border: "2px solid var(--surface-border)",
                background: "var(--bg-card)", color: "var(--text)", outline: "none",
                fontFamily: "var(--font-display)", transition: "all 0.3s var(--smooth)",
                boxShadow: title ? "var(--shadow-md)" : "none",
              }} />
          </div>

          {/* Target Date — PROMINENT */}
          <div className="card" style={{
            padding: "20px", background: "var(--gradient-hero)", border: "none",
            color: "#fff", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "relative", zIndex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, opacity: 0.9, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>
                {"\u{1F3C1}"} Target Deadline
              </p>
              <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)}
                min={todayISO}
                style={{
                  width: "100%", padding: "14px 18px", fontSize: 17, fontWeight: 600,
                  borderRadius: "var(--radius-md)", border: "2px solid rgba(255,255,255,0.3)",
                  background: "rgba(255,255,255,0.15)", color: "#fff", outline: "none",
                  fontFamily: "var(--font-sans)", backdropFilter: "blur(8px)",
                }} />
              {daysLeft !== null && (
                <div style={{
                  marginTop: 12, display: "flex", alignItems: "center", gap: 8,
                  animation: "fadeIn 0.3s var(--smooth)",
                }}>
                  <span style={{
                    fontSize: 32, fontWeight: 800,
                    textShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}>{Math.max(0, daysLeft)}</span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, margin: 0, opacity: 0.95 }}>
                      {daysLabel(daysLeft)}
                    </p>
                    <p style={{ fontSize: 12, margin: "2px 0 0", opacity: 0.7 }}>
                      to reach your goal
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", margin: "0 0 8px", paddingLeft: 4 }}>
              {"\u{1F4AD}"} Why does this matter?
            </p>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="This goal is important to me because..."
              maxLength={500} rows={3}
              style={{
                width: "100%", padding: "16px 18px", fontSize: 15,
                borderRadius: "var(--radius-lg)", border: "2px solid var(--surface-border)",
                background: "var(--bg-card)", color: "var(--text)", outline: "none",
                fontFamily: "var(--font-sans)", resize: "none", lineHeight: 1.6,
                transition: "all 0.3s var(--smooth)",
              }} />
          </div>

          {/* Focus area */}
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", margin: "0 0 10px", paddingLeft: 4 }}>
              {"\u{1F3F7}\u{FE0F}"} What area of your life?
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {FOCUS_AREAS.map((area) => {
                const selected = focusArea === area.id;
                return (
                  <button key={area.id} onClick={() => setFocusArea(area.id)}
                    className={selected ? "pop-in" : ""}
                    style={{
                      padding: "14px 12px", borderRadius: "var(--radius-md)",
                      border: selected ? "2px solid var(--primary)" : "2px solid var(--surface-border)",
                      background: selected ? "var(--primary-glow)" : "var(--bg-card)",
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                      transition: "all 0.25s var(--spring)",
                      boxShadow: selected ? "0 0 20px var(--primary-glow)" : "none",
                      transform: selected ? "scale(1.02)" : "scale(1)",
                    }}>
                    <span style={{ fontSize: 22, transition: "transform 0.3s var(--spring)", transform: selected ? "scale(1.2)" : "scale(1)", display: "inline-block" }}>{FOCUS_EMOJI[area.icon]}</span>
                    <span style={{ fontSize: 13, fontWeight: selected ? 700 : 500, color: selected ? "var(--primary)" : "var(--text-secondary)", transition: "all 0.2s" }}>{area.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Milestones — with target dates */}
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", margin: "0 0 4px", paddingLeft: 4 }}>
              {"\u{1F9E9}"} Break it into milestones
            </p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 12px", paddingLeft: 4 }}>
              Set weekly or daily targets to stay on track
            </p>
            <div style={{
              borderRadius: "var(--radius-lg)", border: "2px solid var(--surface-border)",
              background: "var(--bg-card)", overflow: "hidden",
            }}>
              {tasks.map((t, i) => (
                <div key={t.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                  borderBottom: "1px solid var(--surface-border)",
                  animation: `slideUp 0.3s var(--spring) both`, animationDelay: `${i * 50}ms`,
                }}>
                  <span style={{
                    width: 26, height: 26, borderRadius: "50%",
                    background: "var(--gradient-primary)", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, flexShrink: 0,
                  }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 14, color: "var(--text)", display: "block" }}>{t.title}</span>
                    {t.targetDate && (
                      <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        Due {formatShortDate(t.targetDate)}
                      </span>
                    )}
                  </div>
                  <button onClick={() => removeTask(t.id)} aria-label="Remove"
                    style={{
                      background: "none", border: "none", color: "var(--danger)", cursor: "pointer",
                      fontSize: 18, padding: "4px 8px", minWidth: 32, minHeight: 32,
                      transition: "all 0.2s var(--spring)", borderRadius: "50%",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.2)"; e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.background = "none"; }}>
                    ×
                  </button>
                </div>
              ))}
              {/* Add milestone input */}
              <div style={{ padding: "12px 16px", borderTop: tasks.length > 0 ? "none" : "none" }}>
                <div style={{ display: "flex", gap: 0 }}>
                  <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)}
                    placeholder={tasks.length === 0 ? "e.g. Lose 2kg this week" : `Milestone ${tasks.length + 1}...`}
                    maxLength={100}
                    onKeyDown={(e) => e.key === "Enter" && addTask()}
                    style={{
                      flex: 1, padding: "12px 0", fontSize: 14,
                      border: "none", background: "transparent", color: "var(--text)",
                      outline: "none", fontFamily: "var(--font-sans)",
                    }} />
                  <button onClick={addTask}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      padding: "12px 12px", color: newTask.trim() ? "var(--primary)" : "var(--text-muted)",
                      fontWeight: 600, fontSize: 14, transition: "all 0.2s var(--spring)",
                      minWidth: 44, minHeight: 44,
                    }}>
                    + Add
                  </button>
                </div>
                {/* Optional date for this milestone */}
                {newTask.trim() && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8, marginTop: 4,
                    animation: "fadeIn 0.2s var(--smooth)",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <input type="date" value={newTaskDate} onChange={(e) => setNewTaskDate(e.target.value)}
                      min={todayISO}
                      max={targetDate || undefined}
                      style={{
                        flex: 1, padding: "8px 12px", fontSize: 13,
                        borderRadius: "var(--radius-sm)", border: "1px solid var(--surface-border)",
                        background: "var(--bg-secondary)", color: "var(--text)", outline: "none",
                        fontFamily: "var(--font-sans)",
                      }} />
                    <span style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>optional</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <button onClick={handleCreate} className="btn btn-primary" disabled={!title.trim() || !targetDate}
            style={{
              width: "100%", padding: "16px", fontSize: 17, marginBottom: 24,
              borderRadius: "var(--radius-lg)",
              opacity: (!title.trim() || !targetDate) ? 0.5 : 1,
            }}>
            {"\u{2728}"} Create Goal
          </button>
        </div>
      </div>
    );
  }

  // ===== DETAIL VIEW =====
  if (view === "detail" && selectedGoal) {
    const progress = goalProgress(selectedGoal);
    const daysLeft = daysUntil(selectedGoal.targetDate);

    return (
      <div style={{ padding: "0 20px" }}>
        <div style={{ padding: "20px 0 12px", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => { setView("list"); setSelectedId(null); }} aria-label="Back"
            className="icon-btn back-btn"
            style={{ background: "var(--bg-secondary)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <div style={{ flex: 1 }}>
            <h1 className="font-display fade-in" style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>{selectedGoal.title}</h1>
          </div>
          <button onClick={() => deleteGoal(selectedGoal.id)} aria-label="Delete goal"
            className="icon-btn delete-btn"
            style={{ background: "rgba(239,68,68,0.08)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        </div>

        <div className="stagger-children" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Target date countdown card */}
          <div className="card" style={{
            padding: "20px",
            background: selectedGoal.completed ? "var(--gradient-success)" : daysLeft < 0 ? "linear-gradient(135deg, #ef4444, #f87171)" : "var(--gradient-hero)",
            border: "none", color: "#fff",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px", opacity: 0.9 }}>
                  {selectedGoal.completed ? "\u{1F389} Goal Completed" : "\u{1F3C1} Target Date"}
                </p>
                <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{formatDate(selectedGoal.targetDate)}</p>
              </div>
              {!selectedGoal.completed && (
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 32, fontWeight: 800, margin: 0, lineHeight: 1 }}>{Math.abs(daysLeft)}</p>
                  <p style={{ fontSize: 11, margin: "2px 0 0", opacity: 0.8 }}>{daysLeft >= 0 ? "days left" : "days overdue"}</p>
                </div>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: selectedGoal.description ? 12 : 0 }}>
              <span className="pop-in" style={{ fontSize: 14, background: "var(--primary-glow)", padding: "4px 12px", borderRadius: "var(--radius-xl)", color: "var(--primary)", fontWeight: 500 }}>
                {getFocusEmoji(selectedGoal.focusArea)} {getFocusLabel(selectedGoal.focusArea)}
              </span>
            </div>
            {selectedGoal.description && (
              <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6, margin: "0 0 8px" }}>{selectedGoal.description}</p>
            )}
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Created {formatDate(selectedGoal.createdAt)}</p>
          </div>

          {/* Progress bar */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Progress</span>
              <span className="stat-number" style={{ fontSize: 14, fontWeight: 600, color: "var(--primary)" }}>{progress}%</span>
            </div>
            <div style={{ height: 10, borderRadius: 5, background: "var(--bg-secondary)", overflow: "hidden" }}>
              <div className="progress-bar-fill" style={{ height: "100%", width: `${progress}%`, borderRadius: 5, background: progress === 100 ? "var(--success)" : "var(--primary)" }} />
            </div>
          </div>

          {/* Milestones */}
          {selectedGoal.tasks.length > 0 && (
            <div className="card" style={{ padding: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12, display: "block" }}>
                Milestones ({selectedGoal.tasks.filter((t) => t.completed).length}/{selectedGoal.tasks.length})
              </label>
              {selectedGoal.tasks.map((task, i) => {
                const taskDays = task.targetDate ? daysUntil(task.targetDate) : null;
                return (
                  <button key={task.id} onClick={() => toggleTask(selectedGoal.id, task.id)}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 0",
                      width: "100%",
                      background: "none", border: "none", borderBottom: i < selectedGoal.tasks.length - 1 ? "1px solid var(--surface-border)" : "none",
                      cursor: "pointer", textAlign: "left",
                      transition: "all 0.2s var(--smooth)",
                    }}>
                    <div className={justCompleted === task.id ? "task-checkbox checked" : "task-checkbox"} style={{
                      width: 24, height: 24, borderRadius: 8, border: `2px solid ${task.completed ? "var(--primary)" : "var(--surface-border)"}`,
                      background: task.completed ? "var(--primary)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      transition: "all 0.25s var(--spring)", marginTop: 1,
                    }}>
                      {task.completed && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{
                        fontSize: 15, color: task.completed ? "var(--text-muted)" : "var(--text)",
                        textDecoration: task.completed ? "line-through" : "none",
                        transition: "all 0.25s var(--smooth)", display: "block",
                      }}>
                        {task.title}
                      </span>
                      {task.targetDate && (
                        <span style={{
                          fontSize: 11, marginTop: 3, display: "inline-flex", alignItems: "center", gap: 4,
                          color: task.completed ? "var(--text-muted)" : taskDays !== null && taskDays < 0 ? "var(--danger)" : taskDays !== null && taskDays <= 2 ? "var(--warning)" : "var(--text-muted)",
                          fontWeight: taskDays !== null && taskDays <= 2 && !task.completed ? 600 : 400,
                        }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                          </svg>
                          {task.completed ? `Completed` : taskDays !== null ? daysLabel(taskDays) : `Due ${formatShortDate(task.targetDate)}`}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Mark complete / incomplete */}
          <button onClick={() => toggleGoalComplete(selectedGoal.id)}
            className={selectedGoal.completed ? "btn btn-secondary" : "btn btn-primary"}
            style={{ width: "100%", padding: 14, fontSize: 15, marginBottom: 24 }}>
            {selectedGoal.completed ? "Mark as Incomplete" : "\u{2728} Mark Goal Complete"}
          </button>
        </div>
      </div>
    );
  }

  // ===== LIST VIEW =====
  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);

  return (
    <div style={{ padding: "0 20px" }}>
      <div className="fade-in" style={{ padding: "20px 0 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>Goals</h1>
          <p style={{ fontSize: 14, color: "var(--text-dim)", margin: "4px 0 0" }}>Set targets and track what matters</p>
        </div>
        <button onClick={() => setView("create")} className="btn btn-primary" style={{ padding: "10px 18px", fontSize: 14 }}>
          + New
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="card slide-up" style={{ padding: "48px 24px", textAlign: "center", marginTop: 12 }}>
          <div className="empty-state-emoji" style={{ fontSize: 48, marginBottom: 16 }}>{"\u{1F3AF}"}</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px", color: "var(--text)" }}>No goals yet</h3>
          <p style={{ fontSize: 14, color: "var(--text-dim)", margin: "0 0 24px", lineHeight: 1.6 }}>
            Start by setting a goal you want to work toward. Break it into milestones to stay on track.
          </p>
          <button onClick={() => setView("create")} className="btn btn-primary">+ Create Goal</button>
        </div>
      ) : (
        <div className="stagger-children" style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
          {/* Active goals */}
          {activeGoals.map((goal) => {
            const progress = goalProgress(goal);
            const days = daysUntil(goal.targetDate);
            return (
              <button key={goal.id} onClick={() => { setSelectedId(goal.id); setView("detail"); }}
                className="card card-interactive" style={{ padding: 16, textAlign: "left", width: "100%", cursor: "pointer", border: "1px solid var(--surface-border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 20 }}>{getFocusEmoji(goal.focusArea)}</span>
                  <span style={{ flex: 1, fontSize: 16, fontWeight: 600, color: "var(--text)" }}>{goal.title}</span>
                  <span className="stat-number" style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>{progress}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "var(--bg-secondary)", overflow: "hidden" }}>
                  <div className="progress-bar-fill" style={{ height: "100%", width: `${progress}%`, borderRadius: 3, background: "var(--primary)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  {goal.tasks.length > 0 && (
                    <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
                      {goal.tasks.filter((t) => t.completed).length}/{goal.tasks.length} milestones
                    </p>
                  )}
                  <p style={{
                    fontSize: 12, margin: 0, fontWeight: 600, marginLeft: "auto",
                    color: days < 0 ? "var(--danger)" : days <= 7 ? "var(--warning)" : "var(--text-muted)",
                  }}>
                    {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Due today" : `${days}d left`}
                  </p>
                </div>
              </button>
            );
          })}

          {/* Completed goals */}
          {completedGoals.length > 0 && (
            <>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 12 }}>
                {"\u{1F389}"} Completed ({completedGoals.length})
              </div>
              {completedGoals.map((goal) => (
                <button key={goal.id} onClick={() => { setSelectedId(goal.id); setView("detail"); }}
                  className="card card-interactive" style={{ padding: 16, textAlign: "left", width: "100%", cursor: "pointer", opacity: 0.7, border: "1px solid var(--surface-border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 20 }}>{"\u{2705}"}</span>
                    <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: "var(--text-dim)", textDecoration: "line-through" }}>{goal.title}</span>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}
      <div style={{ height: 24 }} />
    </div>
  );
}
