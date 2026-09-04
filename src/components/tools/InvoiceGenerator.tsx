'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Printer, Upload, Download, Save, FolderOpen, Check, Building2, Globe, FileText, Image as ImageIcon, RotateCcw } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

const DEFAULT_ITEMS: InvoiceItem[] = [
  { id: '1', description: 'Next.js Web Application Design', quantity: 1, unitPrice: 12000 },
  { id: '2', description: 'Express.js API Integration & Express Server', quantity: 1, unitPrice: 18000 },
];

export const InvoiceGenerator: React.FC = () => {
  // Company Branding & Details with Local Persistence
  const [companyName, setCompanyName, resetCompanyName] = useLocalStorage<string>('toolip_inv_companyName', 'Acme Technologies Inc.');
  const [companyDomain, setCompanyDomain, resetCompanyDomain] = useLocalStorage<string>('toolip_inv_companyDomain', 'www.acmetech.com');
  const [companyAddress, setCompanyAddress, resetCompanyAddress] = useLocalStorage<string>('toolip_inv_companyAddress', '100 Innovation Way, Suite 400, San Francisco, CA');
  const [logoUrl, setLogoUrl, resetLogoUrl] = useLocalStorage<string | null>('toolip_inv_logoUrl', null);

  // Invoice Meta & Client Details with Local Persistence
  const [invoiceNumber, setInvoiceNumber, resetInvoiceNumber] = useLocalStorage<string>('toolip_inv_invoiceNumber', 'INV-2026-001');
  const [invoiceDate, setInvoiceDate, resetInvoiceDate] = useLocalStorage<string>('toolip_inv_invoiceDate', '2026-09-10');
  const [dueDate, setDueDate, resetDueDate] = useLocalStorage<string>('toolip_inv_dueDate', '2026-09-24');
  const [clientName, setClientName, resetClientName] = useLocalStorage<string>('toolip_inv_clientName', 'Apex Global Solutions');
  const [clientAddress, setClientAddress, resetClientAddress] = useLocalStorage<string>('toolip_inv_clientAddress', '500 Enterprise Blvd, New York, NY');
  const [taxRate, setTaxRate, resetTaxRate] = useLocalStorage<number>('toolip_inv_taxRate', 18);

  const [copied, setCopied] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const [items, setItems, resetItems] = useLocalStorage<InvoiceItem[]>('toolip_inv_items', DEFAULT_ITEMS);

  const resetAllInvoice = () => {
    resetCompanyName();
    resetCompanyDomain();
    resetCompanyAddress();
    resetLogoUrl();
    resetInvoiceNumber();
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
          <span className='text-xl'>Invoice Template Persistence:</span>
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
              className="w-full px-2.5 py-1.5 text-md bg-gray-900 border border-gray-800 rounded text-sky-300 font-mono focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-400">Company Address:</label>
            <input
              type="text"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              className="w-full px-2.5 py-1.5 text-md bg-gray-900 border border-gray-800 rounded text-white focus:outline-none"
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
              className="w-full text-xs text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-800 file:text-sky-400 hover:file:bg-gray-700 cursor-pointer"
            />
          </div>
        </div>

        {/* Invoice Meta & Client Details */}
        <div className="space-y-3 p-3 bg-gray-950 border border-gray-800/80 rounded-lg">
          <div className="font-semibold text-emerald-400 flex items-center space-x-1">
            <FileText className="h-4 w-4" />
            <span>Invoice & Client Meta:</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-gray-400">Invoice #:</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-gray-900 border border-gray-800 rounded text-white focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-400">Tax Rate (%):</label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-gray-900 border border-gray-800 rounded text-white focus:outline-none"
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
              className="w-full px-2.5 py-1.5 text-md bg-gray-900 border border-gray-800 rounded text-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Itemized Line Items Table Builder */}
      <div className="space-y-2 p-4 bg-gray-900 border border-gray-800 rounded-xl print:hidden">
        <div className="flex justify-between items-center text-xs font-semibold text-gray-300">
          <span>Line Items:</span>
          <button
            onClick={addItem}
            className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
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
                className="flex-1 px-2.5 py-1.5 bg-gray-900 border border-gray-800 rounded text-white focus:outline-none"
              />

              <input
                type="number"
                value={item.quantity}
                onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                className="w-16 px-2.5 py-1.5 bg-gray-900 border border-gray-800 rounded text-white text-center focus:outline-none font-mono"
              />

              <input
                type="number"
                value={item.unitPrice}
                onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                className="w-28 px-2.5 py-1.5 bg-gray-900 border border-gray-800 rounded text-white text-right focus:outline-none font-mono"
              />

              <div className="w-28 text-right font-mono font-bold text-emerald-400 text-xs">
                ₹{(item.quantity * item.unitPrice).toLocaleString()}
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="p-1.5 text-gray-500 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
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
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.06] z-0"
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
            <div className="text-xs font-mono font-bold text-gray-700">#{invoiceNumber}</div>
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
                  <td className="py-3 font-semibold text-gray-900">{item.description}</td>
                  <td className="py-3 text-center font-mono">{item.quantity}</td>
                  <td className="py-3 text-right font-mono">₹{item.unitPrice.toLocaleString()}</td>
                  <td className="py-3 text-right font-mono font-bold text-gray-900">
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

      <button
        onClick={handlePrint}
        className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/25 transition-all print:hidden"
      >
        <Printer className="h-4 w-4" />
        <span>Print or Save Invoice as PDF</span>
      </button>
    </div>
  );
};
