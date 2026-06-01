import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, Edit2, Trash2, Mail, ShieldAlert, 
  RefreshCw, CheckCircle, XCircle, X, ChevronRight, UserCheck
} from 'lucide-react';

export default function UsersView() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form modals state
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState<any | null>(null);

  // Add form fields state
  const [addUsername, setAddUsername] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addName, setAddName] = useState('');
  const [addRoleId, setAddRoleId] = useState('role_member');
  const [addDeptId, setAddDeptId] = useState('');

  // Edit form fields state
  const [editEmail, setEditEmail] = useState('');
  const [editName, setEditName] = useState('');
  const [editRoleId, setEditRoleId] = useState('');
  const [editDeptId, setEditDeptId] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  const fetchUsersData = async () => {
    try {
      setLoading(true);
      const headers = { 'Authorization': sessionStorage.getItem('admin_token') || '' };
      
      const resU = await fetch('/api/users', { headers });
      const dataU = await resU.json();
      
      const resR = await fetch('/api/roles', { headers });
      const dataR = await resR.json();

      const resD = await fetch('/api/departments', { headers });
      const dataD = await resD.json();

      setUsers(dataU || []);
      setRoles(dataR || []);
      setDepartments(dataD || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch user index database from Express daemon.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addEmail || !addUsername || !addName || !addRoleId) {
      alert('Required parameters missing.');
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionStorage.getItem('admin_token') || ''
        },
        body: JSON.stringify({
          username: addUsername,
          email: addEmail,
          name: addName,
          roleId: addRoleId,
          departmentId: addDeptId || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'User creation failed.');

      // Clear params and reload
      setShowAddForm(false);
      setAddUsername('');
      setAddEmail('');
      setAddName('');
      setAddRoleId('role_member');
      setAddDeptId('');
      fetchUsersData();
    } catch (err: any) {
      alert(err.message || 'Error creating user');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditForm) return;

    try {
      const res = await fetch(`/api/users/${showEditForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionStorage.getItem('admin_token') || ''
        },
        body: JSON.stringify({
          email: editEmail,
          name: editName,
          roleId: editRoleId,
          departmentId: editDeptId || null,
          isActive: editIsActive
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'User update failed.');

      setShowEditForm(null);
      fetchUsersData();
    } catch (err: any) {
      alert(err.message || 'Error updating user.');
    }
  };

  const handleDeleteTrigger = async (userId: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to permanently delete user "${name}" from directory structure?`)) return;

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': sessionStorage.getItem('admin_token') || '' }
      });

      if (!res.ok) throw new Error('Delete failed.');
      fetchUsersData();
    } catch (e: any) {
      alert(e.message || 'Delete operation error.');
    }
  };

  const filteredUsers = users.filter((u: any) => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.roleName.toLowerCase().includes(search.toLowerCase()) ||
    u.departmentName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6" id="users_view">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" /> Identity Manager: User Directory
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Deploy secure personnel listings, assign roles & departments, or decommission records.
          </p>
        </div>

        <button 
          onClick={() => setShowAddForm(true)}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer transition"
          id="add_user_btn"
        >
          <UserPlus className="h-4.5 w-4.5" />
          <span>Provision User</span>
        </button>
      </div>

      {/* Global Filter Bar */}
      <div className="bg-white p-4 rounded-lg border shadow-sm flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Filter by name, username, email, department, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <button 
          onClick={fetchUsersData} 
          disabled={loading}
          className="p-1.5 border border-gray-300 hover:bg-gray-100 rounded text-gray-500 transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* User listing table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm font-semibold text-gray-400">Syncing with user databases...</div>
        ) : error ? (
          <div className="p-10 text-center text-sm font-semibold text-red-505">{error}</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-sm font-semibold text-gray-400">No matching personnel registry found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 uppercase font-bold border-b text-[10px] tracking-wider select-none">
                  <th className="px-5 py-3">Personnel Profile</th>
                  <th className="px-5 py-3">Username</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Access Level</th>
                  <th className="px-5 py-3">Account Status</th>
                  <th className="px-5 py-3 text-center">Config Options</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-700">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8.5 w-8.5 rounded-full bg-blue-105 text-blue-700 font-extrabold flex items-center justify-center text-xs shadow-inner">
                          {u.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-xs">{u.name}</div>
                          <div className="text-[10px] text-gray-400 font-medium font-mono">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono font-medium text-gray-600">{u.username}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 font-bold rounded-full bg-slate-100 text-slate-700 text-[10px] uppercase border">
                        {u.departmentName}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.roleId === 'role_admin' ? 'bg-red-50 text-red-700 border-red-200' 
                        : u.roleId === 'role_pm' ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      } border`}>
                        {u.roleName}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {u.isActive ? (
                        <span className="flex items-center gap-1 text-green-700 font-bold">
                          <CheckCircle className="h-4 w-4" /> Commisioned
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-500 font-bold">
                          <XCircle className="h-4 w-4" /> Decommissioned
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setShowEditForm(u);
                            setEditEmail(u.email);
                            setEditName(u.name);
                            setEditRoleId(u.roleId);
                            setEditDeptId(u.departmentId || '');
                            setEditIsActive(u.isActive);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        
                        {/* Protect removing the primary root admin card */}
                        {u.username !== 'admin' && (
                          <button
                            onClick={() => handleDeleteTrigger(u.id, u.name)}
                            className="p-1 text-red-700 hover:bg-red-50 rounded transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PROVISION USER BOX MODAL */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
          <div className="bg-white rounded-lg shadow-xl border-t-4 border-blue-600 max-w-md w-full overflow-hidden">
            <div className="px-5 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-extrabold uppercase text-gray-800 tracking-wide flex items-center gap-1.5">
                <UserCheck className="h-5 w-5 text-blue-600" /> Provision Directory Account
              </h3>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Display Full Name</label>
                <input
                  type="text"
                  required
                  className="block w-full border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Douglas Vance"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Unique Username</label>
                <input
                  type="text"
                  required
                  className="block w-full border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 font-mono"
                  placeholder="e.g. douglas_v"
                  value={addUsername}
                  onChange={(e) => setAddUsername(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  className="block w-full border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. doug@example.com"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Access Level (Role)</label>
                  <select
                    className="block w-full border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500"
                    value={addRoleId}
                    onChange={(e) => setAddRoleId(e.target.value)}
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Assigned Department</label>
                  <select
                    className="block w-full border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500"
                    value={addDeptId}
                    onChange={(e) => setAddDeptId(e.target.value)}
                  >
                    <option value="">-- No Department --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-yellow-50 rounded border border-yellow-200 text-[11px] text-yellow-800 leading-normal">
                <strong>Standard Provision Note:</strong> Newly authorized accounts default to Active state with preset security password: <span className="font-mono font-bold bg-yellow-105 px-1 py-0.5 rounded">12345678</span>.
              </div>

              <div className="pt-3 border-t flex justify-end gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-1.5 border hover:bg-gray-50 rounded text-gray-700 bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded shadow"
                >
                  Confirm Provision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER PROPERTIES BOX MODAL */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
          <div className="bg-white rounded-lg shadow-xl border-t-4 border-blue-600 max-w-md w-full overflow-hidden">
            <div className="px-5 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-extrabold uppercase text-gray-800 tracking-wide">
                Modify Personnel credentials: {showEditForm.username}
              </h3>
              <button onClick={() => setShowEditForm(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  className="block w-full border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 font-medium"
                  placeholder="Employee name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Contract Email</label>
                <input
                  type="email"
                  required
                  className="block w-full border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500"
                  placeholder="Email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Access Level (Role)</label>
                  <select
                    className="block w-full border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500"
                    value={editRoleId}
                    onChange={(e) => setEditRoleId(e.target.value)}
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Department</label>
                  <select
                    className="block w-full border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500"
                    value={editDeptId}
                    onChange={(e) => setEditDeptId(e.target.value)}
                  >
                    <option value="">-- No Department --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {showEditForm.username !== 'admin' && (
                <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
                  <label className="flex items-center gap-2 font-bold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded text-blue-650"
                      checked={editIsActive}
                      onChange={(e) => setEditIsActive(e.target.checked)}
                    />
                    <span>Account Authorized and Active</span>
                  </label>
                  <p className="text-[10px] text-gray-400 mt-1 pl-6">Dechecking locks personnel out of server operations immediately.</p>
                </div>
              )}

              <div className="pt-3 border-t flex justify-end gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setShowEditForm(null)}
                  className="px-4 py-1.5 border hover:bg-gray-50 rounded text-gray-700 bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded shadow"
                >
                  Apply Modify changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
