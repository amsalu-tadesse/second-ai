import { useState, useEffect } from 'react';
import { 
  FileText, Search, RefreshCw, AlertTriangle, CheckCircle, Clock, 
  MapPin, User, Tag, Eye, ShieldAlert, SlidersHorizontal 
} from 'lucide-react';

export default function AuditsView() {
  const [logs, setLogs] = useState<any[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [filteredLogs, setFilteredLogs] = useState(0);
  const [loading, setLoading] = useState(true);

  // Yajra DataTable states
  const [draw, setDraw] = useState(1);
  const [start, setStart] = useState(0);
  const [length, setLength] = useState(10);
  const [search, setSearch] = useState('');

  // Sorting definitions
  const [sortColIndex, setSortColIndex] = useState(0); // Index 0: timestamp
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Custom filter states
  const [entityFilter, setEntityFilter] = useState('');

  const headers = { 'Authorization': sessionStorage.getItem('admin_token') || '' };

  const fetchYajraLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/datatables/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          draw,
          start,
          length,
          search: { value: search },
          order: [{ column: sortColIndex, dir: sortDir }]
        })
      });

      const yData = await res.json();
      setLogs(yData.data || []);
      setTotalLogs(yData.recordsTotal || 0);
      setFilteredLogs(yData.recordsFiltered || 0);
    } catch (e) {
      console.error('Yajra activity logs error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYajraLogs();
  }, [start, length, search, sortColIndex, sortDir, draw]);

  const handleSortToggle = (colIndex: number) => {
    if (sortColIndex === colIndex) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColIndex(colIndex);
      setSortDir('asc');
    }
    setDraw(prev => prev + 1);
  };

  // Filter dynamic logs further by entity if selected
  const viewableLogs = entityFilter 
    ? logs.filter(l => l.entity === entityFilter)
    : logs;

  const totalPages = Math.ceil(filteredLogs / length);
  const activePage = Math.floor(start / length) + 1;

  return (
    <div className="space-y-6" id="audits_view">
      {/* View Header */}
      <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-600" /> Active System Audits & Activity Logs
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Examine systemic operations audits, user credential sessions, and auto-generated action logs.
          </p>
        </div>

        <button 
          onClick={() => {
            setDraw(prev => prev + 1);
            fetchYajraLogs();
          }}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs flex items-center gap-1 cursor-pointer shadow transition"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Audits Feed</span>
        </button>
      </div>

      {/* Grid Settings Filter control row */}
      <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        
        {/* Record count per Page dropdown */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 px-2.5 py-1 border rounded bg-gray-50 font-bold text-gray-700">
            <SlidersHorizontal className="h-4 w-4 text-gray-400" />
            <span>Show Grid limit:</span>
            <select 
              className="outline-none border-none bg-transparent"
              value={length}
              onChange={(e) => {
                setLength(parseInt(e.target.value));
                setStart(0);
                setDraw(prev => prev + 1);
              }}
            >
              <option value={10}>10 items</option>
              <option value={25}>25 items</option>
              <option value={50}>50 items</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 font-bold text-gray-700">
            <span>Filter Module:</span>
            <select 
              className="border border-gray-300 rounded px-2.5 py-1 bg-white font-bold text-xs"
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
            >
              <option value="">-- All Units --</option>
              <option value="auth">Security/Auth</option>
              <option value="user">User Directory</option>
              <option value="project">Project Boards</option>
              <option value="department">Departments</option>
              <option value="role">Roles Matrix</option>
              <option value="system">Scaffold Code-Gen</option>
            </select>
          </div>
        </div>

        {/* Global Yajra filter search input */}
        <div className="relative max-w-sm w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            placeholder="Type query to filter logs. Search server-side..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setStart(0);
              setDraw(prev => prev + 1);
            }}
          />
        </div>

      </div>

      {/* Main Audit Log Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden text-xs text-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase font-bold border-b text-[10px] tracking-wider select-none">
                <th className="px-5 py-3 cursor-pointer hover:bg-gray-200 transition" onClick={() => handleSortToggle(0)}>
                  Timestamp UTC {sortColIndex === 0 && (sortDir === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-5 py-3 cursor-pointer hover:bg-gray-200 transition" onClick={() => handleSortToggle(1)}>
                  Account User {sortColIndex === 1 && (sortDir === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-5 py-3 cursor-pointer hover:bg-gray-200 transition" onClick={() => handleSortToggle(2)}>
                  Action Type {sortColIndex === 2 && (sortDir === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-5 py-3 cursor-pointer hover:bg-gray-200 transition" onClick={() => handleSortToggle(3)}>
                  Entity Target {sortColIndex === 3 && (sortDir === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-5 py-3 cursor-pointer hover:bg-gray-200 transition" onClick={() => handleSortToggle(4)}>
                  Audit Details / Changes Details {sortColIndex === 4 && (sortDir === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-5 py-3 cursor-pointer hover:bg-gray-200 transition" onClick={() => handleSortToggle(5)}>
                  Client IP {sortColIndex === 5 && (sortDir === 'asc' ? '▲' : '▼')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y font-medium text-gray-750">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-sm font-semibold text-gray-400">Yajra scanning log registers...</td>
                </tr>
              ) : viewableLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-sm font-semibold text-gray-400">No audits found matching parameters.</td>
                </tr>
              ) : (
                viewableLogs.map((log) => {
                  let badgeClr = 'bg-gray-100 text-gray-700 border-gray-200';
                  if (log.type === 'success') badgeClr = 'bg-emerald-50 text-emerald-800 border-emerald-100';
                  if (log.type === 'warning') badgeClr = 'bg-amber-50 text-amber-800 border-amber-100';
                  if (log.type === 'danger') badgeClr = 'bg-red-50 text-red-800 border-red-100';

                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-gray-500 whitespace-nowrap">
                        {new Date(log.timestamp).toISOString().replace('T', ' ').substring(0, 19)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="flex items-center gap-1 font-bold text-gray-900">
                          <User className="h-3.5 w-3.5 text-gray-400" />
                          <span>{log.username}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${badgeClr}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide uppercase border">
                          {log.entity}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 max-w-sm break-words leading-relaxed text-gray-800">
                        {log.details}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-gray-550 flex items-center gap-1 whitespace-nowrap">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span>{log.ipAddress}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Yajra Pagination statistics bar footer */}
        <div className="px-5 py-3 bg-gray-50 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[11px] text-gray-500 font-medium">
          <div>
            Showing <span className="font-bold text-gray-800">{filteredLogs === 0 ? 0 : start + 1}</span> to{' '}
            <span className="font-bold text-gray-800">{Math.min(start + length, filteredLogs)}</span> of{' '}
            <span className="font-bold text-gray-800">{filteredLogs}</span> records{' '}
            {filteredLogs !== totalLogs && (
              <span>(filtered from <span className="font-bold text-gray-800">{totalLogs}</span> total database entries)</span>
            )}
          </div>

          {/* Pagination buttons */}
          <div className="flex items-center gap-1">
            <button
              disabled={start === 0}
              onClick={() => setStart(prev => Math.max(0, prev - length))}
              className="px-2.5 py-1 border hover:bg-gray-150 rounded text-gray-550 bg-white font-bold text-[10px] uppercase transition disabled:opacity-50"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }).slice(0, 5).map((_, idx) => {
              const pageNum = idx + 1;
              const isSelected = pageNum === activePage;
              return (
                <button
                  key={idx}
                  onClick={() => setStart(idx * length)}
                  className={`px-3 py-1 border rounded font-mono font-bold text-[10.5px] transition ${
                    isSelected 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'hover:bg-gray-100 bg-white text-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              disabled={start + length >= filteredLogs}
              onClick={() => setStart(prev => prev + length)}
              className="px-2.5 py-1 border hover:bg-gray-150 rounded text-gray-550 bg-white font-bold text-[10px] uppercase transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
