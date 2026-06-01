@extends('layouts.app')

@section('title', 'Manage ' . $selected_model['label'])

@section('content')
<div class="space-y-6">
    <!-- View Header banner -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
            <h1 class="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                <i class="fa-solid fa-cube text-blue-600"></i> Manage {{ $selected_model['label'] }} Group
            </h1>
            <p class="text-slate-400 text-xs font-semibold mt-0.5">
                Dynamic scaffolded record grids. View, alter, add or purge entries metrics instantly under Model "{{ $selected_model['name'] }}".
            </p>
        </div>
        
        <div class="flex items-center gap-2 pt-3 sm:pt-0">
            <!-- Purge Scaffold itself -->
            <button 
                onclick="uninstallSchemaScaffold()"
                class="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold py-2 px-3.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
                title="Completely delete model, records, routes and files"
            >
                <i class="fa-solid fa-circle-nodes text-xs"></i>
                <span>Purge Model Scaffolding</span>
            </button>

            <!-- Register entry record -->
            <button 
                onclick="openRecordModal()"
                class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-md border border-blue-600/10 cursor-pointer flex items-center gap-1.5 transition-all"
            >
                <i class="fa-solid fa-plus text-xs"></i>
                <span>Add Record Entry</span>
            </button>
        </div>
    </div>

    <!-- DATA GRID CARD -->
    <div class="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div class="p-5 border-b bg-slate-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h3 class="text-xs font-black uppercase text-slate-700 tracking-wider">Dynamic Scaffolding Records Database</h3>
        </div>

        <div class="overflow-x-auto text-[11px] font-medium text-slate-700">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[9.5px]">
                        @foreach($selected_model['fields'] as $f)
                            <th class="py-3.5 px-4">{{ $f['label'] }}</th>
                        @endforeach
                        <th class="py-3.5 px-4 font-mono">Date Created</th>
                        <th class="py-3.5 px-5 text-right">Actions Operations</th>
                    </tr>
                </thead>
                <tbody id="records-table-body" class="divide-y divide-slate-100">
                    <!-- Loaded via AJAX -->
                    <tr>
                        <td colspan="{{ count($selected_model['fields']) + 2 }}" class="py-12 text-center text-slate-400">
                            <i class="fa-solid fa-circle-notch fa-spin text-xl text-slate-200"></i>
                            <p class="text-xs mt-2 font-bold">Mapping record databases matrices...</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- RECORD ADD/EDIT MODAL -->
<div id="recordModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 opacity-0 pointer-events-none transition-all duration-300">
    <div class="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden transform scale-95 transition-all duration-300">
        
        <div class="p-5 border-b flex items-center justify-between bg-slate-50">
            <h3 class="font-black text-slate-800 text-sm" id="modalTitle">Register Entry Record</h3>
            <button onclick="hideRecordModal()" class="text-slate-400 hover:text-slate-650 h-8 w-8 rounded-lg hover:bg-slate-105 flex items-center justify-center cursor-pointer transition-colors">
                <i class="fa-solid fa-xmark text-base"></i>
            </button>
        </div>

        <form id="recordForm" onsubmit="handleRecordSubmit(event)" class="p-6 space-y-4">
            <input type="hidden" id="editingRecordId" value="">

            @foreach($selected_model['fields'] as $f)
                <div class="space-y-1">
                    <label for="f-{{ $f['name'] }}" class="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                        {{ $f['label'] }} @if($f['required']) <span class="text-rose-500">*</span> @endif
                    </label>

                    @if($f['type'] === 'boolean')
                        <!-- boolean toggle template selector -->
                        <div class="p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between">
                            <span class="text-[10px] text-slate-400 font-bold uppercase">{{ $f['label'] }} State</span>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="f-{{ $f['name'] }}" class="sr-only peer" checked>
                                <div class="w-9 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>
                    @elseif($f['type'] === 'number')
                        <input 
                            type="number" 
                            id="f-{{ $f['name'] }}" 
                            @if($f['required']) required @endif
                            placeholder="e.g. 104"
                            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                        >
                    @elseif($f['type'] === 'date')
                        <input 
                            type="date" 
                            id="f-{{ $f['name'] }}" 
                            @if($f['required']) required @endif
                            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                        >
                    @else
                        <!-- standard text string -->
                        <input 
                            type="text" 
                            id="f-{{ $f['name'] }}" 
                            @if($f['required']) required @endif
                            placeholder="Enter text criteria..."
                            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                        >
                    @endif
                </div>
            @endforeach

            <div class="flex justify-end gap-2 pt-4 border-t mt-4">
                <button type="button" onclick="hideRecordModal()" class="bg-white hover:bg-slate-50 border border-slate-200 text-slate-505 text-slate-500 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer">Discard</button>
                <button type="submit" id="saveRecordBtn" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-blue-650/10 cursor-pointer shadow-md transition-all">Save Entry</button>
            </div>
        </form>

    </div>
</div>

<script>
    const adminToken = sessionStorage.getItem('admin_token');

    // Matching fields variables state
    const modelId = "{{ $selected_model['id'] }}";
    const selectedFields = [];

    // Parse model fields list from layout rendering loops
    @foreach($selected_model['fields'] as $f)
        selectedFields.push({
            name: "{{ $f['name'] }}",
            type: "{{ $f['type'] }}",
            required: "{{ $f['required'] }}" === 'true'
        });
    @endforeach

    // Global records store
    let scaffoldRecordsList = [];

    // Load active records
    async function loadRecordsList() {
        const headers = { 'Authorization': adminToken };
        const tableBody = document.getElementById('records-table-body');

        try {
            const res = await fetch(`/api/crud-generator/records/${modelId}`, { headers });
            scaffoldRecordsList = await res.json();
            
            renderRecordsTable(scaffoldRecordsList);

        } catch (e) {
            tableBody.innerHTML = `<tr><td colspan="${selectedFields.length + 2}" class="py-6 text-center text-rose-500 text-xs font-bold">Dynamic database grid parsing failure.</td></tr>`;
        }
    }

    // Compile rows
    function renderRecordsTable(items) {
        const tableBody = document.getElementById('records-table-body');
        
        if(items.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="${selectedFields.length + 2}" class="py-12 text-center text-slate-400 italic">No records created within this model yet. Click "Add Record Entry" to seed!</td></tr>`;
            return;
        }

        tableBody.innerHTML = items.map(r => {
            const dateStr = new Date(r.createdAt).toLocaleString();
            
            // Generate columns values
            const colsHtml = selectedFields.map(f => {
                const val = r.data[f.name];
                
                if (f.type === 'boolean') {
                    return val 
                        ? `<td class="py-4 px-4"><span class="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-150">YES</span></td>`
                        : `<td class="py-4 px-4"><span class="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded border border-slate-150">NO</span></td>`;
                }
                
                return `<td class="py-4 px-4 font-bold text-slate-800">${val === undefined || val === null ? '' : val}</td>`;
            }).join('');

            return `
            <tr class="hover:bg-slate-55 hover:bg-slate-50/70 transition-colors">
                ${colsHtml}
                <td class="py-4 px-4 font-mono font-bold text-slate-400 whitespace-nowrap">${dateStr}</td>
                <td class="py-4 px-5 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                        <button onclick="openEditRecordModal('${r.id}')" class="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer transition-colors" title="Edit row">
                            <i class="fa-solid fa-pen-nib text-xs"></i>
                        </button>
                        <button onclick="deleteRecordEntry('${r.id}')" class="h-8 w-8 rounded-lg hover:bg-rose-50 text-rose-500 flex items-center justify-center cursor-pointer transition-colors" title="Purge row">
                            <i class="fa-solid fa-trash-can text-xs"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
        }).join('');
    }

    // Modal wrappers
    const modal = document.getElementById('recordModal');
    const form = document.getElementById('recordForm');

    function openRecordModal() {
        form.reset();
        document.getElementById('editingRecordId').value = '';
        document.getElementById('modalTitle').textContent = `Add Record to {{ $selected_model['label'] }}`;
        
        modal.classList.remove('opacity-0', 'pointer-events-none');
        modal.children[0].classList.remove('scale-95');
    }

    function openEditRecordModal(recordId) {
        const item = scaffoldRecordsList.find(r => r.id === recordId);
        if(!item) return;

        form.reset();
        document.getElementById('editingRecordId').value = item.id;
        document.getElementById('modalTitle').textContent = `Amend Record Row`;

        // Bind fields
        selectedFields.forEach(f => {
            const inputEl = document.getElementById(`f-${f.name}`);
            if(inputEl) {
                if(f.type === 'boolean') {
                    inputEl.checked = item.data[f.name] === true;
                } else {
                    inputEl.value = item.data[f.name] !== undefined ? item.data[f.name] : '';
                }
            }
        });

        modal.classList.remove('opacity-0', 'pointer-events-none');
        modal.children[0].classList.remove('scale-95');
    }

    function hideRecordModal() {
        modal.classList.add('opacity-0', 'pointer-events-none');
        modal.children[0].classList.add('scale-95');
    }

    // Submit actions AJAX
    async function handleRecordSubmit(e) {
        e.preventDefault();

        const recordId = document.getElementById('editingRecordId').value;
        const isEditing = !!recordId;

        // Build the payload
        const recordData = {};
        selectedFields.forEach(f => {
            const inputEl = document.getElementById(`f-${f.name}`);
            if(inputEl) {
                if(f.type === 'boolean') {
                    recordData[f.name] = inputEl.checked;
                } else if(f.type === 'number') {
                    recordData[f.name] = Number(inputEl.value);
                } else {
                    recordData[f.name] = inputEl.value;
                }
            }
        });

        const url = isEditing 
            ? `/api/crud-generator/records/${modelId}/${recordId}`
            : `/api/crud-generator/records/${modelId}`;
        const method = isEditing ? 'PUT' : 'POST';

        const headers = { 'Authorization': adminToken, 'Content-Type': 'application/json' };

        try {
            const btn = document.getElementById('saveRecordBtn');
            btn.disabled = true;
            btn.textContent = 'Persist SQL entry...';

            const res = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(recordData)
            });

            btn.disabled = false;
            btn.textContent = 'Save Entry';

            if(res.ok) {
                hideRecordModal();
                triggerAlert(isEditing ? 'Row modified successfully!' : 'Record row entry recorded!', 'success');
                await loadRecordsList();
            } else {
                const data = await res.json();
                alert(data.error || 'Server rejected record entry.');
            }
        } catch(e) {
            alert('Record write error.');
        }
    }

    // Erase row entry
    async function deleteRecordEntry(recordId) {
        if(!confirm('Are you sure you want to completely delete this row entry?')) {
            return;
        }

        try {
            const res = await fetch(`/api/crud-generator/records/${modelId}/${recordId}`, {
                method: 'DELETE',
                headers: { 'Authorization': adminToken }
            });

            if (res.ok) {
                triggerAlert('Entity row deleted successfully', 'success');
                await loadRecordsList();
            } else {
                alert('Purge operation denied.');
            }
        } catch (e) {
            alert('Database request connection error.');
        }
    }

    // UNINSTALL MODEL SCAFFOLD ENTIRELY
    async function uninstallSchemaScaffold() {
        if(!confirm(`CRITICAL WARNING:\nAre you absolutely sure you want to completely UNINSTALL this custom Model Scaffolding and purge all its dynamic database records? This is irreversible.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/crud-generator/models/${modelId}`, {
                method: 'DELETE',
                headers: { 'Authorization': adminToken }
            });

            if (res.ok) {
                triggerAlert('Framework model purged completely', 'success');
                setTimeout(() => {
                    // Redirect back to dashboard panel metrics
                    window.location.href = '/dashboard';
                }, 1000);
            } else {
                alert('Purge request denied');
            }
        } catch (e) {
            alert('Purge operational error.');
        }
    }

    // Launch
    loadRecordsList();
</script>
@endsection
