import { useState, useEffect } from 'react';
import { 
  Users, Database, Building2, Cpu, Activity, TrendingUp, CheckCircle, 
  Clock, AlertTriangle, Play, FolderKanban
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, Cell, PieChart, Pie
} from 'recharts';

interface DashboardViewProps {
  user: any;
  onNavigate: (tab: string) => void;
}

export default function DashboardView({ user, onNavigate }: DashboardViewProps) {
  const [stats, setStats] = useState({
    dbSize: 0,
    userCount: 0,
    deptCount: 0,
    projectCount: 0,
    activeSessions: 0,
    customCrudCount: 0,
    logsCount: 0
  });
  const [logs, setLogs] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const headers = { 'Authorization': sessionStorage.getItem('admin_token') || '' };
      
      // Fetch stats
      const rStats = await fetch('/api/sys/stats', { headers });
      const statsData = await rStats.json();
      
      // Fetch latest logs
      const rLogs = await fetch('/api/datatables/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ start: 0, length: 5 }),
      });
      const logsData = await rLogs.json();

      // Fetch projects
      const rProjects = await fetch('/api/projects', { headers });
      const pData = await rProjects.json();

      setStats(statsData);
      setLogs(logsData.data || []);
      setProjects(pData || []);
    } catch (e) {
      console.error('Error fetching dashboard records', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Refresh stats every 10 seconds for real-time analytics effect
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Prepare dummy/analytical chart summaries matching current environment
  const roleChartData = [
    { name: 'Administrators', count: 1, fill: '#3b82f6' },
    { name: 'Project Managers', count: 2, fill: '#eab308' },
    { name: 'Members', count: stats.userCount > 3 ? stats.userCount - 3 : 2, fill: '#10b981' }
  ];

  const historicalActivity = [
    { hour: '09:00', actions: 12 },
    { hour: '11:00', actions: 26 },
    { hour: '13:00', actions: 19 },
    { hour: '15:00', actions: stats.logsCount > 10 ? stats.logsCount : 35 },
    { hour: '17:00', actions: 14 }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-semibold">Completed</span>;
      case 'active': return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-semibold">Developing</span>;
      case 'on-hold': return <span className="bg-yellow-105 text-yellow-800 text-xs px-2 py-0.5 rounded-full font-semibold">On Hold</span>;
      default: return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full font-semibold">Planning</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 min-h-[400px]">
        <div className="relative flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="text-sm font-semibold text-gray-500 mt-4 h-6">Interrogating systems cluster...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="dashboard_view">
      {/* Overview Headings */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span className="text-blue-600 font-extrabold">Control</span> Panel Analytics
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Real-time audit overview, Yajra datatables heartbeat, and role-based assignments.
          </p>
        </div>
        
        <button 
          onClick={fetchDashboardData}
          className="mt-3 sm:mt-0 px-4 py-1.5 border border-gray-300 text-xs font-bold rounded bg-white hover:bg-gray-50 text-gray-700 flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Activity className="h-4 w-4 pulse-active text-emerald-500" />
          <span>Active Pull Sync</span>
        </button>
      </div>

      {/* AdminLTE classic bento stats info boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Info Box 1 */}
        <div 
          onClick={() => onNavigate('users')}
          className="bg-white p-5 rounded-lg border-b-4 border-blue-500 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-all duration-200"
        >
          <div className="space-y-1">
            <div className="text-2xl font-bold font-mono text-gray-900">{stats.userCount}</div>
            <div className="text-xs uppercase font-extrabold tracking-wide text-gray-400">Total Directory Users</div>
          </div>
          <div className="p-3.5 rounded-full bg-blue-50 text-blue-650 h-12 w-12 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Info Box 2 */}
        <div 
          onClick={() => onNavigate('sessions')}
          className="bg-white p-5 rounded-lg border-b-4 border-emerald-500 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-all duration-200"
        >
          <div className="space-y-1">
            <div className="text-2xl font-bold font-mono text-gray-900">{stats.activeSessions}</div>
            <div className="text-xs uppercase font-extrabold tracking-wide text-gray-400">Yajra Active Sessions</div>
          </div>
          <div className="p-3.5 rounded-full bg-emerald-50 text-emerald-650 h-12 w-12 flex items-center justify-center">
            <Database className="h-6 w-6 text-emerald-500" />
          </div>
        </div>

        {/* Info Box 3 */}
        <div 
          onClick={() => onNavigate('projects')}
          className="bg-white p-5 rounded-lg border-b-4 border-yellow-500 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-all duration-200"
        >
          <div className="space-y-1">
            <div className="text-2xl font-bold font-mono text-gray-900">{stats.deptCount}</div>
            <div className="text-xs uppercase font-extrabold tracking-wide text-gray-400">Enterprise Departments</div>
          </div>
          <div className="p-3.5 rounded-full bg-yellow-50 text-yellow-600 h-12 w-12 flex items-center justify-center">
            <Building2 className="h-6 w-6" />
          </div>
        </div>

        {/* Info Box 4 */}
        <div 
          onClick={() => onNavigate('crud-generator')}
          className="bg-white p-5 rounded-lg border-b-4 border-red-500 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-all duration-200"
        >
          <div className="space-y-1">
            <div className="text-2xl font-bold font-mono text-gray-900">{stats.customCrudCount}</div>
            <div className="text-xs uppercase font-extrabold tracking-wide text-gray-400">Custom Scaffolded CRUDs</div>
          </div>
          <div className="p-3.5 rounded-full bg-red-50 text-red-650 h-12 w-12 flex items-center justify-center">
            <Cpu className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* Analytics Charts & Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dynamic Analytics Plot Left */}
        <div className="bg-white rounded-lg border shadow-sm p-5 lg:col-span-2">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h3 className="text-sm font-bold uppercase text-gray-800 tracking-wide flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-blue-600" /> Activity Heartbeat Volume (Mocked Real-time)
            </h3>
            <span className="text-[10px] bg-blue-105 text-blue-699 font-bold px-2 py-0.5 rounded font-mono">24h System Span</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalActivity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="actions" stroke="#2563eb" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Role Distribution pie chart Right */}
        <div className="bg-white rounded-lg border shadow-sm p-5">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h3 className="text-sm font-bold uppercase text-gray-800 tracking-wide flex items-center gap-1.5">
              <Cpu className="h-4.5 w-4.5 text-blue-600" /> Directory Structure
            </h3>
            <span className="text-[10.5px] font-semibold text-gray-400">User breakdown</span>
          </div>

          <div className="h-64 flex flex-col justify-between">
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {roleChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend indexes */}
            <div className="space-y-1 text-xs">
              {roleChartData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-gray-600 font-semibold">
                    <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: item.fill }}></span>
                    <span>{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-gray-800">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Projects tracking, departments & recent audit activities split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active Projects Tracker list */}
        <div className="bg-white rounded-lg border shadow-sm p-5">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h3 className="text-sm font-bold uppercase text-gray-800 tracking-wide flex items-center gap-1.5">
              <FolderKanban className="h-4.5 w-4.5 text-blue-600" /> Enterprise Departments & Projects
            </h3>
            <button 
              onClick={() => onNavigate('projects')}
              className="text-xs text-blue-600 hover:underline font-bold"
            >
              Add Project
            </button>
          </div>

          <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
            {projects.length === 0 ? (
              <p className="text-sm text-gray-500 italic py-4 text-center">No projects in any department. Add one!</p>
            ) : (
              projects.map((project) => (
                <div key={project.id} className="p-3.5 bg-gray-50 border rounded-lg hover:border-gray-300 transition-all">
                  <div className="flex items-start justify-between gap-1.5">
                    <div>
                      <h4 className="text-sm font-bold text-gray-800 leading-snug">{project.name}</h4>
                      <p className="text-xs text-gray-400 mt-0.5 uppercase font-extrabold tracking-wide">{project.departmentName}</p>
                    </div>
                    {getStatusBadge(project.status)}
                  </div>
                  
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2">{project.description || 'No description designated.'}</p>
                  
                  <div className="border-t border-gray-100 my-2 pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] text-gray-500">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-gray-400">Assigned PM:</span>
                      <span className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded truncate max-w-44 block">
                        {project.managerName}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-400">Members assigned:</span>{' '}
                      <span className="font-mono font-bold text-gray-700 bg-gray-100 px-1 py-0.5 rounded">{project.memberIds.length}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Real-time Pulser Auditing Log feed */}
        <div className="bg-white rounded-lg border shadow-sm p-5">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h3 className="text-sm font-bold uppercase text-gray-800 tracking-wide flex items-center gap-1.5">
              <Activity className="h-4.5 w-4.5 text-blue-600" /> Recent Active System Audits
            </h3>
            <button 
              onClick={() => onNavigate('audits')}
              className="text-xs text-blue-600 hover:underline font-bold"
            >
              Interactive Log Index
            </button>
          </div>

          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <p className="text-sm text-gray-500 italic py-4 text-center">No system audits captured yet.</p>
            ) : (
              logs.map((log) => {
                let badgeClr = 'bg-gray-100 text-gray-800 border-gray-200';
                if (log.type === 'success') badgeClr = 'bg-green-50 text-green-700 border-green-200';
                if (log.type === 'warning') badgeClr = 'bg-yellow-50 text-yellow-700 border-yellow-200';
                if (log.type === 'danger') badgeClr = 'bg-red-50 text-red-700 border-red-200';

                return (
                  <div key={log.id} className={`p-3 rounded border text-xs flex items-start gap-3 transition-colors ${badgeClr}`}>
                    <div className="mt-0.5">
                      {log.type === 'danger' && <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />}
                      {log.type === 'warning' && <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-600" />}
                      {log.type === 'success' && <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />}
                      {log.type === 'info' && <Clock className="h-4 w-4 shrink-0 text-gray-500" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold text-gray-900 tracking-tight">{log.action.toUpperCase()}</span>
                        <span className="text-[10px] text-gray-400 font-mono font-medium">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-gray-700 font-medium leading-relaxed">{log.details}</p>
                      
                      <div className="pt-1.5 flex items-center justify-between text-[10px] text-gray-400 font-mono border-t border-dashed mt-1.5">
                        <div>
                          User: <span className="font-bold text-gray-600">{log.username}</span>
                        </div>
                        <div>
                          IP: <span className="font-bold text-gray-600">{log.ipAddress}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
