import React, { useState, useEffect } from 'react';
import { 
  Building2, FolderKanban, Plus, UserPlus, UserCheck, Trash2, 
  RefreshCw, CheckCircle, Clock, AlertTriangle, AlertCircle, X, CheckSquare, Square
} from 'lucide-react';

export default function ProjectsView() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDeptTab, setActiveDeptTab] = useState<string>('');

  // Creation forms modal toggle
  const [showAddDept, setShowAddDept] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [selectedProjectToEdit, setSelectedProjectToEdit] = useState<any | null>(null);

  // Forms states
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');

  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projDeptId, setProjDeptId] = useState('');
  const [projPromoManagerId, setProjPromoManagerId] = useState('');
  const [projStateStatus, setProjStateStatus] = useState<'planning' | 'active' | 'on-hold' | 'completed'>('planning');

  // Edit states for a project
  const [editManagerId, setEditManagerId] = useState('');
  const [editMemberIds, setEditMemberIds] = useState<string[]>([]);
  const [editStatus, setEditStatus] = useState<'planning' | 'active' | 'on-hold' | 'completed'>('planning');

  const fetchAssetsData = async () => {
    try {
      setLoading(true);
      const headers = { 'Authorization': sessionStorage.getItem('admin_token') || '' };
      
      const resD = await fetch('/api/departments', { headers });
      const dataD = await resD.json();
      
      const resP = await fetch('/api/projects', { headers });
      const dataP = await resP.json();

      const resU = await fetch('/api/users', { headers });
      const dataU = await resU.json();

      setDepartments(dataD || []);
      setProjects(dataP || []);
      setUsers(dataU || []);
      
      if (dataD.length > 0 && !activeDeptTab) {
        setActiveDeptTab(dataD[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetsData();
  }, []);

  const handleDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName) return;

    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionStorage.getItem('admin_token') || ''
        },
        body: JSON.stringify({ name: deptName, description: deptDesc })
      });

      if (!res.ok) throw new Error('Failed creating department.');
      
      setDeptName('');
      setDeptDesc('');
      setShowAddDept(false);
      fetchAssetsData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName || !projDeptId) {
      alert('Project name and department target are required.');
      return;
    }

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionStorage.getItem('admin_token') || ''
        },
        body: JSON.stringify({
          name: projName,
          description: projDesc,
          departmentId: projDeptId,
          managerId: projPromoManagerId || undefined, // Single assigned PM
          memberIds: [], // Empty members by default
          status: projStateStatus
        })
      });

      if (!res.ok) throw new Error('Failed creating project.');
      
      setProjName('');
      setProjDesc('');
      setProjDeptId('');
      setProjPromoManagerId('');
      setProjStateStatus('planning');
      setShowAddProject(false);
      fetchAssetsData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateProjectTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectToEdit) return;

    try {
      const res = await fetch(`/api/projects/${selectedProjectToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionStorage.getItem('admin_token') || ''
        },
        body: JSON.stringify({
          managerId: editManagerId || null, // Exactly one project manager allowed
          memberIds: editMemberIds, // Dynamic members array list
          status: editStatus
        })
      });

      if (!res.ok) throw new Error('Update failed.');
      setSelectedProjectToEdit(null);
      fetchAssetsData();
    } catch (e: any) {
      alert(e.message || 'Error updating allocations.');
    }
  };

  const handleDeleteProject = async (projId: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete project "${name}" and scrap its records?`)) return;

    try {
      const res = await fetch(`/api/projects/${projId}`, {
        method: 'DELETE',
        headers: { 'Authorization': sessionStorage.getItem('admin_token') || '' }
      });

      if (!res.ok) throw new Error('Scrapping project failed.');
      fetchAssetsData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const toggleMemberInEditList = (userId: string) => {
    setEditMemberIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  // Filter users by department for team member dropdown selection
  const deptAssignedPMs = users.filter((u: any) => u.isActive && (u.roleId === 'role_pm' || u.roleId === 'role_admin'));
  const deptAssignedMembers = users.filter((u: any) => u.isActive);

  // Filter and display projects in active department tab
  const activeDeptObject = departments.find(d => d.id === activeDeptTab);
  const activeDeptProjects = projects.filter(p => p.departmentId === activeDeptTab);

  return (
    <div className="space-y-6" id="projects_view">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-blue-600" /> Departments & Project Units
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Create departments, organize project matrices, assign team members, and allocate exactly one Project Manager.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAddDept(true)}
            className="px-3.5 py-1.5 border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold rounded text-xs flex items-center gap-1 cursor-pointer shadow-sm transition"
            id="create_dept_btn"
          >
            <Building2 className="h-4 w-4" />
            <span>Create Department</span>
          </button>
          
          <button 
            onClick={() => setShowAddProject(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs flex items-center gap-1 shadow cursor-pointer transition"
            id="create_proj_btn"
          >
            <Plus className="h-4 w-4" />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm font-semibold text-gray-400 animate-pulse">Summoning organizational units...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Left Hand: Departments list tabs list */}
          <div className="space-y-2 md:col-span-1">
            <div className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400 px-2 pb-1">Divisions Matrix</div>
            <div className="bg-white border rounded-lg overflow-hidden shadow-sm divide-y">
              {departments.map((dept) => {
                const isSelected = dept.id === activeDeptTab;
                const countOfProjects = projects.filter(p => p.departmentId === dept.id).length;

                return (
                  <button
                    key={dept.id}
                    onClick={() => {
                      setActiveDeptTab(dept.id);
                      setSelectedProjectToEdit(null);
                    }}
                    className={`w-full text-left px-4 py-3 text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-50 text-blue-750 border-r-4 border-blue-600' 
                        : 'text-gray-650 hover:bg-gray-50'
                    }`}
                  >
                    <div className="truncate">
                      <div className="font-bold truncate text-gray-900">{dept.name}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5 truncate font-semibold">{dept.description || 'No description designated.'}</div>
                    </div>
                    <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-mono font-extrabold text-[9px]">
                      {countOfProjects}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Hand: Active tab's corresponding project cards */}
          <div className="md:col-span-3 space-y-4">
            {activeDeptObject && (
              <div className="bg-gray-100 p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-inner">
                <div>
                  <h3 className="text-sm font-extrabold text-blue-900 flex items-center gap-1.5 uppercase tracking-wide">
                    <Building2 className="h-5 w-5 text-blue-650" /> Division: {activeDeptObject.name}
                  </h3>
                  <p className="text-xs text-gray-650 mt-1 font-medium">{activeDeptObject.description || 'Enterprise Operational Department.'}</p>
                </div>
                <div className="text-xs text-gray-400 font-mono font-medium">Est. {new Date(activeDeptObject.createdAt).toLocaleDateString()}</div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeDeptProjects.length === 0 ? (
                <div className="lg:col-span-2 p-12 text-center text-xs text-gray-400 border border-dashed rounded-lg bg-white bg-opacity-50">
                  <FolderKanban className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  No project boards deployed under this department yet. Build a project board to deploy!
                </div>
              ) : (
                activeDeptProjects.map((proj) => (
                  <div key={proj.id} className="bg-white border rounded-lg shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <h4 className="font-extrabold text-gray-900 text-sm leading-snug">{proj.name}</h4>
                          <span className={`inline-block text-[9px] uppercase font-extrabold tracking-wide px-2 py-0.5 rounded-full border mt-1.5 ${
                            proj.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200'
                            : proj.status === 'active' ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : proj.status === 'on-hold' ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            : 'bg-gray-50 text-gray-600 border-gray-200'
                          }`}>
                            {proj.status.toUpperCase()}
                          </span>
                        </div>

                        {/* Scrapping projects trigger */}
                        <button 
                          onClick={() => handleDeleteProject(proj.id, proj.name)}
                          className="text-gray-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition"
                          title="Purge project board"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <p className="text-xs text-gray-650 mt-3 leading-relaxed font-semibold h-12 overflow-hidden block">
                        {proj.description || 'No detailed project blueprint designated.'}
                      </p>

                      <div className="border-t border-dashed my-3.5 pt-3 space-y-2.5 text-xs">
                        {/* Exactly one project manager */}
                        <div className="flex items-center justify-between text-xs p-1.5 bg-indigo-50/40 rounded border border-indigo-100/50">
                          <span className="font-bold text-indigo-900 flex items-center gap-1">
                            <UserCheck className="h-4 w-4 text-indigo-600" /> Project Manager:
                          </span>
                          <span className="font-extrabold text-indigo-750 font-sans truncate max-w-44 bg-indigo-50 px-2 py-0.5 rounded">
                            {proj.managerName}
                          </span>
                        </div>

                        {/* List of members */}
                        <div className="space-y-1">
                          <div className="font-bold text-gray-500 text-[10px] uppercase tracking-wider flex items-center justify-between">
                            <span>Project Personnel Members</span>
                            <span className="font-mono font-bold bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{proj.memberIds.length}</span>
                          </div>
                          
                          {proj.membersList && proj.membersList.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pt-1">
                              {proj.membersList.map((m: any) => (
                                <span key={m.id} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold" title={m.email}>
                                  {m.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[10px] text-gray-400 italic">No assigned team members yet.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <button
                        onClick={() => {
                          setSelectedProjectToEdit(proj);
                          setEditManagerId(proj.managerId || '');
                          setEditMemberIds(proj.memberIds || []);
                          setEditStatus(proj.status);
                        }}
                        className="w-full py-1 border border-blue-200 hover:bg-blue-50 text-blue-750 font-bold text-xs rounded transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <UserPlus className="h-4 w-4 text-blue-600" />
                        <span>Manage Assignments & Status</span>
                      </button>
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* DEPARTMENT CREATION MODAL */}
      {showAddDept && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
          <div className="bg-white rounded-lg shadow-xl border-t-4 border-blue-600 max-w-md w-full overflow-hidden text-xs">
            <div className="px-5 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-extrabold uppercase text-gray-800 tracking-wide">
                Create Department Division
              </h3>
              <button onClick={() => setShowAddDept(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={deptSubmit => handleDeptSubmit(deptSubmit)} className="p-5 space-y-4">
              <div>
                <label className="block text-gray-750 font-bold mb-1">Department Division Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence"
                  className="block w-full border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 font-medium text-xs"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-750 font-bold mb-1">Mission Blueprint / Description</label>
                <textarea
                  rows={3}
                  placeholder="E.g. Development center for large model architectures..."
                  className="block w-full border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 font-medium text-xs"
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2 font-semibold">
                <button
                  type="button"
                  onClick={() => setShowAddDept(false)}
                  className="px-4 py-1.5 border hover:bg-gray-50 rounded text-gray-700 bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded shadow text-xs"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROJECT DEPLOYMENT MODAL */}
      {showAddProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
          <div className="bg-white rounded-lg shadow-xl border-t-4 border-blue-600 max-w-md w-full overflow-hidden text-xs">
            <div className="px-5 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-extrabold uppercase text-gray-800 tracking-wide">
                Build & Deploy Project Board
              </h3>
              <button onClick={() => setShowAddProject(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleProjectSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-gray-750 font-bold mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Core Database Optimizer"
                  className="block w-full border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 font-medium text-xs"
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-750 font-bold mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  placeholder="What is the objective of this project unit..."
                  className="block w-full border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 font-medium text-xs"
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-750 font-bold mb-1">Target Department</label>
                  <select
                    required
                    className="block w-full border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 text-xs"
                    value={projDeptId}
                    onChange={(e) => setProjDeptId(e.target.value)}
                  >
                    <option value="">-- Choose Division --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-750 font-bold mb-1">Status Status</label>
                  <select
                    className="block w-full border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 text-xs"
                    value={projStateStatus}
                    onChange={(e) => setProjStateStatus(e.target.value as any)}
                  >
                    <option value="planning">PLANNING</option>
                    <option value="active">DEVELOPING</option>
                    <option value="on-hold">ON HOLD</option>
                    <option value="completed">COMPLETED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-750 font-bold mb-1">Initial Project Manager allocation (Strictly max 1 PM)</label>
                <select
                  className="block w-full border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 text-xs text-indigo-900 font-bold"
                  value={projPromoManagerId}
                  onChange={(e) => setProjPromoManagerId(e.target.value)}
                >
                  <option value="">-- No PM Assigned --</option>
                  {deptAssignedPMs.map(pm => (
                    <option key={pm.id} value={pm.id}>{pm.name}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded text-[10.5px] leading-relaxed text-indigo-805 font-medium">
                <strong>Project Manager allocation Rules:</strong> Each project Board contains exactly zero or one designated project manager coordinating milestones. Team members can be added after board deployment creation.
              </div>

              <div className="pt-3 border-t flex justify-end gap-2 font-semibold">
                <button
                  type="button"
                  onClick={() => setShowAddProject(false)}
                  className="px-4 py-1.5 border hover:bg-gray-50 rounded text-gray-700 bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded shadow text-xs"
                >
                  Deploy Project Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE REALLOCATIONS BOX MODAL */}
      {selectedProjectToEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn font-sans text-xs">
          <div className="bg-white rounded-lg shadow-xl border-t-4 border-blue-600 max-w-lg w-full overflow-hidden">
            <div className="px-5 py-4 border-b flex justify-between items-center bg-gray-50 border-b border-gray-200">
              <div>
                <h3 className="text-sm font-extrabold uppercase text-gray-900 tracking-tight">
                  Manager & Team Allocation Drawer
                </h3>
                <p className="text-gray-400 text-[10px] mt-0.5">Project target: {selectedProjectToEdit.name}</p>
              </div>
              <button onClick={() => setSelectedProjectToEdit(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProjectTrigger} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* PM Selector */}
                <div>
                  <label className="block text-gray-750 font-bold mb-1">Project status</label>
                  <select
                    className="block w-full border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 text-xs"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                  >
                    <option value="planning">PLANNING</option>
                    <option value="active">DEVELOPING</option>
                    <option value="on-hold">ON HOLD</option>
                    <option value="completed">COMPLETED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-indigo-900 font-bold mb-1">Assigned Project Manager (Max 1)</label>
                  <select
                    className="block w-full border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 text-xs font-bold bg-indigo-50 text-indigo-900"
                    value={editManagerId}
                    onChange={(e) => setEditManagerId(e.target.value)}
                  >
                    <option value="">-- No PM Assigned --</option>
                    {deptAssignedPMs.map(pm => (
                      <option key={pm.id} value={pm.id}>{pm.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multiple Members Checklist selector */}
              <div>
                <label className="block text-gray-750 font-extrabold uppercase tracking-wider text-[10px] mb-2">Team Personnel Checklist (Assign Members)</label>
                <div className="border border-gray-200 rounded p-3 h-48 overflow-y-auto space-y-1.5 bg-gray-50">
                  {deptAssignedMembers.map((member) => {
                    const isChecked = editMemberIds.includes(member.id);
                    return (
                      <button
                        type="button"
                        key={member.id}
                        onClick={() => toggleMemberInEditList(member.id)}
                        className={`w-full flex items-center justify-between p-2.5 rounded border text-left cursor-pointer transition-all ${
                          isChecked 
                            ? 'bg-blue-50 text-blue-750 border-blue-200 font-bold' 
                            : 'bg-white border-gray-200 text-gray-650 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isChecked ? (
                            <CheckSquare className="h-4.5 w-4.5 text-blue-600" />
                          ) : (
                            <Square className="h-4.5 w-4.5 text-gray-300" />
                          )}
                          <span>{member.name} ({member.username})</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase text-gray-400 bg-gray-150 px-1.5 py-0.5 rounded">
                          {member.roleId.replace('role_', '')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2 font-semibold text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedProjectToEdit(null)}
                  className="px-4 py-1.5 border hover:bg-gray-50 rounded text-gray-700 bg-white animate-transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded shadow animate-transition"
                >
                  Commit Allocations
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
