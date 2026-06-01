@extends('layouts.app')

@section('title', 'Roles & Key Permissions')

@section('content')
<div class="space-y-6">
    <!-- Header banner -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
            <h1 class="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <i class="fa-solid fa-shield-halved text-blue-600"></i> Roles & Secure Permissions
            </h1>
            <p class="text-slate-400 text-xs font-semibold mt-0.5">
                Audit system authorization scopes, adjust roles capacities and verify security checklists.
            </p>
        </div>
    </div>

    <!-- MAIN GRID SETTINGS -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left panel: Role list catalog -->
        <div class="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 class="text-xs font-black uppercase text-slate-700 tracking-wider">Available Positions</h3>
            
            <div class="space-y-2.5 id-list-container" id="roles-list-cards-container">
                <!-- Dynamically populated -->
                <div class="text-center py-8">
                    <i class="fa-solid fa-circle-notch fa-spin text-slate-300 text-lg"></i>
                    <p class="text-xs text-slate-400 mt-1.5 font-bold">Querying credentials...</p>
                </div>
            </div>
        </div>

        <!-- Right panel: Interactive Permission Checklist Matrix -->
        <div class="bg-white border rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-4" id="permissions-editor-box">
            <div id="editor-placeholder" class="h-64 flex flex-col items-center justify-center text-center text-slate-400 border border-dashed rounded-xl p-6">
                <i class="fa-solid fa-shield text-3xl text-slate-200"></i>
                <h4 class="font-bold text-slate-500 text-xs mt-3">No Security Card Selected</h4>
                <p class="text-[10px] text-slate-400 mt-1 max-w-xs leading-normal">Choose an enterprise role from the left catalog folder to audit and override permissions mappings.</p>
            </div>

            <!-- Matrix Form (Initially hidden) -->
            <form id="permissions-matrix-form" onsubmit="handlePermissionsSubmit(event)" class="space-y-5 hidden">
                <input type="hidden" id="editingRoleId" value="">

                <div class="border-b pb-4">
                    <span id="roleBadge" class="bg-blue-50 text-blue-700 font-extrabold text-[10px] uppercase px-2.5 py-1 rounded">ADMINISTRATOR</span>
                    <h2 id="roleNameDisplay" class="text-lg font-black text-slate-800 mt-2.5">Administrator Control Matrix</h2>
                    <p id="roleDescriptionDisplay" class="text-xs text-slate-400 font-medium mt-1">Full access to all system features, CRUD templates, and roles management.</p>
                </div>

                <div class="space-y-3.5">
                    <h4 class="text-[10px] font-black uppercase text-slate-600 tracking-wider">Access Control Scope Directives</h4>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4" id="checkboxes-matrix-grid">
                        <!-- Permissions items checklists -->
                        <!-- Loaded dynamically matching permissions lists -->
                    </div>
                </div>

                <!-- Footer buttons save -->
                <div class="flex justify-end gap-2.5 pt-4 border-t">
                    <button type="submit" id="saveMatrixBtn" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md border border-blue-650/10 cursor-pointer transition-all">
                        <i class="fa-solid fa-cloud-arrow-up mr-1.5"></i>Commit Scopes Configuration
                    </button>
                </div>
            </form>
        </div>

    </div>
</div>

<script>
    const adminToken = sessionStorage.getItem('admin_token');

    // Available global permissions tags
    const permissionsCatalog = [
        { id: 'view_dashboard', name: 'View Dashboard Analytics', desc: 'Allows loading dashboard index, graphs volume, and recent audits summaries.' },
        { id: 'manage_users', name: 'Manage User Directory', desc: 'Allows complete creator, editor, and purge operations over user metadata records.' },
        { id: 'manage_roles', name: 'Manage Roles Access Cards', desc: 'Allows editing permissions allocation checklists inside control matrix panels.' },
        { id: 'crud_generate', name: 'Interactive CRUD Generator', desc: 'Allows scaffolding custom dynamic tables, routes, Eloquet models and Blade grids.' },
        { id: 'manage_projects', name: 'Manage Project Pipelines', desc: 'Allows adding pipelines under departments, updating managers and developers.' },
        { id: 'manage_departments', name: 'Manage Corporate Divisions', desc: 'Allows establishing corporate department divisions configurations.' },
        { id: 'view_audits', name: 'View Yajra Audit Logs', desc: 'Allows reading server-side Yajra sessions tables and active system logs journals.' },
        { id: 'edit_templates', name: 'Modify Email Templates', desc: 'Allows dynamic text editing of passwords and project allocations template codes.' }
    ];

    // In-memory data store
    let rolesDataList = [];

    // Load directory card lists
    async function fetchRolesCatalog() {
        const headers = { 'Authorization': adminToken };
        const cardsContainer = document.getElementById('roles-list-cards-container');

        try {
            const res = await fetch('/api/roles', { headers });
            rolesDataList = await res.json();
            
            cardsContainer.innerHTML = rolesDataList.map(r => `
            <div 
                onclick="selectRoleEditor('${r.id}')"
                id="role-card-${r.id}"
                class="role-card p-4 rounded-xl border border-slate-150 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col justify-between"
            >
                <div class="space-y-1">
                    <div class="flex items-center justify-between">
                        <h4 class="font-bold text-slate-800 text-xs">${r.name}</h4>
                        <span class="bg-slate-200 text-slate-600 font-mono font-bold text-[9px] px-1.5 py-0.5 rounded">${r.permissions.length} SC</span>
                    </div>
                    <p class="text-[11px] text-slate-400 mt-1 lines-clamp-2 leading-snug">${r.description}</p>
                </div>
            </div>`).join('');

        } catch (e) {
            cardsContainer.innerHTML = `<p class="text-xs text-rose-500 font-bold py-4 text-center">Failed compiling roles directories.</p>`;
        }
    }

    // Launch matrix layout panel
    function selectRoleEditor(roleId) {
        // Highlight active card
        document.querySelectorAll('.role-card').forEach(card => {
            card.classList.remove('bg-white', 'border-blue-500', 'shadow-md', 'ring-2', 'ring-blue-500/10');
            card.classList.add('bg-slate-50/50', 'border-slate-150');
        });

        const activeCard = document.getElementById(`role-card-${roleId}`);
        if(activeCard) {
            activeCard.classList.remove('bg-slate-50/50', 'border-slate-150');
            activeCard.classList.add('bg-white', 'border-blue-500', 'shadow-md', 'ring-2', 'ring-blue-500/10');
        }

        const role = rolesDataList.find(r => r.id === roleId);
        if(!role) return;

        // Display Editor form, Hide placeholder
        document.getElementById('editor-placeholder').classList.add('hidden');
        const matrixForm = document.getElementById('permissions-matrix-form');
        matrixForm.classList.remove('hidden');

        // Populate fields
        document.getElementById('editingRoleId').value = role.id;
        document.getElementById('roleBadge').textContent = role.name.toUpperCase();
        document.getElementById('roleNameDisplay').textContent = `${role.name} Control Panel Matrix`;
        document.getElementById('roleDescriptionDisplay').textContent = role.description;

        // Render Checkboxes Grid
        const grid = document.getElementById('checkboxes-matrix-grid');
        grid.innerHTML = permissionsCatalog.map(p => {
            const isChecked = role.permissions.includes(p.id);
            return `
            <label class="p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-150 rounded-xl flex items-start gap-3 cursor-pointer select-none transition-colors">
                <input 
                    type="checkbox" 
                    id="perm-${p.id}"
                    name="permission_id"
                    value="${p.id}"
                    ${isChecked ? 'checked' : ''}
                    class="h-[18px] w-[18px] mt-0.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500/20 cursor-pointer"
                >
                <div class="min-w-0">
                    <span class="font-bold text-slate-800 text-xs block leading-tight">${p.name}</span>
                    <span class="text-[10px] text-slate-400 block leading-normal mt-0.5">${p.desc}</span>
                </div>
            </label>`;
        }).join('');
    }

    // Submit altered scopes matrix
    async function handlePermissionsSubmit(e) {
        e.preventDefault();

        const roleId = document.getElementById('editingRoleId').value;
        const selectedPermissions = [];
        document.querySelectorAll('input[name="permission_id"]:checked').forEach(cb => {
            selectedPermissions.push(cb.value);
        });

        const headers = { 'Authorization': adminToken, 'Content-Type': 'application/json' };
        
        try {
            const saveBtn = document.getElementById('saveMatrixBtn');
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1.5"></i>Overwriting permissions matrix...';

            const res = await fetch(`/api/roles/${roleId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ permissions: selectedPermissions })
            });

            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up mr-1.5"></i>Commit Scopes Configuration';

            if(res.ok) {
                triggerAlert('Security matrix synchronized!', 'success');
                // Reload directories
                await fetchRolesCatalog();
                // Persist selection highlight
                selectRoleEditor(roleId);
            } else {
                alert('Authentication system rejected edits.');
            }
        } catch(e) {
            alert('Failure writing credentials mapping.');
            document.getElementById('saveMatrixBtn').disabled = false;
        }
    }

    // Launch initial catalog compile
    fetchRolesCatalog();
</script>
@endsection
