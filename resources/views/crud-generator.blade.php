@extends('layouts.app')

@section('title', 'Laravel CRUD Generator')

@section('content')
<div class="space-y-6">
    <!-- Header banner -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
            <h1 class="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <i class="fa-solid fa-code text-blue-600"></i> Laravel 10 Yajra CRUD Scaffolder
            </h1>
            <p class="text-slate-400 text-xs font-semibold mt-0.5">
                Generate Controller, Model, View file layouts, route bindings, and database migrations effortlessly.
            </p>
        </div>
    </div>

    <!-- MAIN TWO GRID SPLIT -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Left: Interactive Form (4 cols on wide grid) -->
        <div class="lg:col-span-5 space-y-6">
            <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <h3 class="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
                    <i class="fa-solid fa-screwdriver-wrench text-blue-600"></i> Model Design & Fields Specs
                </h3>

                <form id="generatorForm" onsubmit="handleScaffoldExecution(event)" class="space-y-4.5">
                    
                    <div class="grid grid-cols-2 gap-3.5">
                        <div class="space-y-1">
                            <label for="scafName" class="text-[10px] font-black uppercase text-slate-500 tracking-wider">Model Name</label>
                            <input 
                                type="text" 
                                id="scafName" 
                                required
                                placeholder="e.g. Inventory" 
                                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                            >
                        </div>

                        <div class="space-y-1">
                            <label for="scafLabel" class="text-[10px] font-black uppercase text-slate-500 tracking-wider">Visual Label</label>
                            <input 
                                type="text" 
                                id="scafLabel" 
                                required
                                placeholder="e.g. Asset Stock" 
                                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                            >
                        </div>
                    </div>

                    <!-- Database items list -->
                    <div class="space-y-2">
                        <div class="flex items-center justify-between border-b pb-1.5 border-slate-100">
                            <label class="text-[10px] font-black uppercase text-slate-600 tracking-wider">Database Columns Schema</label>
                            <button 
                                type="button" 
                                onclick="addEmptyFieldRow()"
                                class="text-[10px] text-blue-600 hover:underline font-extrabold flex items-center gap-1 cursor-pointer"
                            >
                                <i class="fa-solid fa-circle-plus"></i> Add Variable
                            </button>
                        </div>

                        <!-- Fields Rows container -->
                        <div id="fields-rows-list-grid" class="space-y-3 max-h-64 overflow-y-auto pr-1">
                            <!-- Injected dynamically -->
                        </div>
                    </div>

                    <!-- Compile Action Submit -->
                    <button 
                        type="submit" 
                        id="generateBtn"
                        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 px-4 rounded-xl shadow-md border border-blue-650/10 cursor-pointer flex items-center justify-center gap-2 active:scale-95 transition-all mt-4"
                    >
                        <i class="fa-solid fa-terminal"></i>
                        <span>Compile & Scaffold Laravel Files</span>
                    </button>

                </form>
            </div>
        </div>

        <!-- Right: Compiled MVC Code Displays (7 cols) -->
        <div class="lg:col-span-7 flex flex-col min-w-0">
            <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex-1 flex flex-col justify-between">
                
                <!-- Tab controller buttons -->
                <div class="flex items-center gap-1.5 border-b pb-3 overflow-x-auto" id="output-tabs-row">
                    <button onclick="switchCodeTab('view')" id="tab-view" class="px-3.5 py-1.5 text-xs font-black rounded-lg border bg-slate-50 border-slate-200 text-slate-500 hover:bg-white cursor-pointer select-none transition-colors shrink-0">view.blade.php</button>
                    <button onclick="switchCodeTab('controller')" id="tab-controller" class="px-3.5 py-1.5 text-xs font-black rounded-lg border bg-slate-50 border-slate-200 text-slate-500 hover:bg-white cursor-pointer select-none transition-colors shrink-0">Controller.php</button>
                    <button onclick="switchCodeTab('model')" id="tab-model" class="px-3.5 py-1.5 text-xs font-black rounded-lg border bg-slate-50 border-slate-200 text-slate-500 hover:bg-white cursor-pointer select-none transition-colors shrink-0">Model.php</button>
                    <button onclick="switchCodeTab('migration')" id="tab-migration" class="px-3.5 py-1.5 text-xs font-black rounded-lg border bg-slate-50 border-slate-200 text-slate-500 hover:bg-white cursor-pointer select-none transition-colors shrink-0">migration.php</button>
                    <button onclick="switchCodeTab('route')" id="tab-route" class="px-3.5 py-1.5 text-xs font-black rounded-lg border bg-slate-50 border-slate-200 text-slate-500 hover:bg-white cursor-pointer select-none transition-colors shrink-0">web.php (Route)</button>
                </div>

                <!-- Code Terminal Content areas -->
                <div class="relative bg-slate-900 border border-slate-950 rounded-xl p-4.5 font-mono text-[11px] text-slate-300 mt-4 h-[350px] overflow-auto leading-relaxed scrollbar-thin select-all">
                    <div class="absolute top-3.5 right-3.5 text-[9px] bg-slate-800 text-slate-500 font-bold tracking-wider px-2 py-0.5 rounded uppercase pointer-events-none select-none">CODE SCAFFOLD</div>
                    <pre id="codeOutputBlock" class="whitespace-pre">/* No code generated yet. Build your data schema on the left card and compile! */</pre>
                </div>

                <!-- Delete active schemas lists details bottom info -->
                <div class="mt-4 pt-3.5 border-t text-[10.5px] text-slate-400 font-semibold flex items-center justify-between">
                    <div class="flex items-center gap-1"><i class="fa-solid fa-cube text-blue-500"></i> Active models count: <span class="text-slate-700 font-bold" id="modelsCountBadge">0</span></div>
                    <div class="text-slate-405 italic">Sidebar links will recreate automatically inside layout lists.</div>
                </div>

            </div>
        </div>

    </div>
</div>

<script>
    const adminToken = sessionStorage.getItem('admin_token');

    // Code state block
    let activeTabCode = 'view';
    let currentScaffoldData = null;

    // Default template row increment counters
    let rowIdxTracker = 0;

    // Seed default starter rows
    function injectSeedRows() {
        // Clear lists
        document.getElementById('fields-rows-list-grid').innerHTML = '';
        
        // Add 3 default rows matching classic layouts (Title, Stock quantity, commission state)
        addFieldRow('title', 'text', 'Asset Title', true);
        addFieldRow('quantity', 'number', 'Quantity Count', true);
        addFieldRow('is_commissioned', 'boolean', 'Active Commission', false);
    }

    function addEmptyFieldRow() {
        addFieldRow('', 'text', '', false);
    }

    function addFieldRow(name = '', type = 'text', label = '', required = false) {
        const container = document.getElementById('fields-rows-list-grid');
        const rId = 'field_row_' + (++rowIdxTracker);

        const dRow = document.createElement('div');
        dRow.id = rId;
        dRow.className = 'p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2 flex flex-col justify-between hover:border-slate-350 transition-all text-xs';
        dRow.innerHTML = `
        <div class="grid grid-cols-2 gap-2">
            <input type="text" placeholder="column_name" value="${name}" class="f-name px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-[10px] font-bold text-slate-800 outline-none" required>
            <select class="f-type px-2 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-bold text-slate-705 text-slate-700">
                <option value="text" ${type === 'text' ? 'selected' : ''}>TEXT</option>
                <option value="number" ${type === 'number' ? 'selected' : ''}>NUMBER</option>
                <option value="date" ${type === 'date' ? 'selected' : ''}>DATE</option>
                <option value="boolean" ${type === 'boolean' ? 'selected' : ''}>BOOLEAN</option>
            </select>
        </div>
        <div class="flex items-center justify-between gap-3 pt-1">
            <input type="text" placeholder="Visual Display Label" value="${label}" class="f-label w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-800 outline-none" required>
            <div class="flex items-center gap-2 shrink-0">
                <label class="flex items-center gap-1 cursor-pointer select-none">
                    <input type="checkbox" class="f-req h-4 w-4 text-blue-600 rounded cursor-pointer" ${required ? 'checked' : ''}>
                    <span class="text-[9px] font-extrabold text-slate-400">REQ</span>
                </label>
                <button type="button" onclick="document.getElementById('${rId}').remove()" class="h-7 w-7 bg-white hover:bg-rose-50 border border-slate-200 text-rose-500 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                    <i class="fa-regular fa-trash-can text-[11px]"></i>
                </button>
            </div>
        </div>`;

        container.appendChild(dRow);
    }

    // Submit and trigger API compilation scaffolding
    async function handleScaffoldExecution(e) {
        e.preventDefault();

        const name = document.getElementById('scafName').value;
        const label = document.getElementById('scafLabel').value;

        // Collect rows values
        const rows = document.querySelectorAll('#fields-rows-list-grid > div');
        const fields = [];
        
        for (const r of rows) {
            const colName = r.querySelector('.f-name').value.toLowerCase().replace(/[^a-z0-9_]/g, '');
            if (!colName) continue;
            
            fields.push({
                name: colName,
                type: r.querySelector('.f-type').value,
                label: r.querySelector('.f-label').value || colName,
                required: r.querySelector('.f-req').checked
            });
        }

        if (fields.length === 0) {
            alert('CRITICAL PRE-REQUISITE:\nYou must provide at least one database column property.');
            return;
        }

        const headers = { 'Authorization': adminToken, 'Content-Type': 'application/json' };

        try {
            const btn = document.getElementById('generateBtn');
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-network-wired fa-spin mr-1"></i>Packaging Eloquent dependencies...';

            const res = await fetch('/api/crud-generator/generate', {
                method: 'POST',
                headers,
                body: JSON.stringify({ name, label, fields })
            });

            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-terminal"></i><span>Compile & Scaffold Laravel Files</span>';

            if (res.ok) {
                currentScaffoldData = await res.json();
                triggerAlert(`CRUD Scaffolded for "${name}"!`, 'success');
                
                // Switch default tab and show code
                switchCodeTab('view');
                
                // Count dynamic update
                updateScaffoldCounters();

                // Re-bind sidebar updates
                setTimeout(() => {
                    // Page reload is necessary under SSR layouts because active layout sidebar list is generated server-side.
                    // Doing a simple reload is instantaneous, fully faithful to Laravel, and mounts everything perfectly!
                    window.location.reload();
                }, 1000);

            } else {
                const data = await res.json();
                alert(data.error || 'Syntax compilation rejected.');
            }
        } catch (e) {
            alert('Scaffolding systems connection error.');
        }
    }

    // Tab buttons controllers
    function switchCodeTab(tabName) {
        activeTabCode = tabName;
        
        document.querySelectorAll('#output-tabs-row button').forEach(b => {
            b.className = 'px-3.5 py-1.5 text-xs font-black rounded-lg border bg-slate-50 border-slate-200 text-slate-500 hover:bg-white cursor-pointer select-none transition-colors shrink-0';
        });

        const activeB = document.getElementById(`tab-${tabName}`);
        if(activeB) {
            activeB.className = 'px-3.5 py-1.5 text-xs font-black rounded-lg border bg-blue-600 border-blue-600 text-white shadow-sm cursor-pointer select-none transition-colors shrink-0';
        }

        // Render matching script code
        const codeBox = document.getElementById('codeOutputBlock');
        if (!currentScaffoldData) {
            codeBox.textContent = '/* Code compilation pending schema configuration left inputs. */';
            return;
        }

        if(tabName === 'view') codeBox.textContent = currentScaffoldData.viewCode;
        if(tabName === 'controller') codeBox.textContent = currentScaffoldData.controllerCode;
        if(tabName === 'model') codeBox.textContent = currentScaffoldData.modelCode;
        if(tabName === 'migration') codeBox.textContent = currentScaffoldData.migrationCode;
        if(tabName === 'route') codeBox.textContent = currentScaffoldData.routeCode;
    }

    // Refresh model counters
    async function updateScaffoldCounters() {
        try {
            const res = await fetch('/api/sys/stats', { headers: { 'Authorization': adminToken } });
            const data = await res.json();
            document.getElementById('modelsCountBadge').textContent = data.customCrudCount;
        } catch(e) {}
    }

    // Launch
    injectSeedRows();
    updateScaffoldCounters();
</script>
@endsection
