@extends('layouts.app')

@section('title', 'Corporate Pipelines & Departments Catalog')

@section('content')
<div class="space-y-6">
    <!-- Header banner -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
            <h1 class="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <i class="fa-solid fa-diagram-project text-blue-600"></i> Departments & Projects Pipelines
            </h1>
            <p class="text-slate-400 text-xs font-semibold mt-0.5">
                Register departments divisions, deploy project pipelines, appoint managers and developers.
            </p>
        </div>

        <div class="flex items-center gap-2 pt-3 sm:pt-0">
            <button 
                onclick="openCreateDeptModal()"
                class="bg-white hover:bg-slate-50 border text-slate-650 text-xs font-bold py-2 px-3 rounded-xl cursor-pointer transition-all shadow-sm"
            >
                <i class="fa-solid fa-square-plus mr-1"></i>New Division
            </button>
            <button 
                onclick="openCreateProjectModal()"
                class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-md border border-blue-600/10 cursor-pointer flex items-center gap-1.5 transition-all"
            >
                <i class="fa-solid fa-folder-plus text-xs"></i>
                <span>Deploy Project</span>
            </button>
        </div>
    </div>

    <!-- MAIN GRID SPLIT LAYOUT -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left panel: Departments Lists directories -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 class="text-xs font-black uppercase text-slate-700 tracking-wider">Corporate Divisions</h3>
            
            <div id="departments-list-container" class="space-y-3">
                <!-- Loaded via AJAX -->
                <div class="text-center py-10">
                    <i class="fa-solid fa-circle-notch fa-spin text-slate-300 text-lg"></i>
                    <p class="text-xs text-slate-400 mt-1 font-semibold">Reading divisions...</p>
                </div>
            </div>
        </div>

        <!-- Right panel: Active Projects Pipelines lists -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm lg:col-span-2 space-y-4">
            <h3 class="text-xs font-black uppercase text-slate-700 tracking-wider">Active Deployments Pipeline</h3>
            
            <div id="projects-catalog-grid" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Loaded via AJAX -->
                <div class="text-center py-20 col-span-2">
                    <i class="fa-solid fa-circle-notch fa-spin text-slate-300 text-lg"></i>
                    <p class="text-xs text-slate-400 mt-2 font-bold">Deploying Pipelines indices...</p>
                </div>
            </div>
        </div>

    </div>
</div>

<!-- CREATE DEPARTMENT DIV MODAL -->
<div id="deptModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 opacity-0 pointer-events-none transition-all duration-300">
    <div class="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden transform scale-95 transition-all duration-300">
        
        <div class="p-5 border-b flex items-center justify-between bg-slate-50">
            <h3 class="font-black text-slate-800 text-sm">Create Division / Department</h3>
            <button onclick="hideDeptModal()" class="text-slate-400 hover:text-slate-650 h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors">
                <i class="fa-solid fa-xmark text-base"></i>
            </button>
        </div>

        <form id="deptForm" onsubmit="handleDeptSubmit(event)" class="p-6 space-y-4">
            <div class="space-y-1">
                <label for="deptName" class="text-[10px] font-black uppercase text-slate-500 tracking-wider">Division Name</label>
                <input 
                    type="text" 
                    id="deptName" 
                    required 
                    placeholder="e.g. Sales Division" 
                    class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                >
            </div>

            <div class="space-y-1">
                <label for="deptDescription" class="text-[10px] font-black uppercase text-slate-500 tracking-wider">Mission Scope</label>
                <textarea 
                    id="deptDescription" 
                    rows="3"
                    placeholder="Describe division functions..." 
                    class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none resize-none"
                ></textarea>
            </div>

            <div class="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onclick="hideDeptModal()" class="bg-white hover:bg-slate-50 border border-slate-200 text-slate-605 text-slate-500 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer">Discard</button>
                <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-blue-650/10 cursor-pointer">Commit New Div</button>
            </div>
        </form>
    </div>
</div>

<!-- CREATE PROJECT PIPELINE MODAL -->
<div id="projectModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 opacity-0 pointer-events-none transition-all duration-300">
    <div class="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden transform scale-95 transition-all duration-300">
        
        <div class="p-5 border-b flex items-center justify-between bg-slate-50">
            <h3 class="font-black text-slate-800 text-sm" id="projectModalTitle">Deploy Project Pipeline</h3>
            <button onclick="hideProjectModal()" class="text-slate-400 hover:text-slate-650 h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors">
                <i class="fa-solid fa-xmark text-base"></i>
            </button>
        </div>

        <form id="projectForm" onsubmit="handleProjectSubmit(event)" class="p-6 space-y-4">
            <input type="hidden" id="editingProjectId" value="">

            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                    <label for="projName" class="text-[10px] font-black uppercase text-slate-500 tracking-wider">Project Title</label>
                    <input 
                        type="text" 
                        id="projName" 
                        required 
                        placeholder="e.g. Cloud Database Optimization" 
                        class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                    >
                </div>

                <div class="space-y-1">
                    <label for="projDept" class="text-[10px] font-black uppercase text-slate-500 tracking-wider">Parent Division</label>
                    <select 
                        id="projDept" 
                        required 
                        class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    >
                        <!-- Loaded via AJAX -->
                    </select>
                </div>
            </div>

            <div class="space-y-1">
                <label for="projDescription" class="text-[10px] font-black uppercase text-slate-500 tracking-wider">Description Metric</label>
                <textarea 
                    id="projDescription" 
                    rows="2"
                    placeholder="Scope, milestones and deliverables parameters..." 
                    class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none resize-none"
                ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                    <label for="projManager" class="text-[10px] font-black uppercase text-slate-500 tracking-wider">Project Manager Appointment</label>
                    <select 
                        id="projManager" 
                        class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    >
                        <option value="">No appointed Manager</option>
                        <!-- Loaded via AJAX filters (only managers role) -->
                    </select>
                </div>

                <div class="space-y-1">
                    <label for="projStatus" class="text-[10px] font-black uppercase text-slate-500 tracking-wider">Deployment Status</label>
                    <select 
                        id="projStatus" 
                        required
                        class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    >
                        <option value="planning">PLANNING (Stage 0)</option>
                        <option value="active">DEVELOPING/ACTIVE (Stage 1)</option>
                        <option value="completed">COMPLETED/LIVE (Stage 2)</option>
                    </select>
                </div>
            </div>

            <div class="space-y-1.5">
                <label class="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Assigned Collaborators</label>
                <div id="members-list-checkbox-grid" class="max-h-28 overflow-y-auto border border-slate-150 p-2.5 rounded-xl bg-slate-50 divide-y divide-slate-200/50 text-xs">
                    <!-- Loaded dynamically showing available team members checkbox -->
                </div>
            </div>

            <div class="flex justify-end gap-2 pt-4 border-t mt-4">
                <button type="button" onclick="hideProjectModal()" class="bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer">Close</button>
                <button type="submit" id="submitProjBtn" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-blue-650/10 cursor-pointer shadow-md transition-all">Save Pipeline</button>
            </div>
        </form>
    </div>
</div>

<script>
    const adminToken = sessionStorage.getItem('admin_token');

    let departmentsList = [];
    let projectsList = [];
    let directoryUserList = [];

    // Poll metadata components
    async function loadPipelinesData() {
        const headers = { 'Authorization': adminToken };

        try {
            // Fetch users list first for manager selection/members checklist assignments
            const rUsers = await fetch('/api/users', { headers });
            directoryUserList = await rUsers.json();

            // Setup Project Manager Select options (Any user with PM role or Admin)
            const pmSelect = document.getElementById('projManager');
            const managers = directoryUserList.filter(u => u.roleId === 'role_pm' || u.roleId === 'role_admin');
            pmSelect.innerHTML = '<option value="">No appointed Manager</option>' + 
                                  managers.map(m => `<option value="${m.id}">${m.name} (${m.roleName})</option>`).join('');

            // Setup Members checkbox selection list
            const membersGrid = document.getElementById('members-list-checkbox-grid');
            membersGrid.innerHTML = directoryUserList.map(u => `
            <label class="flex items-center gap-2.5 py-1.5 cursor-pointer">
                <input type="checkbox" name="proj_member" value="${u.id}" class="h-4.5 w-4.5 text-blue-600 rounded cursor-pointer">
                <div class="min-w-0">
                    <span class="font-bold text-slate-800 text-[11px] block">${u.name}</span>
                    <span class="text-[9px] text-slate-400 block">${u.roleName} &bull; ${u.departmentName}</span>
                </div>
            </label>`).join('');

            // Fetch and render departments and projects databases
            await fetchDepartments();
            await fetchProjects();

        } catch (e) {
            console.error('Failure parsing pipelines resources metadata', e);
        }
    }

    // Load department directory
    async function fetchDepartments() {
        const headers = { 'Authorization': adminToken };
        const container = document.getElementById('departments-list-container');
        
        try {
            const res = await fetch('/api/departments', { headers });
            departmentsList = await res.json();
            
            // Populate select in project forms
            document.getElementById('projDept').innerHTML = departmentsList.map(d => `<option value="${d.id}">${d.name}</option>`).join('');

            if (departmentsList.length === 0) {
                container.innerHTML = `<div class="p-6 text-center text-slate-405 font-bold italic border border-dashed rounded-xl">No division mapped. Create a division to deploy projects!</div>`;
                return;
            }

            container.innerHTML = departmentsList.map(d => `
            <div class="p-3.5 bg-slate-50/50 hover:bg-white hover:border-slate-350 hover:shadow-sm border border-slate-150 rounded-xl transition-all">
                <div class="flex items-center justify-between">
                    <h4 class="font-extrabold text-slate-800 text-xs">${d.name}</h4>
                    <span class="bg-blue-50 text-blue-700 font-mono font-bold text-[9px] px-1.5 py-0.5 rounded-lg border border-blue-100">Division</span>
                </div>
                <p class="text-[10px] text-slate-400 leading-relaxed mt-2 font-semibold">${d.description || 'HQ Ops Sandbox zone.'}</p>
            </div>`).join('');

        } catch(e) {
            container.innerHTML = `<p class="text-xs text-rose-500 font-bold py-4 text-center">Division reading fault.</p>`;
        }
    }

    // Load projects catalog
    async function fetchProjects() {
        const headers = { 'Authorization': adminToken };
        const grid = document.getElementById('projects-catalog-grid');

        try {
            const res = await fetch('/api/projects', { headers });
            projectsList = await res.json();

            if (projectsList.length === 0) {
                grid.innerHTML = `<div class="p-12 text-center text-slate-400 border border-dashed rounded-2xl col-span-2 flex flex-col items-center justify-center"><i class="fa-regular fa-folder-open text-3xl"></i><p class="text-xs mt-2.5 font-bold">Pipelines registry empty. Setup your project target milestones.</p></div>`;
                return;
            }

            grid.innerHTML = projectsList.map(p => {
                let badgeClr = 'bg-gray-100 text-gray-700';
                let tagStr = p.status.toUpperCase();
                if (p.status === 'active') badgeClr = 'bg-blue-50 text-blue-700 border border-blue-200/50';
                if (p.status === 'completed') badgeClr = 'bg-emerald-50 text-emerald-700 border border-emerald-200/50';
                if (p.status === 'planning') badgeClr = 'bg-amber-50 text-amber-700 border border-amber-200/50';

                return `
                <div class="bg-slate-50/35 border hover:bg-slate-50/50 hover:shadow-md border-slate-150 rounded-2xl p-4.5 flex flex-col justify-between transition-all">
                    <div>
                        <div class="flex items-start justify-between gap-1.5 border-b border-slate-100 pb-2.5">
                            <div>
                                <h4 class="font-black text-slate-800 text-xs truncate leading-snug">${p.name}</h4>
                                <span class="bg-white border text-slate-400 font-mono font-bold text-[8.5px] px-1.5 py-0.5 rounded uppercase mt-1 inline-block">${p.departmentName}</span>
                            </div>
                            <span class="text-[9px] font-black px-2 py-0.5 rounded-full ${badgeClr}">${tagStr}</span>
                        </div>
                        
                        <p class="text-[11px] text-slate-500 font-semibold mt-3 whitespace-pre-wrap leading-relaxed truncate-2-lines">${p.description || 'No pipelines criteria annotated.'}</p>
                    </div>

                    <div class="mt-4 pt-3 border-t border-dashed border-slate-150 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <div>
                            <div class="leading-none text-slate-500 font-bold">PM:</div>
                            <div class="font-bold text-blue-600 mt-1 max-w-28 truncate leading-tight">${p.managerName}</div>
                        </div>
                        <div class="flex items-center gap-1">
                            <button onclick="openEditProjectModal('${p.id}')" class="h-8 w-8 hover:bg-slate-150 text-slate-600 rounded-lg flex items-center justify-center cursor-pointer transition-colors" title="Edit project scope">
                                <i class="fa-solid fa-pen-to-square text-xs"></i>
                            </button>
                            <button onclick="deleteProjectRecord('${p.id}')" class="h-8 w-8 hover:bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center cursor-pointer transition-colors" title="Scrape project pipeline">
                                <i class="fa-solid fa-trash-can text-xs"></i>
                            </button>
                        </div>
                    </div>
                </div>`;
            }).join('');

        } catch (e) {
            grid.innerHTML = `<p class="text-xs text-rose-500 font-bold py-6 text-center col-span-2">Pipelines load failure.</p>`;
        }
    }

    // Modal view triggers departments
    const dModal = document.getElementById('deptModal');
    const dfForm = document.getElementById('deptForm');

    function openCreateDeptModal() {
        dfForm.reset();
        dModal.classList.remove('opacity-0', 'pointer-events-none');
        dModal.children[0].classList.remove('scale-95');
    }

    function hideDeptModal() {
        dModal.classList.add('opacity-0', 'pointer-events-none');
        dModal.children[0].classList.add('scale-95');
    }

    async function handleDeptSubmit(e) {
        e.preventDefault();
        const name = document.getElementById('deptName').value;
        const description = document.getElementById('deptDescription').value;

        const headers = { 'Authorization': adminToken, 'Content-Type': 'application/json' };
        
        try {
            const res = await fetch('/api/departments', {
                method: 'POST',
                headers,
                body: JSON.stringify({ name, description })
            });

            if(res.ok) {
                hideDeptModal();
                triggerAlert('Division registered successfully', 'success');
                await fetchDepartments();
            } else {
                const data = await res.json();
                alert(data.error || 'Identity creation rejection.');
            }
        } catch(e) {
            alert('Corporate write system failure.');
        }
    }

    // Modal view triggers project pipeline
    const pModal = document.getElementById('projectModal');
    const pfForm = document.getElementById('projectForm');

    function openCreateProjectModal() {
        if(departmentsList.length === 0) {
            alert('CRITICAL PRE-REQUISITE:\nYou must establish at least one Division/Department before deploying pipelines.');
            return;
        }

        pfForm.reset();
        document.getElementById('editingProjectId').value = '';
        document.getElementById('projectModalTitle').textContent = 'Deploy Project Pipeline';
        document.getElementById('submitProjBtn').textContent = 'Commit Pipeline';

        // Clear collaborators checkbox selectors
        document.querySelectorAll('input[name="proj_member"]').forEach(cb => cb.checked = false);

        pModal.classList.remove('opacity-0', 'pointer-events-none');
        pModal.children[0].classList.remove('scale-95');
    }

    function openEditProjectModal(projectId) {
        const p = projectsList.find(item => item.id === projectId);
        if(!p) return;

        pfForm.reset();
        document.getElementById('editingProjectId').value = p.id;
        document.getElementById('projName').value = p.name;
        document.getElementById('projDept').value = p.departmentId;
        document.getElementById('projDescription').value = p.description;
        document.getElementById('projManager').value = p.managerId || '';
        document.getElementById('projStatus').value = p.status;

        // Check collaborator assignment checkbox lists
        document.querySelectorAll('input[name="proj_member"]').forEach(cb => {
            cb.checked = p.memberIds.includes(cb.value);
        });

        document.getElementById('projectModalTitle').textContent = `Alter Pipeline: ${p.name}`;
        document.getElementById('submitProjBtn').textContent = 'Patch Milestones Settings';

        pModal.classList.remove('opacity-0', 'pointer-events-none');
        pModal.children[0].classList.remove('scale-95');
    }

    function hideProjectModal() {
        pModal.classList.add('opacity-0', 'pointer-events-none');
        pModal.children[0].classList.add('scale-95');
    }

    async function handleProjectSubmit(e) {
        e.preventDefault();

        const projectId = document.getElementById('editingProjectId').value;
        const name = document.getElementById('projName').value;
        const departmentId = document.getElementById('projDept').value;
        const description = document.getElementById('projDescription').value;
        const managerId = document.getElementById('projManager').value;
        const status = document.getElementById('projStatus').value;

        const memberIds = [];
        document.querySelectorAll('input[name="proj_member"]:checked').forEach(cb => {
            memberIds.push(cb.value);
        });

        const isEditing = !!projectId;
        const url = isEditing ? `/api/projects/${projectId}` : '/api/projects';
        const method = isEditing ? 'PUT' : 'POST';

        const headers = { 'Authorization': adminToken, 'Content-Type': 'application/json' };
        const bodyContent = { name, departmentId, description, managerId, status, memberIds };

        try {
            const submitBtn = document.getElementById('submitProjBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Writing logs...';

            const res = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(bodyContent)
            });

            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Pipeline';

            if(res.ok) {
                hideProjectModal();
                triggerAlert(isEditing ? 'Pipeline criteria adjusted.' : 'Pipeline deployed successfully.', 'success');
                await fetchProjects();
            } else {
                const data = await res.json();
                alert(data.error || 'Authentication server rejected deployment.');
            }
        } catch(e) {
            alert('Write system connection error.');
        }
    }

    // Scrape project record
    async function deleteProjectRecord(projectId) {
        const p = projectsList.find(item => item.id === projectId);
        if (!p) return;

        if(!confirm(`Are you absolutely sure you want to completely scrape the project pipeline metrics for "${p.name}"?`)) {
            return;
        }

        try {
            const res = await fetch(`/api/projects/${projectId}`, {
                method: 'DELETE',
                headers: { 'Authorization': adminToken }
            });

            if (res.ok) {
                triggerAlert('Pipeline scrapped', 'success');
                await fetchProjects();
            } else {
                alert('Purge request denied');
            }
        } catch (e) {
            alert('Scrapping operations error.');
        }
    }

    // Launch pipeline directories load
    loadPipelinesData();
</script>
@endsection
