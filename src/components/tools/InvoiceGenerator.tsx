'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Printer, Upload, Download, Save, FolderOpen, Check, Building2, Globe, FileText, Image as ImageIcon, RotateCcw, Eye, Copy, RefreshCw, Table, History, X, Sparkles, FilePlus } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface SavedInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  billedTo: string;
  clientAddress: string;
  companyName: string;
  totalItems: number;
  totalAmount: number;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  createdAt: string;
  itemsObject: Record<string, { name: string; quantity: number; unitPrice: number; totalPrice: number }>;
  rawItems: InvoiceItem[];
}

const DEFAULT_ITEMS: InvoiceItem[] = [
  { id: '1', description: 'Next.js Web Application Design', quantity: 1, unitPrice: 12000 },
  { id: '2', description: 'Express.js API Integration & Express Server', quantity: 1, unitPrice: 18000 },
];

const generateRandomInvoiceNumber = (): string => {
  const random8Digits = Math.floor(10000000 + Math.random() * 90000000).toString();
  return `INV-2026-${random8Digits}`;
};

// Static initial fallback ID for deterministic SSR rendering (prevents React hydration mismatch)
const SSR_FALLBACK_INVOICE_NUMBER = 'INV-2026-10000000';

export const InvoiceGenerator: React.FC = () => {
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Company Branding & Details with Local Persistence
  const [companyName, setCompanyName, resetCompanyName] = useLocalStorage<string>('toolip_inv_companyName', 'Acme Technologies Inc.');
  const [companyDomain, setCompanyDomain, resetCompanyDomain] = useLocalStorage<string>('toolip_inv_companyDomain', 'www.acmetech.com');
  const [companyAddress, setCompanyAddress, resetCompanyAddress] = useLocalStorage<string>('toolip_inv_companyAddress', '100 Innovation Way, Suite 400, San Francisco, CA');
  const [logoUrl, setLogoUrl, resetLogoUrl] = useLocalStorage<string | null>('toolip_inv_logoUrl', null);

  // Invoice Meta & Client Details with Local Persistence
  const [invoiceNumber, setInvoiceNumber, resetInvoiceNumber] = useLocalStorage<string>('toolip_inv_invoiceNumber', SSR_FALLBACK_INVOICE_NUMBER);
  const [invoiceDate, setInvoiceDate, resetInvoiceDate] = useLocalStorage<string>('toolip_inv_invoiceDate', '2026-09-10');
  const [dueDate, setDueDate, resetDueDate] = useLocalStorage<string>('toolip_inv_dueDate', '2026-09-24');
  const [clientName, setClientName, resetClientName] = useLocalStorage<string>('toolip_inv_clientName', 'Apex Global Solutions');
  const [clientAddress, setClientAddress, resetClientAddress] = useLocalStorage<string>('toolip_inv_clientAddress', '500 Enterprise Blvd, New York, NY');
  const [taxRate, setTaxRate, resetTaxRate] = useLocalStorage<number>('toolip_inv_taxRate', 18);

  const [copied, setCopied] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const [items, setItems, resetItems] = useLocalStorage<InvoiceItem[]>('toolip_inv_items', DEFAULT_ITEMS);

  // Saved Invoices Table Persistence
  const [savedInvoices, setSavedInvoices] = useLocalStorage<SavedInvoice[]>('toolip_saved_invoices_table', []);
  const [viewingInvoice, setViewingInvoice] = useState<SavedInvoice | null>(null);
  const [copiedInvoiceId, setCopiedInvoiceId] = useState<string | null>(null);
  const [toastInfo, setToastInfo] = useState<{ title: string; subtitle: string; isUpdate: boolean; recordId: string } | null>(null);

  // Ensure client side hydration is clean and generate dynamic 8-digit random invoice number post-mount
  useEffect(() => {
    setIsMounted(true);
    if (!invoiceNumber || invoiceNumber === SSR_FALLBACK_INVOICE_NUMBER || invoiceNumber === 'INV-2026-001' || !/^INV-2026-\d{8}$/.test(invoiceNumber)) {
      setInvoiceNumber(generateRandomInvoiceNumber());
    }
  }, []);

  const handleGenerateNewInvoiceNumber = () => {
    setInvoiceNumber(generateRandomInvoiceNumber());
  };

  const resetAllInvoice = () => {
    resetCompanyName();
    resetCompanyDomain();
    resetCompanyAddress();
    resetLogoUrl();
    setInvoiceNumber(generateRandomInvoiceNumber());
    resetInvoiceDate();
    resetDueDate();
    resetClientName();
    resetClientAddress();
    resetTaxRate();
    resetItems();
  };

  // Load saved default template from localStorage on mount
  useEffect(() => {
    try {
      const savedTpl = localStorage.getItem('toolip_invoice_template');
      if (savedTpl) {
        const parsed = JSON.parse(savedTpl);
        if (parsed.companyName) setCompanyName(parsed.companyName);
        if (parsed.companyDomain) setCompanyDomain(parsed.companyDomain);
        if (parsed.companyAddress) setCompanyAddress(parsed.companyAddress);
        if (parsed.logoUrl) setLogoUrl(parsed.logoUrl);
        if (parsed.taxRate !== undefined) setTaxRate(parsed.taxRate);
      }
    } catch (e) {
      console.warn('Could not load invoice template:', e);
    }
  }, []);

  // Handle Logo Upload -> Convert to Base64
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: 'New Service Item', quantity: 1, unitPrice: 5000 },
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const grandTotal = subtotal + taxAmount;

  const currentRecordId = invoiceNumber.startsWith('#') ? invoiceNumber : `#${invoiceNumber}`;
  const isCurrentInvoiceInHistoryTable = savedInvoices.some((inv) => inv.id === currentRecordId);

  // Auto-Save / Upsert current invoice into savedInvoices history table
  const saveInvoiceToTable = (): { isUpdate: boolean; recordId: string } => {
    const itemsObj: Record<string, { name: string; quantity: number; unitPrice: number; totalPrice: number }> = {};
    items.forEach((item, idx) => {
      itemsObj[`item_${idx + 1}`] = {
        name: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
      };
    });

    const recordId = currentRecordId;
    let wasUpdate = false;

    setSavedInvoices((prev) => {
      const existingIdx = prev.findIndex((inv) => inv.id === recordId);
      if (existingIdx >= 0) {
        wasUpdate = true;
      }
      const filtered = prev.filter((inv) => inv.id !== recordId);
      const newRecord: SavedInvoice = {
        id: recordId,
        invoiceNumber: recordId,
        invoiceDate,
        dueDate,
        billedTo: clientName,
        clientAddress,
        companyName,
        totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
        totalAmount: grandTotal,
        subtotal,
        taxRate,
        taxAmount,
        createdAt: new Date().toISOString(),
        itemsObject: itemsObj,
        rawItems: items,
      };
      return [newRecord, ...filtered];
    });

    setToastInfo({
      title: wasUpdate ? `Updated Existing Bill ${recordId}` : `Logged New Bill ${recordId}`,
      subtitle: wasUpdate ? 'Updated items & totals in table history.' : 'Saved invoice date, client, items & pricing in table history.',
      isUpdate: wasUpdate,
      recordId,
    });

    setTimeout(() => setToastInfo(null), 5000);
    return { isUpdate: wasUpdate, recordId };
  };

  // Start Next Invoice: Generates a brand new random Invoice # for the next bill
  const handleStartNextInvoice = () => {
    setInvoiceNumber(generateRandomInvoiceNumber());
    setToastInfo(null);
  };

  // Copy JSON representation of saved invoice
  const handleCopyInvoiceJson = (inv: SavedInvoice) => {
    const exportData = {
      invoiceId: inv.id,
      invoiceDate: inv.invoiceDate,
      dueDate: inv.dueDate,
      companyName: inv.companyName,
      billedTo: inv.billedTo,
      clientAddress: inv.clientAddress,
      totalItemsCount: inv.totalItems,
      subtotal: inv.subtotal,
      taxRate: inv.taxRate,
      taxAmount: inv.taxAmount,
      totalAmount: inv.totalAmount,
      itemsObject: inv.itemsObject,
      itemsList: inv.rawItems,
    };

    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    setCopiedInvoiceId(inv.id);
    setTimeout(() => setCopiedInvoiceId(null), 2000);
  };

  // Load a saved invoice record back into the active editor
  const loadSavedInvoiceIntoEditor = (inv: SavedInvoice) => {
    setInvoiceNumber(inv.id.replace('#', ''));
    setInvoiceDate(inv.invoiceDate);
    setDueDate(inv.dueDate);
    setClientName(inv.billedTo);
    setClientAddress(inv.clientAddress);
    if (inv.companyName) setCompanyName(inv.companyName);
    if (inv.taxRate !== undefined) setTaxRate(inv.taxRate);
    if (inv.rawItems && inv.rawItems.length > 0) {
      setItems(inv.rawItems);
    }
    setViewingInvoice(null);
  };

  // Delete invoice record from table
  const deleteSavedInvoice = (id: string) => {
    setSavedInvoices(savedInvoices.filter((inv) => inv.id !== id));
  };

  // Save Current Branding as Default Local Template
  const saveAsDefaultTemplate = () => {
    const tplData = {
      companyName,
      companyDomain,
      companyAddress,
      logoUrl,
      taxRate,
    };
    localStorage.setItem('toolip_invoice_template', JSON.stringify(tplData));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Export Template to .JSON File
  const exportTemplateJson = () => {
    const tplData = {
      companyName,
      companyDomain,
      companyAddress,
      logoUrl,
      taxRate,
      clientName,
      clientAddress,
      items,
    };
    const blob = new Blob([JSON.stringify(tplData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_template_${companyName.toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Import Template from .JSON File
  const importTemplateJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.companyName) setCompanyName(parsed.companyName);
          if (parsed.companyDomain) setCompanyDomain(parsed.companyDomain);
          if (parsed.companyAddress) setCompanyAddress(parsed.companyAddress);
          if (parsed.logoUrl) setLogoUrl(parsed.logoUrl);
          if (parsed.taxRate !== undefined) setTaxRate(parsed.taxRate);
          if (parsed.clientName) setClientName(parsed.clientName);
          if (parsed.clientAddress) setClientAddress(parsed.clientAddress);
          if (parsed.items) setItems(parsed.items);
        } catch (err) {
          alert('Invalid JSON template file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePrint = () => {
    // 1. Auto Save to table when print button is clicked (upsert existing or add new)
    saveInvoiceToTable();

    // 2. Trigger Print Dialog Window
    const element = document.getElementById('printable-invoice');
    if (!element) return;

    const printWindow = window.open('', '_blank', 'width=900,height=1100');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice_${invoiceNumber}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page {
              margin: 8mm;
              size: A4 portrait;
            }
            body {
              background: #ffffff !important;
              color: #111827 !important;
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            * {
              box-sizing: border-box;
            }
          </style>
        </head>
        <body class="bg-white text-gray-900">
          <div style="padding: 15px; background: white;">
            ${element.innerHTML}
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification when auto-saved / re-clicked to history table */}
      {toastInfo && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center justify-between space-x-4 px-4 py-3 bg-gray-950/95 border border-sky-500/50 text-white rounded-xl shadow-2xl backdrop-blur-md animate-bounce max-w-md">
          <div className="flex items-center space-x-2.5">
            <Check className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-sky-300">{toastInfo.title}</div>
              <div className="text-[11px] text-gray-300">{toastInfo.subtitle}</div>
            </div>
          </div>

          <button
            onClick={handleStartNextInvoice}
            className="flex items-center space-x-1 px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-semibold rounded-lg shrink-0 transition-all shadow-md"
          >
            <FilePlus className="h-3 w-3" />
            <span>Next Invoice</span>
          </button>
        </div>
      )}

      {/* Print Stylesheet to isolate #printable-invoice, remove browser URL headers/footers, and un-clip document */}
      <style>{`
        @media print {
          @page {
            margin: 0;
            size: A4 portrait;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            height: auto !important;
            overflow: visible !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible !important;
          }
          #printable-invoice {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 12mm 15mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            color: #000000 !important;
            max-height: none !important;
            overflow: visible !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Template Persistence Bar */}
      <div className="flex flex-wrap items-center justify-between p-3.5 bg-gray-900 border border-gray-800 rounded-xl gap-3 text-xs print:hidden">
        <div className="flex items-center space-x-2 font-semibold text-gray-300">
          <Save className="h-4 w-4 text-sky-400" />
          <span className="text-xl">Invoice Template Persistence:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={saveAsDefaultTemplate}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-sm transition-colors"
          >
            {savedSuccess ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            <span>{savedSuccess ? 'Saved Default!' : 'Save Default Template'}</span>
          </button>

          <button
            onClick={exportTemplateJson}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-sky-400 font-medium"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Template (.json)</span>
          </button>

          <label className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-emerald-400 font-medium cursor-pointer">
            <FolderOpen className="h-3.5 w-3.5" />
            <span>Import Template (.json)</span>
            <input type="file" accept=".json" onChange={importTemplateJson} className="hidden" />
          </label>

          <button
            onClick={resetAllInvoice}
            title="Reset invoice back to default values"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-rose-400 font-medium"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>

      {/* Editor Controls Accordion / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-900 border border-gray-800 rounded-xl text-xs print:hidden">
        {/* Company Details */}
        <div className="space-y-3 p-3 bg-gray-950 border border-gray-800/80 rounded-lg">
          <div className="font-semibold text-sky-400 flex items-center space-x-1">
            <Building2 className="h-4 w-4" />
            <span>Company Branding & Logo:</span>
          </div>

          <div className="space-y-1">
            <label className="text-gray-400">Company Name:</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-2.5 py-1.5 text-lg bg-gray-900 border border-gray-800 rounded  text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-400">Domain Name / Website URL:</label>
            <input
              type="text"
              value={companyDomain}
              onChange={(e) => setCompanyDomain(e.target.value)}
              className="w-full px-2.5 py-1.5 text-lg bg-gray-900 border border-gray-800 rounded text-sky-300 font-mono focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-400">Company Address:</label>
            <input
              type="text"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              className="w-full px-2.5 py-1.5 text-lg bg-gray-900 border border-gray-800 rounded text-white focus:outline-none"
            />
          </div>

          {/* Logo Upload Input */}
          <div className="space-y-1">
            <label className="text-gray-400 flex items-center space-x-1">
              <ImageIcon className="h-3.5 w-3.5 text-purple-400" />
              <span>Upload Company Logo (PNG / JPG / SVG):</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="w-full text-sm text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-800 file:text-sky-400 hover:file:bg-gray-700 cursor-pointer"
            />
          </div>
        </div>

        {/* Invoice Meta & Client Details */}
        <div className="space-y-3 p-3 bg-gray-950 border border-gray-800/80 rounded-lg">
          <div className="flex items-center justify-between font-semibold text-emerald-400">
            <div className="flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>Invoice & Client Meta:</span>
            </div>

            {/* Re-click / Duplicate protection status badge */}
            {isCurrentInvoiceInHistoryTable && (
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-950/80 border border-amber-500/40 text-amber-300 rounded-full flex items-center space-x-1">
                <span>In History (Re-print updates)</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-gray-400">Invoice #:</label>
                <button
                  type="button"
                  onClick={handleGenerateNewInvoiceNumber}
                  title="Generate new 8-digit random invoice number (#INV-2026-XXXXXXXX)"
                  className="flex items-center space-x-1 text-[10px] font-bold text-sky-400 hover:text-sky-300 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Random ID</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  suppressHydrationWarning
                  className="w-full px-2.5 py-1.5 bg-gray-900 border border-gray-800 rounded text-white focus:outline-none font-mono text-xs font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-gray-400">Tax Rate (%):</label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 text-sm bg-gray-900 border border-gray-800 rounded text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-gray-400">Billed To (Client Name):</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-2.5 py-1.5 text-lg bg-gray-900 border border-gray-800 rounded text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-400">Client Address:</label>
            <input
              type="text"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              className="w-full px-2.5 py-1.5 text-lg bg-gray-900 border border-gray-800 rounded text-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Itemized Line Items Table Builder */}
      <div className="space-y-2 p-4 bg-gray-900 border border-gray-800 rounded-xl print:hidden">
        <div className="flex justify-between items-center text-md font-semibold text-gray-300">
          <span>Line Items:</span>
          <button
            onClick={addItem}
            className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-md font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Item Line</span>
          </button>
        </div>

        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center space-x-2 bg-gray-950 p-2 rounded-lg border border-gray-800 text-xs">
              <input
                type="text"
                value={item.description}
                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                placeholder="Item Description"
                className="flex-1 px-2.5 py-1.5 text-lg bg-gray-900 border border-gray-800 rounded text-white focus:outline-none"
              />

              <input
                type="number"
                value={item.quantity}
                onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                className="w-16 px-2.5 py-1.5 text-lg bg-gray-900 border border-gray-800 rounded text-white text-center focus:outline-none font-mono"
              />

              <input
                type="number"
                value={item.unitPrice}
                onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                className="w-28 px-2.5 py-1.5 text-lg bg-gray-900 border border-gray-800 rounded text-white text-right focus:outline-none font-mono"
              />

              <div className="w-28 text-right font-mono font-bold text-emerald-400 text-lg">
                ₹{(item.quantity * item.unitPrice).toLocaleString()}
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="p-1.5 text-gray-500 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="h-6 w-6" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Rendered Invoice Document Preview with Top Logo Header & Background Logo Watermark */}
      <div id="printable-invoice" className="relative p-8 bg-white text-gray-900 rounded-2xl shadow-2xl space-y-6 print:p-0 print:shadow-none border border-gray-200 overflow-hidden">
        {/* Subtle Background Watermark Logo Overlay */}
        {logoUrl && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03] z-20"
            style={{
              backgroundImage: `url(${logoUrl})`,
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '320px',
            }}
          />
        )}

        {/* Header Block: Logo & Domain + INVOICE Title */}
        <div className="relative z-10 flex justify-between items-start border-b-2 border-gray-800 pb-6">
          {/* Company Logo & Domain */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              {logoUrl ? (
                <img src={logoUrl} alt="Company Logo" className="h-12 max-w-[180px] object-contain" />
              ) : (
                <div className="h-10 w-10 rounded-xl bg-sky-600 text-white font-black flex items-center justify-center text-lg">
                  {companyName.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none">{companyName}</h1>
                {companyDomain && (
                  <a href={`https://${companyDomain}`} target="_blank" rel="noreferrer" className="text-xs font-mono font-bold text-sky-600 hover:underline">
                    {companyDomain}
                  </a>
                )}
              </div>
            </div>

            {companyAddress && <p className="text-[11px] text-gray-500 max-w-xs">{companyAddress}</p>}
          </div>

          {/* Invoice Title & Meta */}
          <div className="text-right space-y-1">
            <h2 className="text-3xl font-black text-gray-900 tracking-wider">INVOICE</h2>
            <div className="text-xs font-mono font-bold text-gray-700" suppressHydrationWarning>
              #{invoiceNumber.replace(/^#/, '')}
            </div>
            <div className="text-[11px] text-gray-500">Date: {invoiceDate}</div>
            <div className="text-[11px] text-gray-500">Due Date: {dueDate}</div>
          </div>
        </div>

        {/* Bill To Details */}
        <div className="relative z-10 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700">Billed To:</div>
          <div className="text-sm font-extrabold text-gray-900">{clientName}</div>
          <div className="text-xs text-gray-600">{clientAddress}</div>
        </div>

        {/* Itemized Table */}
        <div className="relative z-10 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-gray-300 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2">Description</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Unit Price</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-medium text-gray-800">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 font-semibold text-md text-gray-900">{item.description}</td>
                  <td className="py-3 text-center text-md font-mono">{item.quantity}</td>
                  <td className="py-3 text-right text-md font-mono">₹{item.unitPrice.toLocaleString()}</td>
                  <td className="py-3 text-right text-md font-mono font-bold text-gray-900">
                    ₹{(item.quantity * item.unitPrice).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="relative z-10 flex justify-end pt-4 border-t-2 border-gray-800">
          <div className="w-64 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span className="font-mono font-semibold">₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax ({taxRate}%):</span>
              <span className="font-mono font-semibold">₹{taxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-300">
              <span>Grand Total:</span>
              <span className="font-mono text-emerald-600">₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="flex-1 w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/25 transition-all"
        >
          <Printer className="h-4 w-4" />
          <span>Print or Save Invoice as PDF & Auto-Log to Table</span>
        </button>

        <button
          onClick={handleStartNextInvoice}
          title="Generate a new 8-digit random invoice ID for the next bill"
          className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-3 rounded-xl bg-sky-950 hover:bg-sky-900 border border-sky-500/40 text-sky-300 font-semibold text-xs transition-all shadow-md shrink-0"
        >
          <FilePlus className="h-4 w-4 text-sky-400" />
          <span>Start Next Invoice (New ID)</span>
        </button>
      </div>

      {/* SAVED INVOICES HISTORY TABLE SECTION */}
      <div className="p-5 bg-gray-900 border border-gray-800 rounded-2xl space-y-4 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Saved Invoices Table</span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-sky-950 border border-sky-500/30 text-sky-400 font-mono">
                  {savedInvoices.length} Records
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Invoices are automatically logged into this table with Date, ID, Billed To, Item Counts, Total Amounts, and Items Objects when printed.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleStartNextInvoice}
              className="flex items-center space-x-1 px-3 py-1.5 bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-500/40 font-semibold rounded-lg text-xs transition-colors"
            >
              <FilePlus className="h-3.5 w-3.5" />
              <span>New Invoice ID</span>
            </button>

            <button
              onClick={saveInvoiceToTable}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-emerald-400 font-semibold rounded-lg text-xs transition-colors border border-gray-700"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Save Current Invoice</span>
            </button>
          </div>
        </div>

        {savedInvoices.length === 0 ? (
          <div className="p-8 text-center bg-gray-950/50 rounded-xl border border-dashed border-gray-800 space-y-2">
            <Table className="h-8 w-8 text-gray-600 mx-auto" />
            <p className="text-sm font-semibold text-gray-400">No saved invoices in table history yet.</p>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Click <span className="text-emerald-400 font-semibold">"Print or Save Invoice as PDF"</span> above to automatically save invoice date, ID, total amount, items object, and client details into this table.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-950 text-gray-400 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-3">Invoice ID</th>
                  <th className="py-3 px-3">Invoice Date</th>
                  <th className="py-3 px-3">Billed To User</th>
                  <th className="py-3 px-3 text-center">Total Items</th>
                  <th className="py-3 px-3 text-right">Total Amount</th>
                  <th className="py-3 px-3 text-center">Items Object</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/80 font-medium">
                {savedInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-950/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-sky-400">{inv.id}</td>
                    <td className="py-3 px-3 text-gray-300">{inv.invoiceDate}</td>
                    <td className="py-3 px-3 text-white font-semibold">{inv.billedTo}</td>
                    <td className="py-3 px-3 text-center font-mono text-gray-300">
                      <span className="px-2 py-0.5 bg-gray-800 border border-gray-700 rounded text-gray-300 text-[11px]">
                        {inv.totalItems} {inv.totalItems === 1 ? 'item' : 'items'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400 text-sm">
                      ₹{inv.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setViewingInvoice(inv)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 text-sky-300 text-[11px] font-semibold rounded-lg transition-colors"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View Items ({Object.keys(inv.itemsObject || {}).length})</span>
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Copy JSON option */}
                        <button
                          onClick={() => handleCopyInvoiceJson(inv)}
                          title="Copy Invoice JSON object"
                          className="flex items-center space-x-1 px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white rounded-lg text-[11px] font-medium border border-gray-700 transition-colors"
                        >
                          {copiedInvoiceId === inv.id ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 text-sky-400" />
                              <span>Copy JSON</span>
                            </>
                          )}
                        </button>

                        {/* View Details modal launcher */}
                        <button
                          onClick={() => setViewingInvoice(inv)}
                          title="View Bill Details & Items Object"
                          className="p-1.5 bg-gray-800 hover:bg-gray-700 text-sky-400 rounded-lg transition-colors border border-gray-700"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        {/* Load into Editor */}
                        <button
                          onClick={() => loadSavedInvoiceIntoEditor(inv)}
                          title="Load this invoice into active editor"
                          className="p-1.5 bg-gray-800 hover:bg-gray-700 text-emerald-400 rounded-lg transition-colors border border-gray-700"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete record */}
                        <button
                          onClick={() => deleteSavedInvoice(inv.id)}
                          title="Delete from saved table"
                          className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-500 hover:text-rose-400 rounded-lg transition-colors border border-gray-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW ITEMS & JSON DETAILS MODAL */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-gray-950 border-b border-gray-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <span>Invoice Details:</span>
                    <span className="font-mono text-sky-400 font-bold">{viewingInvoice.id}</span>
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Billed to <strong className="text-white">{viewingInvoice.billedTo}</strong> on {viewingInvoice.invoiceDate}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewingInvoice(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-gray-950 border border-gray-800 rounded-xl">
                  <div className="text-[10px] text-gray-400 uppercase font-semibold">Total Amount</div>
                  <div className="text-base font-bold text-emerald-400 font-mono">
                    ₹{viewingInvoice.totalAmount.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-gray-950 border border-gray-800 rounded-xl">
                  <div className="text-[10px] text-gray-400 uppercase font-semibold">Total Items</div>
                  <div className="text-base font-bold text-sky-400 font-mono">
                    {viewingInvoice.totalItems}
                  </div>
                </div>
                <div className="p-3 bg-gray-950 border border-gray-800 rounded-xl">
                  <div className="text-[10px] text-gray-400 uppercase font-semibold">Tax Rate</div>
                  <div className="text-base font-bold text-purple-400 font-mono">
                    {viewingInvoice.taxRate}%
                  </div>
                </div>
                <div className="p-3 bg-gray-950 border border-gray-800 rounded-xl">
                  <div className="text-[10px] text-gray-400 uppercase font-semibold">Invoice Date</div>
                  <div className="text-xs font-bold text-gray-200 font-mono mt-1">
                    {viewingInvoice.invoiceDate}
                  </div>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="space-y-2">
                <div className="font-semibold text-gray-300 flex items-center justify-between">
                  <span>Bill Item Breakdown:</span>
                  <span className="text-[11px] text-gray-500 font-mono">({Object.keys(viewingInvoice.itemsObject || {}).length} line items)</span>
                </div>
                <div className="bg-gray-950 rounded-xl border border-gray-800 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-800 bg-gray-900/60 text-gray-400 font-bold uppercase text-[10px]">
                        <th className="py-2 px-3">Item Description</th>
                        <th className="py-2 px-3 text-center">Qty</th>
                        <th className="py-2 px-3 text-right">Unit Price</th>
                        <th className="py-2 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 font-medium">
                      {Object.entries(viewingInvoice.itemsObject || {}).map(([key, item]) => (
                        <tr key={key}>
                          <td className="py-2.5 px-3 text-white font-semibold">{item.name}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-sky-400">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-gray-300">₹{item.unitPrice.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">₹{item.totalPrice.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Object of Objects JSON Preview */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-gray-300 font-semibold">
                  <span className="flex items-center space-x-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                    <span>Raw Items Object (JSON Object of Objects):</span>
                  </span>
                  <button
                    onClick={() => handleCopyInvoiceJson(viewingInvoice)}
                    className="flex items-center space-x-1 text-[11px] font-bold text-sky-400 hover:text-sky-300"
                  >
                    <Copy className="h-3 w-3" />
                    <span>{copiedInvoiceId === viewingInvoice.id ? 'Copied!' : 'Copy Object JSON'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-gray-950 border border-gray-800 rounded-xl text-sky-300 font-mono text-[11px] overflow-x-auto max-h-48 leading-relaxed select-all">
                  {JSON.stringify(viewingInvoice.itemsObject, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 bg-gray-950 border-t border-gray-800">
              <button
                onClick={() => loadSavedInvoiceIntoEditor(viewingInvoice)}
                className="flex items-center space-x-1.5 px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl text-xs transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Load into Invoice Editor</span>
              </button>

              <button
                onClick={() => setViewingInvoice(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
