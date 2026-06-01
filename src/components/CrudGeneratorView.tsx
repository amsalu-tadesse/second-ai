import React, { useState, useEffect } from 'react';
import { 
  Code, Plus, Trash2, Cpu, CheckCircle, FileCode, CheckSquare, 
  Terminal, Layers, RefreshCw, Copy, Check, Download 
} from 'lucide-react';

interface CrudField {
  name: string;
  type: 'text' | 'number' | 'date' | 'email' | 'boolean';
  required: boolean;
  label: string;
}

interface CrudGeneratorViewProps {
  onModelCreated: () => void;
  generatedModels: any[];
}

export default function CrudGeneratorView({ onModelCreated, generatedModels }: CrudGeneratorViewProps) {
  const [modelName, setModelName] = useState('');
  const [modelLabel, setModelLabel] = useState('');
  
  // Dynamic fields lists
  const [fields, setFields] = useState<CrudField[]>([
    { name: 'title', type: 'text', required: true, label: 'Title' }
  ]);

  const [loading, setLoading] = useState(false);
  const [justGeneratedModel, setJustGeneratedModel] = useState<any | null>(null);

  // Active view tab for the code renderer
  const [activeCodeTab, setActiveCodeTab] = useState<'controller' | 'model' | 'view' | 'route' | 'migration'>('controller');
  const [copied, setCopied] = useState(false);

  // Auto-fill template options for quick testing
  const quickTemplates = [
    {
      name: 'Task',
      label: 'Core Project Tasks',
      fields: [
        { name: 'task_title', type: 'text', required: true, label: 'Task Name' },
        { name: 'priority_order', type: 'number', required: true, label: 'Priority Order' },
        { name: 'due_date', type: 'date', required: false, label: 'Due Date UTC' },
        { name: 'assignee_email', type: 'email', required: true, label: 'Assignee Email' },
        { name: 'is_approved', type: 'boolean', required: true, label: 'Approved & Signed' }
      ]
    },
    {
      name: 'Invoice',
      label: 'Corporate Bilings',
      fields: [
        { name: 'client_name', type: 'text', required: true, label: 'Client Name' },
        { name: 'amount_usd', type: 'number', required: true, label: 'Invoice Amount ($)' },
        { name: 'billing_date', type: 'date', required: false, label: 'Issued Date' },
        { name: 'support_email', type: 'email', required: false, label: 'Billing Support' },
        { name: 'is_paid', type: 'boolean', required: true, label: 'Settled' }
      ]
    }
  ];

  const handleApplyQuickTemplate = (tmpl: any) => {
    setModelName(tmpl.name);
    setModelLabel(tmpl.label);
    setFields(tmpl.fields);
  };

  const handleAddField = () => {
    setFields(prev => [...prev, { name: '', type: 'text', required: false, label: '' }]);
  };

  const handleRemoveField = (idx: number) => {
    if (fields.length <= 1) return alert('Your scaffold needs at least one database field!');
    setFields(prev => prev.filter((_, i) => i !== idx));
  };

  const handleFieldChange = (idx: number, key: keyof CrudField, val: any) => {
    setFields(prev => prev.map((f, i) => {
      if (i !== idx) return f;
      return { ...f, [key]: val };
    }));
  };

  const handleGenerateScaffold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelName) return alert('Model name required!');
    
    // Validate field fields
    for (const f of fields) {
      if (!f.name || !f.label) return alert('Each property name and property label must be filled!');
      if (!/^[a-z_][a-z0-9_]*$/.test(f.name)) {
        return alert(`Field property name "${f.name}" contains invalid characters. Use lowercase Letters, Numbers, and underscores (e.g. task_title, due_date).`);
      }
    }

    try {
      setLoading(true);
      const res = await fetch('/api/crud-generator/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionStorage.getItem('admin_token') || ''
        },
        body: JSON.stringify({
          name: modelName,
          label: modelLabel || modelName,
          fields
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generative compiler error.');

      setJustGeneratedModel(data);
      alert(`CRUD Scaffold engine successfully compiled. Eloquent routes Registered and live database instances allocated!`);
      
      // Notify parent sidebar structure to refresh
      onModelCreated();
    } catch (err: any) {
      alert(err.message || 'Error compiling code blocks');
    } finally {
      setLoading(false);
    }
  };

  const getCodeString = () => {
    if (!justGeneratedModel) return '';
    switch (activeCodeTab) {
      case 'controller': return justGeneratedModel.controllerCode;
      case 'model': return justGeneratedModel.modelCode;
      case 'view': return justGeneratedModel.viewCode;
      case 'route': return justGeneratedModel.routeCode;
      case 'migration': return justGeneratedModel.migrationCode;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6" id="crud_generator_view">
      {/* View Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Cpu className="h-6 w-6 text-indigo-600" /> Interactive Enterprise CRUD Scaffold Maker
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Scaffold full-featured Laravel 10 frameworks! Enter schema parameters to generate Models, Yajra Controllers, blade templates, migrations, and routes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs font-semibold">
        
        {/* Left Column: Build Form */}
        <div className="bg-white rounded-lg border shadow-sm p-6 space-y-4">
          <div className="border-b pb-3.5 flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase text-gray-800 tracking-wide flex items-center gap-1.5">
              <Terminal className="h-4.5 w-4.5 text-blue-600" /> Scaffold Compiler Form
            </h3>
            
            {/* Quick pre-sets */}
            <div className="flex items-center gap-1.5 font-bold text-gray-750">
              <span className="text-[10px] text-gray-400">Apply Preset:</span>
              {quickTemplates.map(tmpl => (
                <button
                  key={tmpl.name}
                  onClick={() => handleApplyQuickTemplate(tmpl)}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded text-[10px] transition cursor-pointer"
                >
                  {tmpl.name}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleGenerateScaffold} className="space-y-4">
            
            {/* Schema names */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-750 font-bold mb-1">Model Class Name (CamelCase)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AssetWarranty"
                  className="block w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans text-xs bg-white text-gray-900"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value.replace(/[^a-zA-Z]/g, ''))} // Strictly characters
                />
                <p className="text-[10px] text-gray-400 mt-1">Laravel: <span className="font-mono text-gray-650">{modelName ? `App\\Models\\${modelName}` : 'App\\Models\\Model'}</span></p>
              </div>

              <div>
                <label className="block text-gray-750 font-bold mb-1">Human-friendly Menu Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Device Warranties"
                  className="block w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans text-xs bg-white text-gray-900"
                  value={modelLabel}
                  onChange={(e) => setModelLabel(e.target.value)}
                />
                <p className="text-[10px] text-gray-400 mt-1">Menu tab visible display text</p>
              </div>
            </div>

            {/* Dynamic fields block */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-1.5 text-gray-650 uppercase font-extrabold tracking-wider text-[10px]">
                <span>Database Schema Properties (Columns)</span>
                <button
                  type="button"
                  onClick={handleAddField}
                  className="text-blue-600 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Column
                </button>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {fields.map((field, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 border rounded-lg flex flex-col gap-2 relative">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 items-end">
                      
                      {/* Sub Column 1: Field name on disk */}
                      <div className="md:col-span-1.5">
                        <label className="block text-gray-500 font-bold text-[10px] mb-1">Column Key Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. amount_usd"
                          className="block w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-[10.5px] bg-white text-gray-900"
                          value={field.name}
                          onChange={(e) => handleFieldChange(idx, 'name', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        />
                      </div>

                      {/* Sub Column 2: User-friendly Label */}
                      <div className="md:col-span-1.5">
                        <label className="block text-gray-500 font-bold text-[10px] mb-1">Visuble Property Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Price USD"
                          className="block w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-[10.5px] bg-white text-gray-900"
                          value={field.label}
                          onChange={(e) => handleFieldChange(idx, 'label', e.target.value)}
                        />
                      </div>

                      {/* Sub Column 3: Data type */}
                      <div>
                        <label className="block text-gray-500 font-bold text-[10px] mb-1">Property Type</label>
                        <select
                          className="block w-full border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-[10.5px] bg-white"
                          value={field.type}
                          onChange={(e) => handleFieldChange(idx, 'type', e.target.value)}
                        >
                          <option value="text">VARCHAR (String)</option>
                          <option value="number">INT (Number)</option>
                          <option value="date">DATE (Timestamp)</option>
                          <option value="email">EMAIL (Contact)</option>
                          <option value="boolean">BOOLEAN (Flag)</option>
                        </select>
                      </div>

                      {/* Remove item button */}
                      <div className="flex items-center justify-between pb-1.5">
                        <label className="flex items-center gap-1.5 font-bold text-gray-500 cursor-pointer text-[10px]">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => handleFieldChange(idx, 'required', e.target.checked)}
                            className="rounded text-blue-550 h-3.5 w-3.5"
                          />
                          <span>Required</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => handleRemoveField(idx)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-extrabold uppercase shadow tracking-wider text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" /> Compiling Laravel MVC files...
                  </span>
                ) : (
                  <>
                    <Cpu className="h-4.5 w-4.5" />
                    <span>Run Generative Scaffolding</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Code viewer displaying generated blueprints */}
        <div className="bg-slate-900 text-slate-100 rounded-lg shadow-xl p-6 flex flex-col justify-between overflow-hidden border border-slate-800">
          <div>
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-400"></div>
                <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span className="text-xs text-slate-400 font-mono font-bold ml-2">Laravel Code-Gen Workspace</span>
              </div>
              
              {justGeneratedModel && (
                <button
                  onClick={handleCopyCode}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded text-[10px] flex items-center gap-1 transition"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied blueprint!' : 'Copy Code'}</span>
                </button>
              )}
            </div>

            {!justGeneratedModel ? (
              <div className="p-12 text-center text-slate-500 font-mono space-y-3">
                <FileCode className="h-12 w-12 text-slate-700 mx-auto" />
                <p>Scaffold blueprints aren't compiled yet.</p>
                <p className="text-[10px] text-slate-600">Enter parameters and click "Run Generative Scaffolding" to dynamically compile routes, controllers, views, schemas, and migrations.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* File tab selection */}
                <div className="flex flex-wrap gap-1 border-b border-slate-800 pb-1 mt-3">
                  {(['controller', 'model', 'view', 'route', 'migration'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveCodeTab(tab)}
                      className={`px-3 py-1.5 rounded-t text-[10px] font-mono font-bold transition uppercase ${
                        activeCodeTab === tab 
                          ? 'bg-slate-800 text-indigo-300 border-b-2 border-indigo-500' 
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {tab === 'controller' && 'Controller.php'}
                      {tab === 'model' && 'Model.php'}
                      {tab === 'view' && 'index.blade.php'}
                      {tab === 'route' && 'routes.php'}
                      {tab === 'migration' && 'migration.php'}
                    </button>
                  ))}
                </div>

                <div className="bg-slate-950 rounded p-4 border border-slate-800/80 max-h-96 overflow-y-auto">
                  <pre className="font-mono text-[10.5px] leading-relaxed text-slate-300 whitespace-pre">
                    <code>{getCodeString()}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>

          {justGeneratedModel && (
            <div className="mt-4 p-3 bg-indigo-950 border border-indigo-905 rounded text-[10.5px] leading-relaxed text-indigo-300 font-medium">
              <strong>Active Pipeline Binding:</strong> The Express server has dynamically registered database routers for <span className="font-mono font-bold text-[#fed7aa]">{`"${justGeneratedModel.name}"`}</span>. A new responsive control grid is available on the left sidebar for instant use! No manual deployment required.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
