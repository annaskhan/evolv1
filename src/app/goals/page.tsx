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

  useEffect(() => {
    setGoals(getItem<Goal[]>(STORAGE_KEYS.GOALS, []));
  }, []);

  const persist = useCallback((updated: Goal[]) => {
    setGoals(updated);
    setItem(STORAGE_KEYS.GOALS, updated);
  }, []);

  const resetForm = () => {
    setTitle(""); setDescription(""); setFocusArea("habits");
    setTargetDate(""); setTasks([]); setNewTask("");
  };

  const handleCreate = () => {
    if (!title.trim()) return;
    const goal: Goal = {
      id: generateId(),
      title: title.trim(),
      description: description.trim(),
      focusArea,
      tasks,
      createdAt: new Date().toISOString(),
      targetDate: targetDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      completed: false,
    };
    persist([goal, ...goals]);
    resetForm();
    setView("list");
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: generateId(), title: newTask.trim(), completed: false }]);
    setNewTask("");
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
    // Check if task was just completed for animation
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
    return (
      <div style={{ padding: "0 20px" }}>
        <div style={{ padding: "20px 0 12px", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => { resetForm(); setView("list"); }} aria-label="Back"
            className="icon-btn back-btn"
            style={{ background: "var(--bg-secondary)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <h1 className="font-display fade-in" style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>New Goal</h1>
        </div>

        <div className="stagger-children" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Title */}
          <div className="card" style={{ padding: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Run a 5K" autoFocus maxLength={100}
              style={{ width: "100%", padding: "10px 12px", fontSize: 15, borderRadius: "var(--radius-sm)", border: "1.5px solid var(--surface-border)", background: "var(--bg)", color: "var(--text)", outline: "none", marginTop: 6, fontFamily: "var(--font-sans)", transition: "all 0.25s var(--smooth)" }} />
          </div>

          {/* Description */}
          <div className="card" style={{ padding: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Description (optional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Why does this matter to you?" maxLength={500} rows={3}
              style={{ width: "100%", padding: "10px 12px", fontSize: 15, borderRadius: "var(--radius-sm)", border: "1.5px solid var(--surface-border)", background: "var(--bg)", color: "var(--text)", outline: "none", marginTop: 6, fontFamily: "var(--font-sans)", resize: "vertical", transition: "all 0.25s var(--smooth)" }} />
          </div>

          {/* Focus area */}
          <div className="card" style={{ padding: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, display: "block" }}>Focus Area</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {FOCUS_AREAS.map((area) => (
                <button key={area.id} onClick={() => setFocusArea(area.id)}
                  className={`focus-chip ${focusArea === area.id ? "selected" : ""}`}
                  style={{ fontSize: 13, padding: "7px 14px" }}>
                  {FOCUS_EMOJI[area.icon]} {area.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target date */}
          <div className="card" style={{ padding: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Target Date</label>
            <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              style={{ width: "100%", padding: "10px 12px", fontSize: 15, borderRadius: "var(--radius-sm)", border: "1.5px solid var(--surface-border)", background: "var(--bg)", color: "var(--text)", outline: "none", marginTop: 6, fontFamily: "var(--font-sans)", transition: "all 0.25s var(--smooth)" }} />
          </div>

          {/* Tasks / milestones */}
          <div className="card" style={{ padding: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, display: "block" }}>
              Steps / Milestones
            </label>
            {tasks.map((t, i) => (
              <div key={t.id} className="fade-in" style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid var(--surface-border)", animation: `slideUp 0.3s var(--spring) both`, animationDelay: `${i * 50}ms` }}>
                <span style={{ flex: 1, fontSize: 14, color: "var(--text)" }}>{t.title}</span>
                <button onClick={() => removeTask(t.id)} aria-label="Remove"
                  style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: 18, padding: "4px 8px", minWidth: 32, minHeight: 32, transition: "transform 0.2s var(--spring)" }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.2)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}>
                  ×
                </button>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add a step..."
                maxLength={100}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                style={{ flex: 1, padding: "10px 12px", fontSize: 14, borderRadius: "var(--radius-sm)", border: "1.5px solid var(--surface-border)", background: "var(--bg)", color: "var(--text)", outline: "none", fontFamily: "var(--font-sans)", transition: "all 0.25s var(--smooth)" }} />
              <button onClick={addTask} className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: 14 }}>Add</button>
            </div>
          </div>

          {/* Submit */}
          <button onClick={handleCreate} className="btn btn-primary" disabled={!title.trim()} style={{ width: "100%", padding: "14px", fontSize: 16, marginBottom: 24 }}>
            Create Goal
          </button>
        </div>
      </div>
    );
  }

  // ===== DETAIL VIEW =====
  if (view === "detail" && selectedGoal) {
    const progress = goalProgress(selectedGoal);
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
            style={{ background: "rgba(193,87,78,0.1)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        </div>

        <div className="stagger-children" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Meta */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
              <span className="pop-in" style={{ fontSize: 14, background: "var(--primary-glow)", padding: "4px 12px", borderRadius: "var(--radius-xl)", color: "var(--primary)", fontWeight: 500 }}>
                {getFocusEmoji(selectedGoal.focusArea)} {getFocusLabel(selectedGoal.focusArea)}
              </span>
              {selectedGoal.completed && (
                <span className="bounce-in" style={{ fontSize: 13, background: "rgba(64,145,108,0.1)", padding: "4px 12px", borderRadius: "var(--radius-xl)", color: "var(--success)", fontWeight: 600 }}>
                  {"\u{1F389}"} Completed
                </span>
              )}
            </div>
            {selectedGoal.description && (
              <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6, margin: "0 0 12px" }}>{selectedGoal.description}</p>
            )}
            <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--text-muted)" }}>
              <span>Created {formatDate(selectedGoal.createdAt)}</span>
              <span>Target {formatDate(selectedGoal.targetDate)}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Progress</span>
              <span className="stat-number" style={{ fontSize: 14, fontWeight: 600, color: "var(--primary)" }}>{progress}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: "var(--bg-secondary)", overflow: "hidden" }}>
              <div className="progress-bar-fill" style={{ height: "100%", width: `${progress}%`, borderRadius: 4, background: progress === 100 ? "var(--success)" : "var(--primary)" }} />
            </div>
          </div>

          {/* Tasks */}
          {selectedGoal.tasks.length > 0 && (
            <div className="card" style={{ padding: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, display: "block" }}>
                Steps ({selectedGoal.tasks.filter((t) => t.completed).length}/{selectedGoal.tasks.length})
              </label>
              {selectedGoal.tasks.map((task) => (
                <button key={task.id} onClick={() => toggleTask(selectedGoal.id, task.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "12px 0",
                    width: "100%",
                    background: "none", border: "none", borderBottom: "1px solid var(--surface-border)",
                    cursor: "pointer", textAlign: "left",
                    transition: "all 0.2s var(--smooth)",
                  }}>
                  <div className={justCompleted === task.id ? "task-checkbox checked" : "task-checkbox"} style={{
                    width: 22, height: 22, borderRadius: 6, border: `2px solid ${task.completed ? "var(--primary)" : "var(--surface-border)"}`,
                    background: task.completed ? "var(--primary)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    transition: "all 0.25s var(--spring)",
                  }}>
                    {task.completed && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    )}
                  </div>
                  <span style={{
                    fontSize: 15, color: task.completed ? "var(--text-muted)" : "var(--text)",
                    textDecoration: task.completed ? "line-through" : "none",
                    transition: "all 0.25s var(--smooth)",
                  }}>
                    {task.title}
                  </span>
                </button>
              ))}
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
            Start by setting a goal you want to work toward. Break it down into steps to stay on track.
          </p>
          <button onClick={() => setView("create")} className="btn btn-primary">+ Create Goal</button>
        </div>
      ) : (
        <div className="stagger-children" style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
          {/* Active goals */}
          {activeGoals.map((goal) => {
            const progress = goalProgress(goal);
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
                {goal.tasks.length > 0 && (
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "8px 0 0" }}>
                    {goal.tasks.filter((t) => t.completed).length}/{goal.tasks.length} steps · Target {formatDate(goal.targetDate)}
                  </p>
                )}
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
