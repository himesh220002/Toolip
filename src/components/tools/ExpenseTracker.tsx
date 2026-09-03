'use client';

import React, { useState } from 'react';
import { DollarSign, Plus, Trash2, PieChart, Tag } from 'lucide-react';

interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: 'Food' | 'Transport' | 'Office' | 'Utilities' | 'Entertainment';
}

export const ExpenseTracker: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    { id: '1', title: 'Office Lunch', amount: 350, category: 'Food' },
    { id: '2', title: 'Cab Ride', amount: 200, category: 'Transport' },
    { id: '3', title: 'Software Subscription', amount: 1200, category: 'Office' },
  ]);

  const [titleInput, setTitleInput] = useState<string>('');
  const [amountInput, setAmountInput] = useState<number>(100);
  const [categoryInput, setCategoryInput] = useState<ExpenseItem['category']>('Food');

  const addExpense = () => {
    if (titleInput.trim() && amountInput > 0) {
      setExpenses([
        ...expenses,
        {
          id: Date.now().toString(),
          title: titleInput.trim(),
          amount: amountInput,
          category: categoryInput,
        },
      ]);
      setTitleInput('');
      setAmountInput(100);
    }
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Input Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-gray-900 border border-gray-800 rounded-xl items-end">
        <div className="space-y-1 sm:col-span-1">
          <label className="text-xs font-semibold text-gray-300">Expense Title:</label>
          <input
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            placeholder="e.g. Coffee..."
            className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-xs text-gray-200 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300">Amount (₹):</label>
          <input
            type="number"
            value={amountInput}
            onChange={(e) => setAmountInput(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-xs text-gray-200 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300">Category:</label>
          <select
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value as any)}
            className="w-full bg-gray-950 border border-gray-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
          >
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Office">Office</option>
            <option value="Utilities">Utilities</option>
            <option value="Entertainment">Entertainment</option>
          </select>
        </div>

        <button
          onClick={addExpense}
          className="py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold flex items-center justify-center space-x-1"
        >
          <Plus className="h-4 w-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Summary Total Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-950/70 to-teal-950/70 border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">Total Expenses</div>
          <div className="text-4xl font-extrabold text-white font-mono mt-1">₹{totalAmount.toLocaleString()}</div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {Object.entries(categoryTotals).map(([cat, amt]) => (
            <span key={cat} className="px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 font-mono">
              {cat}: ₹{amt}
            </span>
          ))}
        </div>
      </div>

      {/* Expense List */}
      <div className="space-y-2">
        {expenses.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 bg-gray-950 border border-gray-800 rounded-xl text-xs"
          >
            <div className="flex items-center space-x-3">
              <span className="font-semibold text-white">{item.title}</span>
              <span className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-[10px] text-sky-400 font-medium">
                {item.category}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="font-mono font-bold text-emerald-400">₹{item.amount}</span>
              <button onClick={() => removeExpense(item.id)} className="text-rose-400 hover:text-rose-300">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
