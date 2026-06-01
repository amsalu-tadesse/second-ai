@extends('layouts.app')

@section('title', 'Yajra Session Datatable')

@section('content')
<div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
            <h1 class="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                <i class="fa-solid fa-ethernet text-blue-600 animate-pulse"></i> Yajra Admin Sessions Datatable
            </h1>
            <p class="text-slate-400 text-xs font-semibold mt-0.5">
                Live, high-concurrency Yajra server-side sessions query table. Clears stale operators keys instantly.
            </p>
        </div>
    </div>

    <!-- MAIN CARD TABLE -->
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
                    placeholder="Search sessions (serverside filter)..." 
                    class="w-full pl-9 pr-4 py-2 bg-white border border-slate-250 rounded-xl text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                >
            </div>
        </div>

        <!-- TABLE GRID -->
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
                <thead>
                    <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-widest font-black text-[9.5px]">
                        <th class="py-3.5 px-5 cursor-pointer hover:bg-slate-100 transition-colors" onclick="toggleSort(0)">Operator Profile <i class="fa-solid fa-sort ml-1 text-slate-300"></i></th>
                        <th class="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors" onclick="toggleSort(1)">IP Address Route <i class="fa-solid fa-sort ml-1 text-slate-300"></i></th>
                        <th class="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors" onclick="toggleSort(2)">User Agent Spec <i class="fa-solid fa-sort ml-1 text-slate-300"></i></th>
                        <th class="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors" onclick="toggleSort(3)">Access Timestamp <i class="fa-solid fa-sort ml-1 text-slate-300"></i></th>
                        <th class="py-3.5 px-5 text-right">Scope Key Terminate</th>
                    </tr>
                </thead>
                <tbody id="sessions-table-body" class="divide-y divide-slate-100 font-medium text-slate-700">
                    <!-- Yajra Rows injected here -->
                </tbody>
            </table>
        </div>

        <!-- Pagination Footer Controls -->
        <div class="p-5 border-t bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs font-bold text-slate-500">
            <div id="datatable-info">
                Showing 0 to 0 of 0 sessions entries (unfiltered)
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
    let sortColumnIndex = 3; // default access login time column
    let sortDirection = 'desc'; // latest session first
    let searchDebounceTimer = null;

    // Load Yajra datatable elements matching backend spec
    async function fetchYajraSessions() {
        const headers = { 'Authorization': adminToken, 'Content-Type': 'application/json' };
        const tableBody = document.getElementById('sessions-table-body');
        
        const requestPayload = {
            draw: drawCounter,
            start: startRowIndex,
            length: itemsLength,
            search: { value: document.getElementById('dtSearch').value },
            order: [{ column: sortColumnIndex, dir: sortDirection }]
        };

        try {
            const res = await fetch('/api/datatables/sessions', {
                method: 'POST',
                headers,
                body: JSON.stringify(requestPayload)
            });

            const result = await res.json();
            drawCounter = result.draw;

            renderYajraRows(result.data);
            renderPaginationUi(result.recordsFiltered, result.recordsTotal);

        } catch (e) {
            tableBody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-rose-500 text-xs font-bold font-mono">Yajra session-database query exception.</td></tr>`;
        }
    }

    // Parse records into UI list
    function renderYajraRows(sessions) {
        const tableBody = document.getElementById('sessions-table-body');
        
        if (sessions.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="py-12 text-center text-slate-400 italic">No matches conforming to search metrics.</td></tr>`;
            return;
        }

        tableBody.innerHTML = sessions.map(s => {
            const dateStr = new Date(s.loginTime).toLocaleString();
            
            // Check if this cookie represents the CURRENT logged session token
            // Our server mock login marks sessions with isCurrent or IP address match
            const isSelf = s.isCurrent;
            const markerBadge = isSelf
                ? `<span class="bg-blue-100 text-blue-800 border border-blue-200 text-[9px] font-black px-1.5 py-0.5 rounded ml-1">MY SESSION</span>`
                : '';

            return `
            <tr class="hover:bg-slate-50/70 transition-colors">
                <td class="py-4 px-5">
                    <div class="flex items-center gap-2.5">
                        <div class="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200/50 font-black text-xs">
                            ${s.name.charAt(0)}
                        </div>
                        <div>
                            <span class="font-extrabold text-slate-900 block leading-tight">${s.name} ${markerBadge}</span>
                            <span class="text-[10px] text-slate-400 mt-1 font-semibold block leading-none">@${s.username} &bull; ${s.email}</span>
                        </div>
                    </div>
                </td>
                <td class="py-4 px-4 font-mono font-bold text-slate-650">${s.ipAddress}</td>
                <td class="py-4 px-4 max-w-xs truncate font-medium text-slate-400" title="${s.userAgent}">${s.userAgent}</td>
                <td class="py-4 px-4 font-bold text-slate-500">${dateStr}</td>
                <td class="py-4 px-5 text-right">
                    <button 
                        onclick="terminateSessionRecord('${s.id}', ${isSelf})"
                        class="px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 hover:bg-rose-100/80 active:scale-95 transition-all text-[11px] font-bold cursor-pointer"
                    >
                        <i class="fa-solid fa-power-off"></i>
                    </button>
                </td>
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
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
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
        fetchYajraSessions();
    }

    // Handle Page modifications
    function switchPage(pageNumber) {
        startRowIndex = (pageNumber - 1) * itemsLength;
        fetchYajraSessions();
    }

    // Search bar listener with debouncer triggers
    function triggerYajraSearch() {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            startRowIndex = 0; // reset to page 1 on criteria query changes
            fetchYajraSessions();
        }, 350);
    }

    // Rows allocation count adjustments
    function adjustLength() {
        itemsLength = parseInt(document.getElementById('dtLength').value);
        startRowIndex = 0; // reset back
        fetchYajraSessions();
    }

    // Purge active session token
    async function terminateSessionRecord(sessionId, isSelf) {
        if (isSelf) {
            if (!confirm("WARNING:\nYou are requesting to terminate YOUR OWN ACTIVE SESSION. Doing this will log you out immediately and redirect back to the gateway. Proceed?")) {
                return;
            }
        } else {
            if (!confirm("Are you sure you want to terminate this user session? This will force an active operator to log in again.")) {
                return;
            }
        }

        try {
            const res = await fetch(`/api/sessions/${sessionId}`, {
                method: 'DELETE',
                headers: { 'Authorization': adminToken }
            });

            if (res.ok) {
                if (isSelf) {
                    // Self session revoked, clear credentials cookies and reload to login page
                    document.cookie = "admin_session=; Path=/; SameSite=Lax; Max-Age=0";
                    sessionStorage.removeItem('admin_token');
                    window.location.href = '/login';
                } else {
                    triggerAlert('Operator session revoked successfully!', 'success');
                    await fetchYajraSessions();
                }
            } else {
                alert('Session revocation request denied.');
            }
        } catch(e) {
            alert(' Revocation API service failure.');
        }
    }

    // Mount initial load
    fetchYajraSessions();
</script>
@endsection
