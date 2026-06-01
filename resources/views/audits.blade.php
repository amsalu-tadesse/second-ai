@extends('layouts.app')

@section('title', 'Yajra Activity Audit Journal')

@section('content')
<div class="space-y-6">
    <!-- Header banner -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
            <h1 class="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                <i class="fa-solid fa-shoe-prints text-blue-600"></i> Yajra Real-time Auditing Logs
            </h1>
            <p class="text-slate-400 text-xs font-semibold mt-0.5">
                Comprehensive activity journals, database changes auditing, security traces, and real-time operator alerts.
            </p>
        </div>
    </div>

    <!-- MAIN CARD PANEL -->
    <div class="bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
        
        <!-- Controls panel matching Datatables Layout -->
        <div class="p-5 border-b bg-slate-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="flex items-center gap-2.5 text-xs text-slate-500 font-bold">
                <span>Display</span>
                <select id="dtLength" onchange="adjustLength()" class="bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none text-slate-700 font-bold">
                    <option value="5">5 rows</option>
                    <option value="10" selected>10 rows</option>
                    <option value="25">25 rows</option>
                    <option value="50">50 rows</option>
                </select>
                <span>entries</span>
            </div>

            <!-- Yajra Real-time server search bar -->
            <div class="relative w-full max-w-sm">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <i class="fa-solid fa-magnifying-glass text-xs"></i>
                </span>
                <input 
                    type="text" 
                    id="dtSearch" 
                    oninput="triggerYajraSearch()"
                    placeholder="Search logs action, details, user, IP..." 
                    class="w-full pl-9 pr-4 py-2 bg-white border border-slate-250 rounded-xl text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                >
            </div>
        </div>

        <!-- TABLE GRID -->
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
                <thead>
                    <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-widest font-black text-[9.5px]">
                        <th class="py-3.5 px-5 cursor-pointer hover:bg-slate-100 transition-colors" onclick="toggleSort(0)">Timestamp <i class="fa-solid fa-sort ml-1 text-slate-300"></i></th>
                        <th class="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors" onclick="toggleSort(1)">Operator Handle <i class="fa-solid fa-sort ml-1 text-slate-300"></i></th>
                        <th class="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors" onclick="toggleSort(2)">Action Scope <i class="fa-solid fa-sort ml-1 text-slate-300"></i></th>
                        <th class="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors" onclick="toggleSort(3)">Entity <i class="fa-solid fa-sort ml-1 text-slate-300"></i></th>
                        <th class="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors" onclick="toggleSort(4)">Detailed Audit Description <i class="fa-solid fa-sort ml-1 text-slate-300"></i></th>
                        <th class="py-3.5 px-5 cursor-pointer hover:bg-slate-100 transition-colors" onclick="toggleSort(5)">IP Origin <i class="fa-solid fa-sort ml-1 text-slate-300"></i></th>
                    </tr>
                </thead>
                <tbody id="audits-table-body" class="divide-y divide-slate-100 font-medium text-slate-700 leading-normal">
                    <!-- Yajra Rows injected here -->
                </tbody>
            </table>
        </div>

        <!-- Pagination Footer Controls -->
        <div class="p-5 border-t bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs font-bold text-slate-500">
            <div id="datatable-info">
                Showing 0 to 0 of 0 logs entries (unfiltered)
            </div>

            <!-- Page Selection index buttons lists -->
            <div class="flex items-center gap-1" id="pagination-controls-index">
                <!-- Buttons updated dynamically -->
            </div>
        </div>

    </div>
</div>

<script>
    const adminToken = sessionStorage.getItem('admin_token');

    // Yajra Query criteria parameters state
    let drawCounter = 1;
    let startRowIndex = 0;
    let itemsLength = 10;
    let sortColumnIndex = 0; // default timestamp column index
    let sortDirection = 'desc'; // latest log first
    let searchDebounceTimer = null;

    // Load Yajra datatable elements matching backend spec
    async function fetchYajraLogs() {
        const headers = { 'Authorization': adminToken, 'Content-Type': 'application/json' };
        const tableBody = document.getElementById('audits-table-body');
        
        const requestPayload = {
            draw: drawCounter,
            start: startRowIndex,
            length: itemsLength,
            search: { value: document.getElementById('dtSearch').value },
            order: [{ column: sortColumnIndex, dir: sortDirection }]
        };

        try {
            const res = await fetch('/api/datatables/logs', {
                method: 'POST',
                headers,
                body: JSON.stringify(requestPayload)
            });

            const result = await res.json();
            drawCounter = result.draw;

            renderYajraRows(result.data);
            renderPaginationUi(result.recordsFiltered, result.recordsTotal);

        } catch (e) {
            tableBody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-rose-500 text-xs font-bold font-mono">Yajra audit-database query exception.</td></tr>`;
        }
    }

    // Parse records into UI list
    function renderYajraRows(logs) {
        const tableBody = document.getElementById('audits-table-body');
        
        if (logs.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="py-12 text-center text-slate-400 italic">No events match filter criteria.</td></tr>`;
            return;
        }

        tableBody.innerHTML = logs.map(l => {
            const dateStr = new Date(l.timestamp).toLocaleString();
            
            let badgeClr = 'bg-slate-100 text-slate-700';
            let dotClr = 'bg-slate-400';
            if (l.type === 'success') { badgeClr = 'bg-emerald-50 text-emerald-850 border border-emerald-150'; dotClr = 'bg-emerald-500'; }
            if (l.type === 'warning') { badgeClr = 'bg-amber-50 text-amber-850 border border-amber-150'; dotClr = 'bg-amber-500'; }
            if (l.type === 'danger') { badgeClr = 'bg-rose-50 text-rose-850 border border-rose-150'; dotClr = 'bg-rose-500'; }

            return `
            <tr class="hover:bg-slate-50/70 transition-colors">
                <td class="py-3 px-5 font-bold font-mono text-slate-400 whitespace-nowrap">${dateStr}</td>
                <td class="py-3 px-4 font-bold text-slate-800">
                    <div class="flex items-center gap-1.5">
                        <span class="h-1.5 w-1.5 rounded-full ${dotClr} inline-block"></span>
                        <span>${l.username}</span>
                    </div>
                </td>
                <td class="py-3 px-4">
                    <span class="font-extrabold text-slate-900 tracking-tight text-[10px] uppercase">${l.action}</span>
                </td>
                <td class="py-3 px-4 font-mono font-bold text-[10.5px] text-slate-400">${l.entity.toUpperCase()}</td>
                <td class="py-3 px-4 text-slate-600 font-semibold" style="word-break: break-word;">${l.details}</td>
                <td class="py-3 px-5 font-mono font-black text-slate-500">${l.ipAddress}</td>
            </tr>`;
        }).join('');
    }

    // Render datatables summary and page selections
    function renderPaginationUi(filteredCount, totalCount) {
        const info = document.getElementById('datatable-info');
        const endRow = Math.min(startRowIndex + itemsLength, filteredCount);
        const startRow = filteredCount === 0 ? 0 : startRowIndex + 1;

        info.textContent = `Showing ${startRow} to ${endRow} of ${filteredCount} entries (filtered from ${totalCount} total)`;

        const pagesTotal = Math.ceil(filteredCount / itemsLength);
        const activePage = Math.floor(startRowIndex / itemsLength) + 1;
        const paginationGrid = document.getElementById('pagination-controls-index');

        let htmlButtons = '';
        
        // Return prev toggle button
        htmlButtons += `<button onclick="switchPage(${activePage - 1})" ${activePage <= 1 ? 'disabled' : ''} class="px-2.5 py-1.5 border rounded-lg bg-white text-slate-605 text-slate-500 border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-xs cursor-pointer"><i class="fa-solid fa-chevron-left"></i></button>`;

        for (let i = 1; i <= pagesTotal; i++) {
            const isActive = i === activePage;
            htmlButtons += `
            <button 
                onclick="switchPage(${i})"
                class="px-3 py-1.5 border rounded-lg text-xs font-extrabold cursor-pointer transition-all ${
                    isActive 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10' 
                        : 'bg-white border-slate-200 text-slate-605 hover:bg-slate-50'
                }"
            >
                ${i}
            </button>`;
        }

        // Return next toggle button
        htmlButtons += `<button onclick="switchPage(${activePage + 1})" ${activePage >= pagesTotal ? 'disabled' : ''} class="px-2.5 py-1.5 border rounded-lg bg-white text-slate-605 text-slate-500 border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-xs cursor-pointer"><i class="fa-solid fa-chevron-right"></i></button>`;

        paginationGrid.innerHTML = htmlButtons;
    }

    // Handle Sorting changes
    function toggleSort(columnIndex) {
        if (sortColumnIndex === columnIndex) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortColumnIndex = columnIndex;
            sortDirection = 'asc';
        }
        startRowIndex = 0; // reset to page 1 on sorting modification
        fetchYajraLogs();
    }

    // Handle Page modifications
    function switchPage(pageNumber) {
        startRowIndex = (pageNumber - 1) * itemsLength;
        fetchYajraLogs();
    }

    // Search bar listener with debouncer triggers
    function triggerYajraSearch() {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            startRowIndex = 0; // reset to page 1 on criteria query changes
            fetchYajraLogs();
        }, 350);
    }

    // Rows allocation count adjustments
    function adjustLength() {
        itemsLength = parseInt(document.getElementById('dtLength').value);
        startRowIndex = 0; // reset back
        fetchYajraLogs();
    }

    // Mount initial load and poll every 8 seconds for real-time background transactions!
    fetchYajraLogs();
    setInterval(fetchYajraLogs, 8000);
</script>
@endsection
