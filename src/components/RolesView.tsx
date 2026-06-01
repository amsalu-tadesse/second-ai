import { useState, useEffect } from 'react';
import { ShieldCheck, ToggleLeft, Save, RefreshCw, Key, ShieldAlert, BadgeInfo } from 'lucide-react';

export default function RolesView() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);

  // Hardcoded standard available permission descriptors for security matrix representation
  const systemPermissions = [
    { id: 'view_dashboard', name: 'Dashboard Access', desc: 'Allows read-only access to standard analytic metrics.' },
    { id: 'manage_users', name: 'Manage Directories', desc: 'Read, create, modify and delete personnel accounts.' },
    { id: 'manage_roles', name: 'Security Modifiers', desc: 'Alter granular permissions attached to systemic security roles.' },
    { id: 'crud_generate', name: 'CRUD Code-Gen Engine', desc: 'Scaffold full-stack models, migration files, and views.' },
    { id: 'manage_projects', name: 'Manage Project Boards', desc: 'Coordinate projects, assign members and allocate project managers.' },
    { id: 'manage_departments', name: 'Manage Departments', desc: 'Establish and oversee divisional departments.' },
    { id: 'view_audits', name: 'Yajra Audit Log Viewer', desc: 'Examine systemic access logs and terminal audits.' },
    { id: 'edit_templates', name: 'Email Template Editors', desc: 'Customize dynamic templates compiled by notifying handlers.' }
  ];

  const fetchRolesData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/roles', {
        headers: { 'Authorization': sessionStorage.getItem('admin_token') || '' }
      });
      const data = await res.json();
      setRoles(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRolesData();
  }, []);

  const handlePermissionToggle = (roleId: string, permissionId: string) => {
    // Admin role has absolute hardcoded access and cannot be mutated for safety
    if (roleId === 'role_admin') {
      alert('Administrator permissions are absolute and cannot be limited.');
      return;
    }

    setRoles(prevRoles => prevRoles.map(role => {
      if (role.id !== roleId) return role;
      
      const contains = role.permissions.includes(permissionId);
      const nextPermissions = contains 
        ? role.permissions.filter((p: string) => p !== permissionId)
        : [...role.permissions, permissionId];
      
      return { ...role, permissions: nextPermissions };
    }));
  };

  const handleSaveRolePermissions = async (role: any) => {
    try {
      setSavingRoleId(role.id);
      const res = await fetch(`/api/roles/${role.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionStorage.getItem('admin_token') || ''
        },
        body: JSON.stringify({
          permissions: role.permissions
        })
      });

      if (!res.ok) throw new Error('Failed to update.');
      alert(`Granular permissions for role "${role.name}" updated successfully on backend and written to database file.`);
      fetchRolesData();
    } catch (e: any) {
      alert(e.message || 'Error saving role permissions.');
    } finally {
      setSavingRoleId(null);
    }
  };

  return (
    <div className="space-y-6" id="roles_view">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-blue-600" /> Roles & Security Privileges
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Configure authorization permissions, audit access levels, and assign RBAC values.
          </p>
        </div>
        <button 
          onClick={fetchRolesData} 
          className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 mt-3 sm:mt-0 transition text-gray-500"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Permissions Matrix */}
      {loading ? (
        <div className="p-12 text-center text-sm font-semibold text-gray-400">Loading access matrix structures...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {roles.map((role) => (
            <div key={role.id} className="bg-white rounded-lg border shadow-sm overflow-hidden">
              
              {/* Role Box Header */}
              <div className="px-5 py-3.5 border-b bg-gray-55 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gray-50">
                <div>
                  <h3 className="text-sm font-extrabold uppercase text-gray-800 tracking-wide flex items-center gap-1.5">
                    <Key className="h-4.5 w-4.5 text-blue-600" /> {role.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">{role.description}</p>
                </div>

                {role.id !== 'role_admin' ? (
                  <button
                    onClick={() => handleSaveRolePermissions(role)}
                    disabled={savingRoleId === role.id}
                    className="px-3.5 py-1.5 bg-blue-650 hover:bg-blue-700 bg-blue-650 hover:bg-blue-700 text-white font-bold rounded text-xs flex items-center gap-1.5 shadow transition disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>{savingRoleId === role.id ? 'Saving Security Scheme...' : 'Save Permissions'}</span>
                  </button>
                ) : (
                  <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded">
                    Immutable Access Scheme
                  </span>
                )}
              </div>

              {/* Individual Granular checkboxes */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {systemPermissions.map((permission) => {
                  const isChecked = role.permissions.includes(permission.id);
                  const isRoleAdmin = role.id === 'role_admin';

                  return (
                    <div 
                      key={permission.id}
                      onClick={() => !isRoleAdmin && handlePermissionToggle(role.id, permission.id)}
                      className={`p-3 border rounded-lg transition-all select-none ${
                        isRoleAdmin 
                          ? 'border-emerald-100 bg-emerald-50/20' 
                          : isChecked 
                            ? 'border-blue-200 bg-blue-50/25' 
                            : 'border-gray-200 bg-white'
                      } ${!isRoleAdmin ? 'cursor-pointer hover:border-gray-300' : 'cursor-default'}`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          className="mt-1 h-3.5 w-3.5 text-blue-600 rounded"
                          checked={isRoleAdmin || isChecked}
                          disabled={isRoleAdmin}
                          onChange={() => {}} // Controlled by div click
                        />
                        <div>
                          <div className="font-bold text-gray-900 text-xs">{permission.name}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5 line-clamp-2 leading-relaxed font-semibold">{permission.desc}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Info warning */}
      <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded text-xs text-blue-800 leading-relaxed flex items-start gap-2 max-w-2xl">
        <BadgeInfo className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
        <div>
          <strong className="font-extrabold uppercase text-[10.5px]">Role Based Access Control (RBAC):</strong>
          <p className="mt-1 font-medium"> granular permissions configure what views are active in the sidebar navigation and what endpoints client AJAX sessions are authorized to execute server-side. Permissions are checked utilizing authentication tokens proxy verified against stored values.</p>
        </div>
      </div>
      
    </div>
  );
}
