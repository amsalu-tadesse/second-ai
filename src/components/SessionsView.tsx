import { useState, useEffect } from 'react';
import { Database, Search, ShieldX, RefreshCw, Layers, Monitor, MapPin, Calendar, Clock } from 'lucide-react';

export default function SessionsView() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filteredRecords, setFilteredRecords] = useState(0);
  const [loading, setLoading] = useState(true);

  // Yajra standard pagination request states
  const [draw, setDraw] = useState(1);
  const [start, setStart] = useState(0);
  const [length, setLength] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  
  // Sort state (Yajra: order[0].column, order[0].dir)
  const [sortColIndex, setSortColIndex] = useState(3); // Default index 3: loginTime
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const headers = { 'Authorization': sessionStorage.getItem('admin_token') || '' };

  const fetchYajraSessions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/datatables/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          draw,
          start,
          length,
          search: { value: searchValue },
          order: [{ column: sortColIndex, dir: sortDir }]
        })
      });

      const yData = await res.json();
      setSessions(yData.data || []);
      setTotalRecords(yData.recordsTotal || 0);
      setFilteredRecords(yData.recordsFiltered || 0);
    } catch (e) {
      console.error('Yajra sessions fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYajraSessions();
  }, [start, length, searchValue, sortColIndex, sortDir, draw]);

  const handleTerminateSession = async (sessId: string, username: string) => {
    if (!confirm(`Force-kill authorization session for active user "${username}"?`)) return;

    try {
      const res = await fetch(`/api/sessions/${sessId}`, {
        method: 'DELETE',
        headers
      });

      if (!res.ok) throw new Error('Failed termination.');
      
      // Bump draw index and rebuild Yajra Grid
      setDraw(prev => prev + 1);
      fetchYajraSessions();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSortToggle = (colIndex: number) => {
    if (sortColIndex === colIndex) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColIndex(colIndex);
      setSortDir('asc');
    }
    setDraw(prev => prev + 1);
  };

  const paginationPagesCount = Math.ceil(filteredRecords / length);
  const currentActivePage = Math.floor(start / length) + 1;

  return (
    <div className="space-y-6" id="sessions_view">
      {/* View Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Database className="h-6 w-6 text-emerald-500" /> Yajra Server-Side Sessions Grid
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Auditing active authorization heartbeats. Queries are computed, paged, and sorted completely server-side.
        </p>
      </div>

      {/* Control row with Search and Limit Filter */}
      <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        
        {/* Record count per Page dropdown */}
        <div className="flex items-center gap-2 text-xs text-gray-650">
          <span>Show</span>
          <select 
            className="border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-bold"
            value={length}
            onChange={(e) => {
              setLength(parseInt(e.target.value));
              setStart(0);
              setDraw(prev => prev + 1);
            }}
          >
            <option value={5}>5 records</option>
            <option value={10}>10 records</option>
            <option value={20}>20 records</option>
          </select>
          <span>entries matching criteria</span>
        </div>

        {/* Global Yajra Filter Trigger */}
        <div className="flex items-center gap-2">
          <div className="relative max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Search sessions index..."
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setStart(0);
                setDraw(prev => prev + 1);
              }}
            />
          </div>
          
          <button 
            onClick={() => {
              setDraw(prev => prev + 1);
              fetchYajraSessions();
            }}
            className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 text-gray-500 transition cursor-pointer"
            title="Refresh Yajra Session DB"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

      </div>

      {/* Server side Yajra Table layout */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden text-xs text-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase font-bold border-b text-[10px] tracking-wider select-none">
                <th className="px-5 py-3 cursor-pointer hover:bg-gray-200 transition" onClick={() => handleSortToggle(0)}>
                  Personnel Account {sortColIndex === 0 && (sortDir === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-5 py-3 cursor-pointer hover:bg-gray-200 transition" onClick={() => handleSortToggle(1)}>
                  IP Connection Protocol {sortColIndex === 1 && (sortDir === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-5 py-3 cursor-pointer hover:bg-gray-200 transition" onClick={() => handleSortToggle(2)}>
                  Environment / Agent {sortColIndex === 2 && (sortDir === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-5 py-3 cursor-pointer hover:bg-gray-200 transition" onClick={() => handleSortToggle(3)}>
                  Login Time UTC {sortColIndex === 3 && (sortDir === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-5 py-3 text-center">Diagnostics</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-sm font-semibold text-gray-400">Yajra scanning active memory index...</td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-sm font-semibold text-gray-400">No active login heartbeats to display.</td>
                </tr>
              ) : (
                sessions.map((sess) => (
                  <tr key={sess.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="h-2 w-2 rounded-full pulse-active bg-emerald-500"></span>
                        <div>
                          <div className="font-extrabold text-gray-900 leading-tight">{sess.name}</div>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">@{sess.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-gray-650 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                      <span>{sess.ipAddress}</span>
                    </td>
                    <td className="px-5 py-3.5 font-sans text-gray-500 max-w-xs truncate" title={sess.userAgent}>
                      <span className="flex items-center gap-1.5">
                        <Monitor className="h-4 w-4 text-gray-400 shrink-0" />
                        <span className="truncate">{sess.userAgent}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <span>{new Date(sess.loginTime).toISOString().replace('T', ' ').substring(0, 19)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => handleTerminateSession(sess.id, sess.username)}
                        className="px-2.5 py-1 text-[10px] font-bold text-red-650 rounded border border-red-200 hover:bg-red-50 transition flex items-center gap-1 mx-auto shrink-0 cursor-pointer"
                        title="Force lock account session"
                      >
                        <ShieldX className="h-3.5 w-3.5" />
                        <span>Kill</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Yajra Pagination statistics bar footer */}
        <div className="px-5 py-3 bg-gray-50 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[11px] text-gray-500 font-medium">
          <div>
            Showing <span className="font-bold text-gray-800">{filteredRecords === 0 ? 0 : start + 1}</span> to{' '}
            <span className="font-bold text-gray-800">{Math.min(start + length, filteredRecords)}</span> of{' '}
            <span className="font-bold text-gray-800">{filteredRecords}</span> records{' '}
            {filteredRecords !== totalRecords && (
              <span>(filtered from <span className="font-bold text-gray-800">{totalRecords}</span> total database entries)</span>
            )}
          </div>

          {/* Interactive Paginated Triggers */}
          <div className="flex items-center gap-1">
            <button
              disabled={start === 0}
              onClick={() => setStart(prev => Math.max(0, prev - length))}
              className="px-2.5 py-1 border hover:bg-gray-100 rounded text-gray-500 bg-white font-bold text-[10px] uppercase transition disabled:opacity-50"
            >
              Previous
            </button>
            
            {Array.from({ length: paginationPagesCount }).map((_, idx) => {
              const pageNum = idx + 1;
              const isSelected = pageNum === currentActivePage;
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
              disabled={start + length >= filteredRecords}
              onClick={() => setStart(prev => prev + length)}
              className="px-2.5 py-1 border hover:bg-gray-100 rounded text-gray-500 bg-white font-bold text-[10px] uppercase transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
