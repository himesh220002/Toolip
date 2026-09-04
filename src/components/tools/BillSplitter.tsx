'use client';

import React, { useState } from 'react';
import { Users, DollarSign, Copy, Check, Plus, Trash2, Tag, Layers, RotateCcw, Share2 } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface MemberItem {
  id: string;
  name: string; // e.g. "Pizza"
  price: number; // e.g. 600
  sharedBy: string[]; // member IDs e.g. ["A", "B"]
}

interface ConsumedItemDetail {
  name: string;
  itemPrice: number; // Full item price e.g. 600
  sharePrice: number; // Individual share price e.g. 200
  splitCount: number; // Number of people sharing
}

const DEFAULT_MEMBERS = ['Alice', 'Bob', 'Charlie', 'David'];
const DEFAULT_ITEMS: MemberItem[] = [
  { id: '1', name: 'Large Pizza', price: 600, sharedBy: ['Alice', 'Bob', 'Charlie'] },
  { id: '2', name: 'Coffee', price: 150, sharedBy: ['Alice'] },
  { id: '3', name: 'Appetizer Platter', price: 400, sharedBy: ['Alice', 'Charlie', 'David'] },
];

export const BillSplitter: React.FC = () => {
  const [splitMode, setSplitMode, resetSplitMode] = useLocalStorage<'equal' | 'itemized'>('toolip_bs_splitMode', 'itemized');

  // Equal mode state
  const [totalBill, setTotalBill, resetTotalBill] = useLocalStorage<number>('toolip_bs_totalBill', 2400);
  const [peopleCount, setPeopleCount, resetPeopleCount] = useLocalStorage<number>('toolip_bs_peopleCount', 4);
  const [tipAmountInput, setTipAmountInput, resetTipAmountInput] = useLocalStorage<number>('toolip_bs_tipAmountInput', 240);

  // Itemized mode state
  const [members, setMembers, resetMembers] = useLocalStorage<string[]>('toolip_bs_members', DEFAULT_MEMBERS);
  const [newMemberName, setNewMemberName] = useState<string>('');
  const [items, setItems, resetItems] = useLocalStorage<MemberItem[]>('toolip_bs_items', DEFAULT_ITEMS);

  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemPrice, setNewItemPrice] = useState<number>(200);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedMember, setCopiedMember] = useState<string | null>(null);

  const handleResetAll = () => {
    resetSplitMode();
    resetTotalBill();
    resetPeopleCount();
    resetTipAmountInput();
    resetMembers();
    resetItems();
  };

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
      { itemSubtotal: number; tipShare: number; finalTotal: number; itemsDetails: ConsumedItemDetail[] }
    > = {};

    members.forEach((m) => {
      memberTotals[m] = { itemSubtotal: 0, tipShare: 0, finalTotal: 0, itemsDetails: [] };
    });

    items.forEach((item) => {
      if (item.sharedBy.length > 0) {
        const sharePrice = item.price / item.sharedBy.length;
        item.sharedBy.forEach((m) => {
          if (memberTotals[m]) {
            memberTotals[m].itemSubtotal += sharePrice;
            memberTotals[m].itemsDetails.push({
              name: item.name,
              itemPrice: item.price,
              sharePrice: sharePrice,
              splitCount: item.sharedBy.length,
            });
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
    let summary = `========================================\nITEMIZED BILL PORTION SPLIT SUMMARY\n========================================\nSubtotal: ₹${itemizedRes.rawSubtotal.toFixed(2)}\nTip Amount: ₹${tipAmountInput} (${equalTipPct}%)\nGrand Total: ₹${itemizedRes.grandTotal.toFixed(2)}\n\nMEMBER INDIVIDUAL SHARES:\n`;
    Object.entries(itemizedRes.memberTotals).forEach(([m, data]) => {
      summary += `\n👤 ${m}\nTotal Share: ₹${data.finalTotal.toFixed(2)}\nSubtotal: ₹${data.itemSubtotal.toFixed(2)} | Tip: ₹${data.tipShare.toFixed(2)}\n`;
      if (data.itemsDetails.length > 0) {
        summary += `Items:\n` + data.itemsDetails.map((it) => `  - ${it.name} (Item Price: ₹${it.itemPrice.toFixed(2)} | Your Share: ₹${it.sharePrice.toFixed(2)}${it.splitCount > 1 ? ` [split x${it.splitCount}]` : ''})`).join('\n') + `\n`;
      }
    });
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Copy ONLY individual person's private share summary with both Item Price & Share Price
  const copyIndividualShare = (
    m: string,
    data: { itemSubtotal: number; tipShare: number; finalTotal: number; itemsDetails: ConsumedItemDetail[] }
  ) => {
    let text = `Hi ${m},\nHere is your bill share:\n----------------------------------\nTotal Amount Due: ₹${data.finalTotal.toFixed(2)}\n• Item Subtotal: ₹${data.itemSubtotal.toFixed(2)}\n• Tip Share: ₹${data.tipShare.toFixed(2)}\n`;
    if (data.itemsDetails.length > 0) {
      text += `\nConsumed Items:\n` + data.itemsDetails.map((it) => {
        const splitStr = it.splitCount > 1 ? ` [split x${it.splitCount}]` : '';
        return `• ${it.name}\n  - Item Price: ₹${it.itemPrice.toFixed(2)}\n  - Your Share: ₹${it.sharePrice.toFixed(2)}${splitStr}`;
      }).join('\n');
    }
    text += `\n----------------------------------\nSent via Toolip Bill Splitter`;
    navigator.clipboard.writeText(text);
    setCopiedMember(m);
    setTimeout(() => setCopiedMember(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Control Header: Mode Switcher & Reset Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex p-1 bg-gray-900 border border-gray-800 rounded-xl max-w-sm flex-1 sm:flex-none">
          <button
            onClick={() => setSplitMode('itemized')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              splitMode === 'itemized' ? 'bg-sky-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Portion-Based Itemized Split
          </button>
          <button
            onClick={() => setSplitMode('equal')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              splitMode === 'equal' ? 'bg-sky-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Equal Split
          </button>
        </div>

        <button
          onClick={handleResetAll}
          title="Reset back to default values"
          className="flex items-center space-x-1.5 px-3 py-2 bg-gray-900 border border-gray-800 hover:border-gray-700 hover:bg-gray-800 rounded-xl text-gray-400 hover:text-rose-400 text-xs font-semibold transition-all"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Data</span>
        </button>
      </div>

      {splitMode === 'equal' ? (
        /* Equal Split View */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-gray-900 border border-gray-800 rounded-xl">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-300">Total Bill Subtotal (₹):</label>
              <input
                type="number"
                value={totalBill}
                onChange={(e) => setTotalBill(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-200 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-300">Number of People:</label>
              <input
                type="number"
                min={1}
                value={peopleCount}
                onChange={(e) => setPeopleCount(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-200 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-300">Tip Amount Paid (₹):</label>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">{equalTipPct}% Tip</span>
              </div>
              <input
                type="number"
                min={0}
                value={tipAmountInput}
                onChange={(e) => setTipAmountInput(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm font-mono text-emerald-400 focus:outline-none"
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
          {/* Top Row: Group Members Card & Tip Amount Paid Card Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Group Members Card */}
            <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-semibold text-gray-300 border-b border-gray-800 pb-2">
                  <span>Group Members ({members.length}):</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {members.map((m) => (
                    <span
                      key={m}
                      className="px-3 py-1 rounded-lg bg-gray-900 border border-gray-800 text-md text-gray-200 flex items-center space-x-1.5"
                    >
                      <span>{m}</span>
                      {members.length > 1 && (
                        <button
                          onClick={() => removeMember(m)}
                          className="text-rose-400 hover:text-rose-300 ml-1 font-bold"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-gray-800/80">
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Add member name (e.g. David)..."
                  className="flex-1 px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-gray-200 focus:outline-none"
                />
                <button
                  onClick={addMember}
                  className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shrink-0"
                >
                  Add Member
                </button>
              </div>
            </div>

            {/* 2. Tip Amount Paid Card */}
            <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-semibold text-gray-300 border-b border-gray-800 pb-2">
                  <span>Tip Amount Paid:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono font-bold">
                    {equalTipPct}% Tip Share
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Tip is calculated proportionally across all consumed items and divided among members.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-800/80">
                <label className="text-sm font-semibold text-gray-300">Total Tip Paid (₹):</label>
                <input
                  type="number"
                  min={0}
                  value={tipAmountInput}
                  onChange={(e) => setTipAmountInput(Number(e.target.value))}
                  placeholder="Enter tip amount paid..."
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm font-mono text-emerald-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Full Width Row: 3. Purchased Items & Portion Mapping Table Card */}
          <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl space-y-4">
            <div className="flex justify-between items-center text-xs font-semibold text-gray-300 border-b border-gray-800 pb-2">
              <span>Purchased Items & Portion Mapping:</span>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-gradient-to-r from-slate-900 to-purple-900 border border-gray-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-lg text-gray-100">{item.name}</span>
                    <span className="font-mono text-emerald-400 font-extrabold">₹{item.price}</span>
                  </div>

                  {/* Member sharing pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[12px] text-gray-300">Shared by:</span>
                    {members.map((m) => {
                      const isShared = item.sharedBy.includes(m);
                      return (
                        <button
                          key={m}
                          onClick={() => toggleItemMember(item.id, m)}
                          className={`px-2 py-1 rounded text-[14px] font-semibold border transition-all ${
                            isShared
                              ? 'bg-sky-900 text-blue-50 border-green-500'
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

            {/* Add New Item Input */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-800">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Item name (e.g. Dessert)..."
                className="flex-1 min-w-[140px] px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 focus:outline-none"
              />
              <input
                type="number"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(Number(e.target.value))}
                placeholder="Price (₹)"
                className="w-24 px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-gray-200 focus:outline-none font-mono"
              />
              <button
                onClick={addItem}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Item</span>
              </button>
            </div>
          </div>

          {/* Individual Breakdown Result Cards */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap justify-between items-center text-sm font-semibold text-gray-300 gap-2 border-b border-gray-800 pb-3">
              <span>Portion-Based Final Shares (Subtotal ₹{itemizedRes.rawSubtotal} + Tip ₹{tipAmountInput} = ₹{itemizedRes.grandTotal}):</span>
              <button
                onClick={copyItemizedSummary}
                className="flex items-center space-x-1.5 px-3 py-1 bg-sky-950 border border-sky-800 rounded-lg text-sky-300 hover:text-white text-xs font-bold transition-all"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied Full Group Summary!' : 'Copy Full Summary'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(itemizedRes.memberTotals).map(([m, data]) => (
                <div key={m} className="p-4 bg-gray-950 border border-gray-800 rounded-xl space-y-3 shadow-lg hover:border-gray-700 transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-gray-800/80 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-base">{m}</span>
                        <button
                          onClick={() => copyIndividualShare(m, data)}
                          title={`Copy ${m}'s private share text`}
                          className="p-1 rounded-md bg-gray-900 hover:bg-sky-950 border border-gray-800 hover:border-sky-700 text-sky-400 hover:text-sky-200 transition-colors"
                        >
                          {copiedMember === m ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>

                      <span className="font-mono font-extrabold text-emerald-400 text-xl">
                        ₹{data.finalTotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="text-xs text-gray-400 space-y-1 font-mono">
                      <div className="flex justify-between text-[11px]">
                        <span>Item Subtotal:</span>
                        <span className="text-gray-200">₹{data.itemSubtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span>Tip Share:</span>
                        <span className="text-emerald-400">₹{data.tipShare.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Column-Wise Stacked Items Breakdown List */}
                    {data.itemsDetails.length > 0 && (
                      <div className="space-y-1.5 border-t border-gray-800/80 pt-2.5">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                          Consumed Items:
                        </span>
                        <ul className="space-y-2">
                          {data.itemsDetails.map((it, idx) => (
                            <li key={idx} className="p-2 bg-gray-900/90 border border-gray-800 rounded-lg space-y-1 text-xs">
                              <div className="flex justify-between items-center font-semibold">
                                <span className="text-sky-300">{it.name}</span>
                                <span className="text-emerald-400 font-mono font-bold">₹{it.sharePrice.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 pt-0.5 border-t border-gray-800/60">
                                <span>Item Price: <strong className="text-gray-200">₹{it.itemPrice.toFixed(2)}</strong></span>
                                <span className="text-purple-300">{it.splitCount > 1 ? `split x${it.splitCount}` : 'solo'}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Individual Private Share Copy Button */}
                  <button
                    onClick={() => copyIndividualShare(m, data)}
                    className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg bg-gray-900 hover:bg-sky-950 border border-gray-800 hover:border-sky-700/60 text-sky-300 hover:text-white font-mono text-[11px] font-semibold transition-all mt-3"
                  >
                    {copiedMember === m ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>{copiedMember === m ? `Copied ${m}'s Bill!` : `Copy Only ${m}'s Share`}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
