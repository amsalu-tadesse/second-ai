import React, { useState, useEffect } from 'react';
import { 
  Database, Plus, Edit2, Trash2, Search, RefreshCw, X, 
  Check, PlayCircle, PlusCircle, Calendar, ToggleLeft, ShieldAlert 
} from 'lucide-react';

interface DynamicCrudViewProps {
  modelId: string;
  generatedModels: any[];
}

export default function DynamicCrudView({ modelId, generatedModels }: DynamicCrudViewProps) {
  const [model, setModel] = useState<any | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Forms state
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState<any | null>(null);

  // Dynamic values dict state
  const [inputValues, setInputValues] = useState<Record<string, any>>({});

  const headers = { 'Authorization': sessionStorage.getItem('admin_token') || '' };

  const fetchModelConfigAndRecords = () => {
    const matchedModel = generatedModels.find(m => m.id === modelId);
    if (!matchedModel) return;

    setModel(matchedModel);
    setLoading(true);

    fetch(`/api/crud-generator/records/${modelId}`, { headers })
      .then(res => res.json())
      .then(data => {
        setRecords(data || []);
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchModelConfigAndRecords();
    setShowAddForm(false);
    setShowEditForm(null);
    setInputValues({});
  }, [modelId, generatedModels]);

  const handleInputChange = (fieldName: string, value: any) => {
    setInputValues(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!model) return;

    try {
      const res = await fetch(`/api/crud-generator/records/${modelId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(inputValues)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed inserting database record.');

      setShowAddForm(false);
      setInputValues({});
      fetchModelConfigAndRecords();
    } catch (err: any) {
      alert(err.message || 'Error occurred during validation insertions.');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!model || !showEditForm) return;

    try {
      const res = await fetch(`/api/crud-generator/records/${modelId}/${showEditForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(inputValues)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed updating database record.');

      setShowEditForm(null);
      setInputValues({});
      fetchModelConfigAndRecords();
    } catch (err: any) {
      alert(err.message || 'Error occurred saving updates.');
    }
  };

  const handleDeleteTrigger = async (recId: string) => {
    if (!confirm('Are you sure you want to permanently delete this record from the custom generated database table?')) return;

    try {
      const res = await fetch(`/api/crud-generator/records/${modelId}/${recId}`, {
        method: 'DELETE',
        headers
      });

      if (!res.ok) throw new Error('Delete failed.');
      fetchModelConfigAndRecords();
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (!model) {
    return <div className="p-12 text-center text-sm font-semibold text-gray-400">Loading CRUD template coordinates...</div>;
  }

  // Filter records matching general search value
  const filteredRecords = records.filter(r => {
    const str = JSON.stringify(r.data).toLowerCase();
    return str.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6" id="dynamic_crud_view">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Database className="h-6 w-6 text-emerald-600" /> Scaffold Manager: {model.label}s List
          </h1>
          <p className="text-gray-500 text-sm mt-0.5 font-medium">
            Dynamic CRUD console for Eloquent Model: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded font-bold text-blue-650">{model.name}</span>. Auto scaffolded indexes.
          </p>
        </div>

        <button 
          onClick={() => {
            setInputValues({});
            setShowAddForm(true);
          }}
          className="px-4 py-1.5 bg-emerald-650 hover:bg-emerald-750 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
          id="add_dynamic_record_btn"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          <span>Add {model.label} Record</span>
        </button>
      </div>

      {/* Filter and refresh bar */}
      <div className="bg-white p-4 rounded-lg border shadow-sm flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            placeholder={`Filter ${model.label}s inventory by any value...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <button 
          onClick={fetchModelConfigAndRecords} 
          disabled={loading}
          className="p-1.5 border border-gray-300 hover:bg-gray-100 rounded text-gray-500 transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Database Display Table Grid */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden text-xs text-gray-700">
        {loading ? (
          <div className="p-12 text-center text-sm font-semibold text-gray-400">Scanning dynamically mapped database files...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-sm font-semibold text-gray-400">No database records registered into {model.name} schema table yet. Click Add button above!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 uppercase font-bold border-b text-[10px] tracking-wider select-none">
                  {model.fields.map((f: any) => (
                    <th key={f.name} className="px-5 py-3">{f.label}</th>
                  ))}
                  <th className="px-5 py-3">Created UTC</th>
                  <th className="px-5 py-3 text-center">Settings Trigger</th>
                </tr>
              </thead>
              <tbody className="divide-y font-medium text-gray-750">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50 transition-colors">
                    {model.fields.map((f: any) => {
                      const rawVal = rec.data[f.name];
                      return (
                        <td key={f.name} className="px-5 py-3.5">
                          {f.type === 'boolean' ? (
                            rawVal === true ? (
                              <span className="bg-emerald-50 text-emerald-800 border px-2 py-0.5 rounded font-extrabold text-[9.5px]">YES (TRUE)</span>
                            ) : (
                              <span className="bg-gray-100 text-gray-600 border px-2 py-0.5 rounded font-extrabold text-[9.5px]">NO (FALSE)</span>
                            )
                          ) : f.type === 'date' && rawVal ? (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                              <span>{rawVal}</span>
                            </span>
                          ) : (
                            <span className="font-sans leading-relaxed text-gray-800">{rawVal !== undefined && rawVal !== null ? String(rawVal) : '-'}</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-5 py-3.5 font-mono text-gray-400 whitespace-nowrap">
                      {new Date(rec.createdAt).toISOString().replace('T', ' ').substring(0, 16)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setShowEditForm(rec);
                            setInputValues(rec.data || {});
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Edit Row record"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTrigger(rec.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition"
                          title="Purge Row record"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Row insert modal form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn font-sans text-xs">
          <div className="bg-white rounded-lg shadow-xl border-t-4 border-emerald-600 max-w-md w-full overflow-hidden">
            <div className="px-5 py-4 border-b flex justify-between items-center bg-gray-50 border-b border-gray-150">
              <h3 className="text-sm font-extrabold uppercase text-gray-800 tracking-wide">
                Insert Into table: {model.name}
              </h3>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              {model.fields.map((f: any) => (
                <div key={f.name}>
                  <label className="block text-gray-750 font-bold mb-1.5 flex items-center gap-1.5">
                    <span>{f.label}</span>
                    {f.required && <span className="text-red-500 font-extrabold">*</span>}
                    <span className="font-mono text-[9px] text-gray-400 normal-case font-normal">(as {f.type})</span>
                  </label>

                  {f.type === 'boolean' ? (
                    <div className="flex items-center gap-2 border rounded p-2 bg-gray-50/50">
                      <input 
                        type="checkbox"
                        checked={!!inputValues[f.name]}
                        onChange={(e) => handleInputChange(f.name, e.target.checked)}
                        className="rounded text-emerald-650 h-4.5 w-4.5"
                      />
                      <span className="font-semibold text-gray-600">Flag condition active</span>
                    </div>
                  ) : f.type === 'date' ? (
                    <input 
                      type="date"
                      required={f.required}
                      className="block w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs bg-white text-gray-900"
                      value={inputValues[f.name] || ''}
                      onChange={(e) => handleInputChange(f.name, e.target.value)}
                    />
                  ) : f.type === 'number' ? (
                    <input 
                      type="number"
                      required={f.required}
                      placeholder={`Enter ${f.label}`}
                      className="block w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs bg-white text-gray-900"
                      value={inputValues[f.name] || ''}
                      onChange={(e) => handleInputChange(f.name, e.target.value)}
                    />
                  ) : (
                    <input 
                      type={f.type === 'email' ? 'email' : 'text'}
                      required={f.required}
                      placeholder={`Enter ${f.label}`}
                      className="block w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs bg-white text-gray-900"
                      value={inputValues[f.name] || ''}
                      onChange={(e) => handleInputChange(f.name, e.target.value)}
                    />
                  )}
                </div>
              ))}

              <div className="pt-3 border-t flex justify-end gap-2 font-semibold">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-1.5 border hover:bg-gray-50 rounded text-gray-750 bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow text-xs"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Row update modal form */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn font-sans text-xs">
          <div className="bg-white rounded-lg shadow-xl border-t-4 border-blue-600 max-w-md w-full overflow-hidden">
            <div className="px-5 py-4 border-b flex justify-between items-center bg-gray-50 border-b border-gray-150">
              <h3 className="text-sm font-extrabold uppercase text-gray-800 tracking-wide">
                Update record: {model.name} (Row ID: {showEditForm.id.substring(4, 9)})
              </h3>
              <button onClick={() => setShowEditForm(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              {model.fields.map((f: any) => (
                <div key={f.name}>
                  <label className="block text-gray-750 font-bold mb-1.5 flex items-center gap-1.5">
                    <span>{f.label}</span>
                    {f.required && <span className="text-red-500 font-extrabold">*</span>}
                    <span className="font-mono text-[9px] text-gray-400 normal-case font-normal">(as {f.type})</span>
                  </label>

                  {f.type === 'boolean' ? (
                    <div className="flex items-center gap-2 border rounded p-2 bg-gray-50/50">
                      <input 
                        type="checkbox"
                        checked={!!inputValues[f.name]}
                        onChange={(e) => handleInputChange(f.name, e.target.checked)}
                        className="rounded text-blue-550 h-4.5 w-4.5"
                      />
                      <span className="font-semibold text-gray-600">Flag condition active</span>
                    </div>
                  ) : f.type === 'date' ? (
                    <input 
                      type="date"
                      required={f.required}
                      className="block w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs bg-white text-gray-900"
                      value={inputValues[f.name] || ''}
                      onChange={(e) => handleInputChange(f.name, e.target.value)}
                    />
                  ) : f.type === 'number' ? (
                    <input 
                      type="number"
                      required={f.required}
                      placeholder={`Enter ${f.label}`}
                      className="block w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs bg-white text-gray-900"
                      value={inputValues[f.name] || ''}
                      onChange={(e) => handleInputChange(f.name, e.target.value)}
                    />
                  ) : (
                    <input 
                      type={f.type === 'email' ? 'email' : 'text'}
                      required={f.required}
                      placeholder={`Enter ${f.label}`}
                      className="block w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs bg-white text-gray-900"
                      value={inputValues[f.name] || ''}
                      onChange={(e) => handleInputChange(f.name, e.target.value)}
                    />
                  )}
                </div>
              ))}

              <div className="pt-3 border-t flex justify-end gap-2 font-semibold">
                <button
                  type="button"
                  onClick={() => setShowEditForm(null)}
                  className="px-4 py-1.5 border hover:bg-gray-50 rounded text-gray-755 bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded shadow text-xs"
                >
                  Commit Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
