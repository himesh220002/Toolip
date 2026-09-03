'use client';

import React, { useState } from 'react';
import { Users, DollarSign, Copy, Check, Plus, Trash2, Tag, Layers } from 'lucide-react';

interface MemberItem {
  id: string;
  name: string; // e.g. "Pizza"
  price: number; // e.g. 600
  sharedBy: string[]; // member IDs e.g. ["A", "B"]
}

export const BillSplitter: React.FC = () => {
  const [splitMode, setSplitMode] = useState<'equal' | 'itemized'>('itemized');

  // Equal mode state
  const [totalBill, setTotalBill] = useState<number>(2400);
  const [peopleCount, setPeopleCount] = useState<number>(4);
  const [tipAmountInput, setTipAmountInput] = useState<number>(240);

  // Itemized mode state
  const [members, setMembers] = useState<string[]>(['Alice', 'Bob', 'Charlie', 'David']);
  const [newMemberName, setNewMemberName] = useState<string>('');
  const [items, setItems] = useState<MemberItem[]>([
    { id: '1', name: 'Large Pizza', price: 600, sharedBy: ['Alice', 'Bob', 'Charlie'] },
    { id: '2', name: 'Coffee', price: 150, sharedBy: ['Alice'] },
    { id: '3', name: 'Appetizer Platter', price: 400, sharedBy: ['Alice', 'Charlie', 'David'] },
  ]);

  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemPrice, setNewItemPrice] = useState<number>(200);
  const [copied, setCopied] = useState<boolean>(false);

  // Equal mode calculations
  const equalTipPct = totalBill > 0 ? ((tipAmountInput / totalBill) * 100).toFixed(1) : '0';
  const equalGrandTotal = totalBill + tipAmountInput;
  const equalPerPerson = peopleCount > 0 ? equalGrandTotal / peopleCount : 0;

  // Itemized mode calculations
  const calculateItemizedBreakdown = () => {
    const rawSubtotal = items.reduce((sum, item) => sum + item.price, 0);
    const tipPct = rawSubtotal > 0 ? tipAmountInput / rawSubtotal : 0;

    const memberTotals: Record<
      string,
      { itemSubtotal: number; tipShare: number; finalTotal: number; itemsList: string[] }
    > = {};

    members.forEach((m) => {
      memberTotals[m] = { itemSubtotal: 0, tipShare: 0, finalTotal: 0, itemsList: [] };
    });

    items.forEach((item) => {
      if (item.sharedBy.length > 0) {
        const sharePrice = item.price / item.sharedBy.length;
        item.sharedBy.forEach((m) => {
          if (memberTotals[m]) {
            memberTotals[m].itemSubtotal += sharePrice;
            const sharedCountStr = item.sharedBy.length > 1 ? ` [split x${item.sharedBy.length}]` : '';
            memberTotals[m].itemsList.push(`${item.name} (₹${sharePrice.toFixed(2)}${sharedCountStr})`);
          }
        });
      }
    });

    // Add tip proportional to consumed share
    members.forEach((m) => {
      const shareRatio = rawSubtotal > 0 ? memberTotals[m].itemSubtotal / rawSubtotal : 0;
      memberTotals[m].tipShare = tipAmountInput * shareRatio;
      memberTotals[m].finalTotal = memberTotals[m].itemSubtotal + memberTotals[m].tipShare;
    });

    return { rawSubtotal, memberTotals, grandTotal: rawSubtotal + tipAmountInput };
  };

  const itemizedRes = calculateItemizedBreakdown();

  const addMember = () => {
    if (newMemberName.trim() && !members.includes(newMemberName.trim())) {
      setMembers([...members, newMemberName.trim()]);
      setNewMemberName('');
    }
  };

  const removeMember = (memberName: string) => {
    setMembers(members.filter((m) => m !== memberName));
    setItems(items.map((it) => ({ ...it, sharedBy: it.sharedBy.filter((m) => m !== memberName) })));
  };

  const addItem = () => {
    if (newItemName.trim() && newItemPrice > 0) {
      setItems([
        ...items,
        {
          id: Date.now().toString(),
          name: newItemName.trim(),
          price: newItemPrice,
          sharedBy: [...members], // default all members
        },
      ]);
      setNewItemName('');
      setNewItemPrice(100);
    }
  };

  const toggleItemMember = (itemId: string, memberName: string) => {
    setItems(
      items.map((it) => {
        if (it.id === itemId) {
          const isIncluded = it.sharedBy.includes(memberName);
          const nextShared = isIncluded
            ? it.sharedBy.filter((m) => m !== memberName)
            : [...it.sharedBy, memberName];
          return { ...it, sharedBy: nextShared };
        }
        return it;
      })
    );
  };

  const copyItemizedSummary = () => {
    let summary = `Itemized Bill Split Summary:\nSubtotal: ₹${itemizedRes.rawSubtotal}\nTip Amount: ₹${tipAmountInput} (${equalTipPct}%)\nGrand Total: ₹${itemizedRes.grandTotal}\n\nMember Individual Shares:\n`;
    Object.entries(itemizedRes.memberTotals).forEach(([m, data]) => {
      summary += `- ${m}: ₹${data.finalTotal.toFixed(2)} (Subtotal: ₹${data.itemSubtotal.toFixed(2)}, Tip: ₹${data.tipShare.toFixed(2)})\n`;
    });
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex p-1 bg-gray-900 border border-gray-800 rounded-xl max-w-sm">
        <button
          onClick={() => setSplitMode('itemized')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
            splitMode === 'itemized' ? 'bg-sky-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          Portion-Based Itemized Split
        </button>
        <button
          onClick={() => setSplitMode('equal')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
            splitMode === 'equal' ? 'bg-sky-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          Equal Split
        </button>
      </div>

      {/* Tip Amount Input & Auto Percentage Badge */}
      <div className="flex flex-wrap items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-xl gap-4">
        <div className="flex items-center space-x-3">
          <label className="text-xs font-semibold text-gray-300">Tip Amount Paid (₹):</label>
          <input
            type="number"
            min={0}
            value={tipAmountInput}
            onChange={(e) => setTipAmountInput(Number(e.target.value))}
            className="w-32 px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-sm font-mono text-emerald-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">Calculated Tip Percentage:</span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
            Tag: {equalTipPct}% Tip
          </span>
        </div>
      </div>

      {splitMode === 'equal' ? (
        /* Equal Split View */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-gray-900 border border-gray-800 rounded-xl">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Total Bill Subtotal (₹):</label>
              <input
                type="number"
                value={totalBill}
                onChange={(e) => setTotalBill(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-200 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Number of People:</label>
              <input
                type="number"
                min={1}
                value={peopleCount}
                onChange={(e) => setPeopleCount(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-indigo-950/70 to-purple-950/70 border border-indigo-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="text-xs uppercase tracking-wider text-indigo-400 font-semibold">
                Each Person Pays (Equal)
              </div>
              <div className="text-4xl font-extrabold text-white font-mono mt-1">
                ₹{equalPerPerson.toFixed(2)}
              </div>
            </div>

            <div className="text-right text-xs text-gray-400">
              <div>Subtotal: ₹{totalBill}</div>
              <div>Tip: ₹{tipAmountInput} ({equalTipPct}%)</div>
              <div className="text-emerald-400 font-bold">Grand Total: ₹{equalGrandTotal}</div>
            </div>
          </div>
        </div>
      ) : (
        /* Portion-Based Itemized Split View */
        <div className="space-y-6">
          {/* Members List */}
          <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold text-gray-300">
              <span>Group Members ({members.length}):</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {members.map((m) => (
                <span
                  key={m}
                  className="px-3 py-1 rounded-lg bg-gray-900 border border-gray-800 text-xs text-gray-200 flex items-center space-x-1.5"
                >
                  <span>{m}</span>
                  {members.length > 1 && (
                    <button
                      onClick={() => removeMember(m)}
                      className="text-rose-400 hover:text-rose-300 ml-1"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Add member name (e.g. David)..."
                className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-gray-200 focus:outline-none"
              />
              <button
                onClick={addMember}
                className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold"
              >
                Add Member
              </button>
            </div>
          </div>

          {/* Items & Mapping Table */}
          <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl space-y-4">
            <div className="flex justify-between items-center text-xs font-semibold text-gray-300">
              <span>Purchased Items & Portion Mapping:</span>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-gray-900 border border-gray-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-white">{item.name}</span>
                    <span className="font-mono text-emerald-400">₹{item.price}</span>
                  </div>

                  {/* Member sharing pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-gray-500">Shared by:</span>
                    {members.map((m) => {
                      const isShared = item.sharedBy.includes(m);
                      return (
                        <button
                          key={m}
                          onClick={() => toggleItemMember(item.id, m)}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-all ${
                            isShared
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                              : 'bg-gray-800 border-gray-700 text-gray-500 line-through'
                          }`}
                        >
                          {m}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setItems(items.filter((it) => it.id !== item.id))}
                      className="p-1 text-rose-400 hover:bg-rose-500/10 rounded ml-2"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Item */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-800">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Item name (e.g. Dessert)..."
                className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-gray-200 focus:outline-none"
              />
              <input
                type="number"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(Number(e.target.value))}
                placeholder="Price (₹)"
                className="w-24 px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-gray-200 focus:outline-none"
              />
              <button
                onClick={addItem}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Item</span>
              </button>
            </div>
          </div>

          {/* Individual Breakdown Result Cards */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold text-gray-300">
              <span>Portion-Based Final Shares (Subtotal ₹{itemizedRes.rawSubtotal} + Tip ₹{tipAmountInput} = ₹{itemizedRes.grandTotal}):</span>
              <button
                onClick={copyItemizedSummary}
                className="flex items-center space-x-1 text-sky-400 hover:underline text-xs"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(itemizedRes.memberTotals).map(([m, data]) => (
                <div key={m} className="p-4 bg-gray-950 border border-gray-800 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-sm">{m}</span>
                    <span className="font-mono font-extrabold text-emerald-400 text-lg">
                      ₹{data.finalTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 space-y-1 border-t border-gray-800/60 pt-2 font-mono">
                    <div>Subtotal: ₹{data.itemSubtotal.toFixed(2)} | Tip: ₹{data.tipShare.toFixed(2)}</div>
                    {data.itemsList.length > 0 && (
                      <div className="text-[10px] text-sky-300 font-sans leading-tight">
                        <span className="font-semibold text-gray-500">Items:</span> {data.itemsList.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
