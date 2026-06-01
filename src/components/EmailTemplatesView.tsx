import React, { useState, useEffect } from 'react';
import { Mail, Edit2, Check, RefreshCw, AlertCircle, Save, Tag } from 'lucide-react';

export default function EmailTemplatesView() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headers = { 'Authorization': sessionStorage.getItem('admin_token') || '' };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/email-templates', { headers });
      const data = await res.json();
      setTemplates(data || []);
      
      if (data.length > 0) {
        // Set first template as default selected
        setSelectedTemplate(data[0]);
        setEditSubject(data[0].subject);
        setEditBody(data[0].body);
      }
      setError(null);
    } catch (e) {
      setError('Failed fetching email templates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleTemplateSelect = (temp: any) => {
    setSelectedTemplate(temp);
    setEditSubject(temp.subject);
    setEditBody(temp.body);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/email-templates/${selectedTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ subject: editSubject, body: editBody })
      });

      const updated = await res.json();
      if (!res.ok) throw new Error(updated.error || 'Failed saving.');

      // Refresh list
      alert(`Email template "${selectedTemplate.name}" updated successfully in database file! Dispatched mails will consume this content immediately.`);
      fetchTemplates();
    } catch (e: any) {
      alert(e.message || 'Error occurred saving template.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6" id="email_templates_view">
      {/* View Header */}
      <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Mail className="h-6 w-6 text-blue-600" /> Dynamic Notification Mail Templates
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Modify corporate email alerts, adjust custom headers, and establish dynamic mail variables.
          </p>
        </div>
        <button 
          onClick={fetchTemplates}
          className="p-1.5 border hover:bg-gray-50 rounded text-gray-500 transition"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm font-semibold text-gray-400">Loading email designs...</div>
      ) : error ? (
        <div className="p-12 text-center text-sm text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-semibold">
          
          {/* Left Column: Selector list */}
          <div className="md:col-span-1 space-y-2">
            <div className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400 px-1 py-1">Available Mail triggers</div>
            <div className="bg-white border rounded-lg overflow-hidden shadow-sm divide-y">
              {templates.map((temp) => {
                const isSelected = selectedTemplate?.id === temp.id;
                return (
                  <button
                    key={temp.id}
                    onClick={() => handleTemplateSelect(temp)}
                    className={`w-full text-left px-4 py-3 text-xs font-bold transition flex flex-col gap-1 cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-50 text-blue-800 border-r-4 border-blue-600' 
                        : 'text-gray-700 hover:bg-gray-50 bg-white'
                    }`}
                  >
                    <div className="font-bold text-gray-900">{temp.name}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5 truncate font-medium">{temp.subject}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Edit panel */}
          {selectedTemplate && (
            <div className="md:col-span-2 bg-white rounded-lg border shadow-sm p-6 space-y-4">
              <div className="border-b pb-3.5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold uppercase text-gray-800 tracking-wide">
                    Configure Template Design
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-1 font-medium select-none">Trigger identifier: {selectedTemplate.id}</p>
                </div>
                <div className="text-[10px] text-gray-400">Last updated: {new Date(selectedTemplate.updatedAt).toLocaleDateString()}</div>
              </div>

              {/* Placeholders labels index list */}
              <div className="bg-slate-50 border p-3.5 rounded-lg space-y-1.5">
                <div className="font-extrabold text-[10.5px] uppercase tracking-wider text-slate-700 flex items-center gap-1">
                  <Tag className="h-4 w-4 text-slate-500" />
                  <span>Dynamic Placeholders tags</span>
                </div>
                <p className="text-[10.5px] leading-relaxed text-slate-500 font-medium select-none">Place these tags inside your subjects and templates body. The notifying client handles automated regex value replacements during compilation:</p>
                
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedTemplate.placeholders.map((ph: string) => (
                    <span 
                      key={ph} 
                      className="font-mono font-bold text-[10px] bg-white border border-slate-200 text-blue-600 px-2 py-0.5 rounded shadow-sm select-all cursor-copy"
                      title="Click to copy syntax"
                      onClick={() => {
                        navigator.clipboard.writeText(`{{${ph}}}`);
                      }}
                    >
                      {`{{${ph}}}`}
                    </span>
                  ))}
                </div>
              </div>

              {/* Form edit fields */}
              <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-700 font-extrabold uppercase text-[10px] tracking-wider mb-1">Email Subject Header</label>
                  <input
                    type="text"
                    required
                    className="block w-full border border-gray-300 rounded px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-extrabold uppercase text-[10px] tracking-wider mb-1">Email Body Content</label>
                  <textarea
                    rows={12}
                    required
                    className="block w-full border border-gray-300 rounded p-3 font-mono text-xs leading-relaxed text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    placeholder="Structure template HTML / Plain content here..."
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 text-xs font-semibold pt-2 border-t">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold shadow flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="h-4.5 w-4.5" />
                    <span>{saving ? 'Writing modifications to disk...' : 'Save Template Settings'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
