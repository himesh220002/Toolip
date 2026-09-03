'use client';

import React, { useState } from 'react';
import { CheckSquare, Square, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
}

export const ChecklistMaker: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: '1', text: 'Review Next.js project setup', completed: true },
    { id: '2', text: 'Verify Express API health endpoint', completed: true },
    { id: '3', text: 'Check portion-based itemized bill splitter', completed: false },
  ]);

  const [newText, setNewText] = useState<string>('');

  const addTask = () => {
    if (newText.trim()) {
      setTasks([...tasks, { id: Date.now().toString(), text: newText.trim(), completed: false }]);
      setNewText('');
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl space-y-2">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-sky-400">Project Progress: {completedCount} / {tasks.length} Done</span>
          <span className="font-mono text-emerald-400">{progressPct}%</span>
        </div>
        <div className="h-2.5 w-full bg-gray-800 rounded-full overflow-hidden">
          <div style={{ width: `${progressPct}%` }} className="bg-emerald-500 h-full transition-all" />
        </div>
      </div>

      {/* Add Task Input */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add new checklist item..."
          className="flex-1 px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-gray-200 focus:outline-none"
        />
        <button
          onClick={addTask}
          className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs flex items-center space-x-1"
        >
          <Plus className="h-4 w-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {tasks.map((t) => (
          <div
            key={t.id}
            onClick={() => toggleTask(t.id)}
            className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
              t.completed
                ? 'bg-gray-950/60 border-gray-850 text-gray-500 line-through'
                : 'bg-gray-900 border-gray-800 text-gray-200 hover:border-gray-700'
            }`}
          >
            <div className="flex items-center space-x-3">
              {t.completed ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <Square className="h-4 w-4 text-gray-500 flex-shrink-0" />
              )}
              <span className="text-xs font-medium">{t.text}</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                removeTask(t.id);
              }}
              className="text-gray-500 hover:text-rose-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
