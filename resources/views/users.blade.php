@extends('layouts.app')

@section('title', 'User Directory Management')

@section('content')
<div class="space-y-6">
    <!-- View Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
            <h1 class="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                <i class="fa-solid fa-users-gear text-blue-600"></i> User Management Directory
            </h1>
            <p class="text-slate-400 text-xs font-semibold mt-0.5">
                CRUD registry of system operators, roles assignments, and division connections.
            </p>
        </div>
        
        <button 
            onclick="openCreateUserModal()"
            class="mt-3 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-15 px-4 rounded-xl shadow-md border border-blue-600/10 cursor-pointer flex items-center gap-1.5 transition-all"
        >
            <i class="fa-solid fa-user-plus text-xs"></i>
            <span>Register Operator</span>
        </button>
    </div>

    <!-- MAIN ENTRIES GRID CONTROL -->
    <div class="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div class="p-5 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50/50">
            <h3 class="text-xs font-black uppercase text-slate-700 tracking-wider">System Users Master Registry</h3>
            <div class="relative w-full max-w-sm">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <i class="fa-solid fa-magnifying-glass text-xs"></i>
                </span>
                <input 
                    type="text" 
                    id="searchFilter" 
                    oninput="filterUsersTable()"
                    placeholder="Search name, username, email..." 
                    class="w-full pl-9 pr-4 py-2 bg-white border border-slate-250 rounded-xl text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                >
            </div>
        </div>

        <!-- TABLE GRID -->
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
                <thead>
                    <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                        <th class="py-3.5 px-5">Operator Name</th>
                        <th class="py-3.5 px-4">Username</th>
                        <th class="py-3.5 px-4">Email Address</th>
                        <th class="py-3.5 px-4">Role Assigned</th>
                        <th class="py-3.5 px-4">Department Division</th>
                        <th class="py-3.5 px-4">Identity Health</th>
                        <th class="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody id="users-table-body" class="divide-y divide-slate-100 font-medium text-slate-705 text-slate-700">
                    <!-- Loaded dynamically via AJAX -->
                    <tr>
                        <td colspan="7" class="py-12 text-center text-slate-400">
                            <i class="fa-solid fa-circle-notch fa-spin text-xl text-slate-300"></i>
                            <p class="text-xs mt-2 font-bold">Querying directory databases...</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- CREATE/EDIT OPERATOR FORM MODAL -->
<div id="operatorModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 opacity-0 pointer-events-none transition-all duration-300">
    <div class="bg-white rounded-2xl max-w-lg w-full border border-slate-250 shadow-2xl overflow-hidden transform scale-95 transition-all duration-300">
        
        <!-- Header -->
        <div class="p-5 border-b flex items-center justify-between bg-slate-50">
            <div class="flex items-center gap-2.5">
                <div class="p-2 inline-block bg-blue-50 text-blue-650 rounded-xl text-blue-600">
                    <i class="fa-solid fa-user-gear text-sm"></i>
                </div>
                <div>
                    <h3 class="font-black text-slate-800 text-sm leading-none" id="modalTitle">Register New User</h3>
                    <p class="text-[10px] text-slate-400 mt-1 font-semibold">Fills database directories instantly</p>
                </div>
            </div>
            
            <button onclick="hideOperatorModal()" class="text-slate-400 hover:text-slate-650 h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors">
                <i class="fa-solid fa-xmark text-base"></i>
            </button>
        </div>

        <form id="operatorForm" onsubmit="handleOperatorSubmit(event)" class="p-6 space-y-4">
            <input type="hidden" id="editingUserId" value="">

            <div class="grid grid-cols-2 gap-4">
                <!-- Name inputs -->
                <div class="space-y-1">
                    <label for="opName" class="text-[10px] font-black uppercase text-slate-500 tracking-wider">Full Real Name</label>
                    <input 
                        type="text" 
                        id="opName" 
                        required 
                        placeholder="e.g. John Doe" 
                        class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-205 rounded-xl text-xs font-semibold placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                    >
                </div>

                <!-- Username inputs -->
                <div class="space-y-1">
                    <label for="opUsername" class="text-[10px] font-black uppercase text-slate-500 tracking-wider">Username Handle</label>
                    <input 
                        type="text" 
                        id="opUsername" 
                        required 
                        placeholder="e.g. jdoe" 
                        class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-205 rounded-xl text-xs font-semibold placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                    >
                </div>
            </div>

            <!-- Email inputs -->
            <div class="space-y-1">
                <label for="opEmail" class="text-[10px] font-black uppercase text-slate-500 tracking-wider">Corporate Email</label>
                <input 
                    type="email" 
                    id="opEmail" 
                    required 
                    placeholder="jdoe@enterprise.com" 
                    class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-205 rounded-xl text-xs font-semibold placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                >
            </div>

            <div class="grid grid-cols-2 gap-4">
                <!-- Roles dropdown -->
                <div class="space-y-1">
                    <label for="opRole" class="text-[10px] font-black uppercase text-slate-500 tracking-wider">Security Access Role</label>
                    <select 
                        id="opRole" 
                        required 
                        class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-205 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    >
                        <!-- Loaded dynamic server side options -->
                    </select>
                </div>

                <!-- Department dropdown -->
                <div class="space-y-1">
                    <label for="opDept" class="text-[10px] font-black uppercase text-slate-500 tracking-wider">Operational Division</label>
                    <select 
                        id="opDept" 
                        class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-205 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    >
                        <option value="">Unassigned (HQ Sandbox)</option>
                        <!-- Loaded dynamic server side options -->
                    </select>
                </div>
            </div>

            <!-- IsActive toggle (only visible when editing) -->
            <div id="isActiveFieldContainer" class="p-3.5 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between hidden">
                <div>
                    <label class="text-[10px] font-black uppercase text-slate-600 tracking-wider block">Access Status</label>
                    <span class="text-[10px] text-slate-400 mt-1 font-semibold block">Suspend or restore identity access key.</span>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="opActive" class="sr-only peer" checked>
                    <div class="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
            </div>

            <!-- Submit action block -->
            <div class="flex justify-end gap-2.5 pt-4 border-t mt-4">
                <button type="button" onclick="hideOperatorModal()" class="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer">Close Dialog</button>
                <button type="submit" id="submitOpBtn" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md border border-blue-650/10 cursor-pointer transition-all"></button>
            </div>
        </form>

    </div>
</div>

<script>
    const adminToken = sessionStorage.getItem('admin_token');
    
    // In memory store for users
    let directoryUsersList = [];

    // Load initial metadata components
    async function loadDirectoryData() {
        const headers = { 'Authorization': adminToken, 'Content-Type': 'application/json' };
        
        try {
            // Fetch Roles
            const rRoles = await fetch('/api/roles', { headers });
            const roles = await rRoles.json();
            const opRoleSelect = document.getElementById('opRole');
            opRoleSelect.innerHTML = roles.map(r => `<option value="${r.id}">${r.name}</option>`).join('');

            // Fetch Departments
            const rDeps = await fetch('/api/departments', { headers });
            const depts = await rDeps.json();
            const opDeptSelect = document.getElementById('opDept');
            opDeptSelect.innerHTML = '<option value="">Unassigned (HQ Sandbox)</option>' + 
                                      depts.map(d => `<option value="${d.id}">${d.name}</option>`).join('');

            // Fetch Operators and compile Table view
            await fetchUsersList();

        } catch (e) {
            console.error('Failure parsing directory metadata', e);
        }
    }

    async function fetchUsersList() {
        const headers = { 'Authorization': adminToken };
        const tableBody = document.getElementById('users-table-body');
        
        try {
            const res = await fetch('/api/users', { headers });
            directoryUsersList = await res.json();
            renderUsersTable(directoryUsersList);
        } catch (e) {
            tableBody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-rose-500 text-xs font-bold">Failed fetching users databases.</td></tr>`;
        }
    }

    function renderUsersTable(items) {
        const tableBody = document.getElementById('users-table-body');
        if (items.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="py-12 text-center text-slate-400 italic">No operators mapped in configuration. Try creating one!</td></tr>`;
            return;
        }

        tableBody.innerHTML = items.map(u => {
            const activeBadge = u.isActive 
                ? `<span class="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1 leading-none"><span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>ACTIVE</span>`
                : `<span class="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1 leading-none"><span class="h-1.5 w-1.5 rounded-full bg-rose-500 inline-block"></span>SUSPENDED</span>`;

            return `
            <tr class="hover:bg-slate-50/70 transition-colors">
                <td class="py-4 px-5">
                    <div class="flex items-center gap-2.5">
                        <div class="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border font-black text-xs uppercase">
                            ${u.name.charAt(0)}
                        </div>
                        <span class="font-bold text-slate-900 leading-none">${u.name}</span>
                    </div>
                </td>
                <td class="py-4 px-4 font-mono font-bold text-slate-600">${u.username}</td>
                <td class="py-4 px-4 font-semibold text-slate-500">${u.email}</td>
                <td class="py-4 px-4">
                    <span class="bg-blue-50 text-blue-700 border border-blue-200/50 text-[10px] font-bold px-2 py-0.5 rounded-lg">${u.roleName}</span>
                </td>
                <td class="py-4 px-4">
                    <span class="font-bold text-slate-600">${u.departmentName}</span>
                </td>
                <td class="py-4 px-4">${activeBadge}</td>
                <td class="py-4 px-5 text-right font-bold">
                    <div class="flex items-center justify-end gap-1.5">
                        <button onclick="openEditUserModal('${u.id}')" class="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer transition-colors" title="Edit operator metadata">
                            <i class="fa-solid fa-pen-to-square text-xs"></i>
                        </button>
                        <button onclick="deleteUserRecord('${u.id}')" class="h-8 w-8 rounded-lg hover:bg-rose-50 text-rose-600 flex items-center justify-center cursor-pointer transition-colors" title="Delete operator security key">
                            <i class="fa-solid fa-trash text-xs"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
        }).join('');
    }

    // Matching Client Filter matching instant searches!
    function filterUsersTable() {
        const query = document.getElementById('searchFilter').value.toLowerCase().trim();
        if (!query) {
            renderUsersTable(directoryUsersList);
            return;
        }

        const filtered = directoryUsersList.filter(u => 
            u.name.toLowerCase().includes(query) ||
            u.username.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query) ||
            u.roleName.toLowerCase().includes(query) ||
            u.departmentName.toLowerCase().includes(query)
        );
        renderUsersTable(filtered);
    }

    // Modal Control wrappers
    const modal = document.getElementById('operatorModal');
    const form = document.getElementById('operatorForm');

    function openCreateUserModal() {
        form.reset();
        document.getElementById('editingUserId').value = '';
        document.getElementById('modalTitle').textContent = 'Register New System Operator';
        document.getElementById('submitOpBtn').textContent = 'Commit Directory Entry';
        document.getElementById('isActiveFieldContainer').classList.add('hidden');
        
        modal.classList.remove('opacity-0', 'pointer-events-none');
        modal.children[0].classList.remove('scale-95');
    }

    function openEditUserModal(userId) {
        const u = directoryUsersList.find(item => item.id === userId);
        if(!u) return;

        form.reset();
        document.getElementById('editingUserId').value = u.id;
        document.getElementById('opName').value = u.name;
        document.getElementById('opUsername').value = u.username;
        document.getElementById('opUsername').disabled = true; // username immutable
        document.getElementById('opEmail').value = u.email;
        document.getElementById('opRole').value = u.roleId;
        document.getElementById('opDept').value = u.departmentId || '';
        document.getElementById('opActive').checked = u.isActive;

        document.getElementById('modalTitle').textContent = `Alter Operator: ${u.name}`;
        document.getElementById('submitOpBtn').textContent = 'Patch Directory Settings';
        document.getElementById('isActiveFieldContainer').classList.remove('hidden');

        modal.classList.remove('opacity-0', 'pointer-events-none');
        modal.children[0].classList.remove('scale-95');
    }

    function hideOperatorModal() {
        modal.classList.add('opacity-0', 'pointer-events-none');
        modal.children[0].classList.add('scale-95');
        // Reset disabled states
        setTimeout(() => {
            document.getElementById('opUsername').disabled = false;
        }, 300);
    }

    // AJAX creation / modification execution
    async function handleOperatorSubmit(e) {
        e.preventDefault();
        
        const userId = document.getElementById('editingUserId').value;
        const name = document.getElementById('opName').value;
        const username = document.getElementById('opUsername').value;
        const email = document.getElementById('opEmail').value;
        const roleId = document.getElementById('opRole').value;
        const departmentId = document.getElementById('opDept').value;
        const isActive = document.getElementById('opActive').checked;

        const isEditing = !!userId;
        const url = isEditing ? `/api/users/${userId}` : '/api/users';
        const method = isEditing ? 'PUT' : 'POST';

        const headers = { 'Authorization': adminToken, 'Content-Type': 'application/json' };
        const bodyContent = isEditing 
            ? { email, name, roleId, departmentId, isActive }
            : { username, email, name, roleId, departmentId };

        try {
            const submitBtn = document.getElementById('submitOpBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Recording logs...';

            const res = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(bodyContent)
            });

            const data = await res.json();
            submitBtn.disabled = false;

            if (res.ok) {
                hideOperatorModal();
                triggerAlert(isEditing ? 'Operator patched successfully!' : 'Operator registered in active directory!', 'success');
                // Refresh records
                await fetchUsersList();
            } else {
                alert(data.error || 'Server rejected directory write.');
            }
        } catch (e) {
            alert('Directory operational write failure.');
        }
    }

    // Erase directory entry
    async function deleteUserRecord(userId) {
        const u = directoryUsersList.find(item => item.id === userId);
        if (!u) return;

        if (!confirm(`CRITICAL DELETION:\nAre you sure you want to completely erase developer key details and logs database references for ${u.name}?`)) {
            return;
        }

        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': adminToken }
            });

            if (res.ok) {
                triggerAlert('Directory key purged', 'success');
                await fetchUsersList();
            } else {
                const data = await res.json();
                alert(data.error || 'Identity deletion request denied.');
            }
        } catch (e) {
            alert('Purge operation execution error.');
        }
    }

    // Mount initial load
    loadDirectoryData();
</script>
@endsection
