@extends('layouts.app')

@section('title', 'Dashboard Analytics')

@section('content')
<div class="space-y-6">
    <!-- Page Header and Sync Block -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
            <h1 class="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <span class="text-blue-600">Control</span> Panel Analytics
            </h1>
            <p class="text-slate-505 text-slate-400 text-xs font-semibold mt-0.5">
                Real-time Yajra datatables audit log volume, active system audits, and project structures.
            </p>
        </div>
        
        <button 
            onclick="refreshDashboardData()"
            id="syncBtn"
            class="mt-3 sm:mt-0 px-4 py-2 border border-slate-200 text-xs font-black rounded-xl bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all"
        >
            <i class="fa-solid fa-arrows-rotate text-emerald-500 pulse-active" id="syncIcon"></i>
            <span>Active Pull Sync</span>
        </button>
    </div>

    <!-- AdminLTE Bento Box Indicators -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <!-- Indicator 1 -->
        <a href="/users" class="bg-white p-5 rounded-2xl border-b-4 border-blue-500 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-slate-100">
            <div class="space-y-1">
                <div id="stat-userCount" class="text-3xl font-black font-mono text-slate-900">{{ $stats['userCount'] }}</div>
                <div class="text-[10px] uppercase font-black tracking-wider text-slate-400">Directory Users</div>
            </div>
            <div class="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <i class="fa-solid fa-users text-xl w-6 text-center"></i>
            </div>
        </a>

        <!-- Indicator 2 -->
        <a href="/sessions" class="bg-white p-5 rounded-2xl border-b-4 border-emerald-500 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-slate-100">
            <div class="space-y-1">
                <div id="stat-activeSessions" class="text-3xl font-black font-mono text-slate-900">{{ $stats['activeSessions'] }}</div>
                <div class="text-[10px] uppercase font-black tracking-wider text-slate-400">Yajra Sessions</div>
            </div>
            <div class="p-3 bg-emerald-50 text-emerald-650 rounded-xl text-emerald-600">
                <i class="fa-solid fa-laptop-code text-xl w-6 text-center"></i>
            </div>
        </a>

        <!-- Indicator 3 -->
        <a href="/departments-projects" class="bg-white p-5 rounded-2xl border-b-4 border-yellow-500 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-slate-100">
            <div class="space-y-1">
                <div id="stat-deptCount" class="text-3xl font-black font-mono text-slate-900">{{ $stats['deptCount'] }}</div>
                <div class="text-[10px] uppercase font-black tracking-wider text-slate-400">Departments</div>
            </div>
            <div class="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                <i class="fa-solid fa-building-user text-xl w-6 text-center"></i>
            </div>
        </a>

        <!-- Indicator 4 -->
        <a href="/crud-generator" class="bg-white p-5 rounded-2xl border-b-4 border-rose-500 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-slate-100">
            <div class="space-y-1">
                <div id="stat-customCrudCount" class="text-3xl font-black font-mono text-slate-900">{{ $stats['customCrudCount'] }}</div>
                <div class="text-[10px] uppercase font-black tracking-wider text-slate-400">Scaffolded CRUDs</div>
            </div>
            <div class="p-3 bg-rose-50 text-rose-600 rounded-xl">
                <i class="fa-solid fa-code-pull-request text-xl w-6 text-center"></i>
            </div>
        </a>

    </div>

    <!-- Analytics Charts Rows -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Activities Chart Left -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 lg:col-span-2 flex flex-col justify-between shadow-sm">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 class="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5 leading-none">
                    <i class="fa-solid fa-chart-line text-blue-600"></i> Activity Heartbeat Volume
                </h3>
                <span class="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded font-mono">Live Sync</span>
            </div>

            <!-- Custom Canvas Line Chart -->
            <div class="relative h-64 w-full flex items-center justify-center">
                <canvas id="lineChartCanvas" class="w-full h-full"></canvas>
            </div>
        </div>

        <!-- Role distribution charts Right -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 class="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5 leading-none">
                    <i class="fa-solid fa-circle-nodes text-blue-600"></i> User Directory Allocation
                </h3>
                <span class="text-[10px] text-slate-400 font-bold">Pie Chart</span>
            </div>

            <!-- Donut circular chart -->
            <div class="h-44 w-full flex items-center justify-center relative">
                <canvas id="pieChartCanvas" class="w-full h-full max-h-[160px]"></canvas>
            </div>

            <div class="space-y-1.5 text-xs pt-3 border-t border-slate-150 mt-3" id="pie-labels-container">
                <!-- Dynamically updated -->
            </div>
        </div>

    </div>

    <!-- Departments, projects & active system audit blocks -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Active Projects Tracker list -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col shadow-sm">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 shrink-0">
                <h3 class="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5 leading-none">
                    <i class="fa-solid fa-folder-tree text-blue-600"></i> Departments & Project Pipelines
                </h3>
                <a href="/departments-projects" class="text-xs text-blue-600 hover:underline font-bold">Add Project</a>
            </div>

            <div class="space-y-3 max-h-80 overflow-y-auto pr-1 flex-1" id="projects-feed-container">
                <!-- Loaded via AJAX -->
                <div class="text-center py-10">
                    <i class="fa-solid fa-circle-notch fa-spin text-slate-300 text-xl"></i>
                    <p class="text-xs text-slate-400 mt-2 font-semibold">Parsing projects pipeline...</p>
                </div>
            </div>
        </div>

        <!-- Real-time Active System Audits Logs feed -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col shadow-sm">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 shrink-0">
                <h3 class="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5 leading-none">
                    <i class="fa-solid fa-clock-rotate-left text-blue-600"></i> Recent Active Audit Logs
                </h3>
                <a href="/audits" class="text-xs text-blue-600 hover:underline font-bold">Interactive Audit Log</a>
            </div>

            <div class="space-y-3.5 max-h-80 overflow-y-auto pr-1 flex-1" id="logs-feed-container">
                <!-- Loaded via AJAX -->
                <div class="text-center py-10">
                    <i class="fa-solid fa-circle-notch fa-spin text-slate-300 text-xl"></i>
                    <p class="text-xs text-slate-400 mt-2 font-semibold">Polling recent transactions...</p>
                </div>
            </div>
        </div>

    </div>
</div>

<script>
    // Access auth token
    const token = sessionStorage.getItem('admin_token');

    // Chart constants for Line and Pie
    const lineCanvas = document.getElementById('lineChartCanvas');
    const pieCanvas = document.getElementById('pieChartCanvas');

    // Load recent stats, projects lists and recent audits
    async function loadDashboardData() {
        const headers = { 'Authorization': token, 'Content-Type': 'application/json' };
        
        try {
            // Stats
            const rStats = await fetch('/api/sys/stats', { headers });
            const stats = await rStats.json();
            
            document.getElementById('stat-userCount').textContent = stats.userCount;
            document.getElementById('stat-activeSessions').textContent = stats.activeSessions;
            document.getElementById('stat-deptCount').textContent = stats.deptCount;
            document.getElementById('stat-customCrudCount').textContent = stats.customCrudCount;

            // Pie allocation details update
            const totalUserVal = stats.userCount;
            const adminsCount = 1;
            const pmCount = 2;
            const standardMembers = totalUserVal > 3 ? totalUserVal - 3 : 2;
            
            drawPieChart([
                { name: 'Administrators', count: adminsCount, fill: '#3b82f6' },
                { name: 'Project Managers', count: pmCount, fill: '#eab308' },
                { name: 'Team Members', count: standardMembers, fill: '#10b981' }
            ]);

            // Projects Feed load
            const rProjects = await fetch('/api/projects', { headers });
            const projects = await rProjects.json();
            const projectsContainer = document.getElementById('projects-feed-container');
            
            if (projects.length === 0) {
                projectsContainer.innerHTML = `<div class="text-center py-12 text-slate-400 border border-dashed rounded-2xl"><i class="fa-regular fa-folder-open text-2xl"></i><p class="text-xs mt-2 font-bold">No active pipelines designed. Create some!</p></div>`;
            } else {
                projectsContainer.innerHTML = projects.slice(0, 4).map(p => {
                    let badgeClr = 'bg-gray-100 text-gray-700';
                    let statusStr = p.status.toUpperCase();
                    if (p.status === 'active') badgeClr = 'bg-blue-50 text-blue-700 border border-blue-200';
                    if (p.status === 'completed') badgeClr = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
                    if (p.status === 'planning') badgeClr = 'bg-yellow-50 text-yellow-700 border border-yellow-250';

                    return `
                    <div class="p-4 bg-slate-50 border border-slate-150/80 rounded-xl hover:border-slate-300 transition-all">
                        <div class="flex items-start justify-between gap-1.5">
                            <div>
                                <h4 class="text-xs font-bold text-slate-800 leading-tight">${p.name}</h4>
                                <span class="text-[9px] uppercase font-black tracking-wider text-slate-400 block mt-1">${p.departmentName}</span>
                            </div>
                            <span class="text-[9px] font-black px-2 py-0.5 rounded-full ${badgeClr}">${statusStr}</span>
                        </div>
                        
                        <p class="text-[11px] text-slate-550 text-slate-500 mt-2 line-clamp-2">${p.description || 'No pipelines metrics annotated.'}</p>
                        
                        <div class="border-t border-dashed border-slate-200/80 my-2 pt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <div>PM: <span class="font-bold text-blue-600">${p.managerName}</span></div>
                            <div>Collaborators: <span class="bg-white border text-slate-700 px-1.5 py-0.5 rounded font-sans font-bold">${p.memberIds.length}</span></div>
                        </div>
                    </div>`;
                }).join('');
            }

            // Recent Audits Feed load
            const rLogs = await fetch('/api/datatables/logs', {
                method: 'POST',
                headers,
                body: JSON.stringify({ start: 0, length: 5 })
            });
            const logsData = await rLogs.json();
            const logsContainer = document.getElementById('logs-feed-container');

            if (logsData.data.length === 0) {
                logsContainer.innerHTML = `<div class="text-center py-12 text-slate-400 border border-dashed rounded-2xl"><i class="fa-regular fa-bell-slash text-2xl"></i><p class="text-xs mt-2 font-bold">Auditing service silent.</p></div>`;
            } else {
                logsContainer.innerHTML = logsData.data.map(log => {
                    let badgeClr = 'bg-slate-100 text-slate-800 border-slate-200';
                    let iconCode = 'fa-circle-info text-slate-400';
                    if (log.type === 'success') { badgeClr = 'bg-emerald-50 text-emerald-700 border-emerald-200'; iconCode = 'fa-circle-check text-emerald-500'; }
                    if (log.type === 'warning') { badgeClr = 'bg-amber-50 text-amber-700 border-amber-200'; iconCode = 'fa-circle-exclamation text-amber-500'; }
                    if (log.type === 'danger') { badgeClr = 'bg-rose-50 text-rose-700 border-rose-100'; iconCode = 'fa-triangle-exclamation text-rose-500'; }

                    const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                    return `
                    <div class="p-3 rounded-xl border text-[11px] flex items-start gap-2.5 transition-colors ${badgeClr}">
                        <i class="fa-solid ${iconCode} text-sm shrink-0 mt-0.5"></i>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between gap-1">
                                <span class="font-black text-slate-900 tracking-tight text-[10px] uppercase">${log.action}</span>
                                <span class="text-[9px] text-slate-400 font-mono">${timeStr}</span>
                            </div>
                            <p class="text-slate-700 font-semibold mt-1 leading-normal truncate-3-lines">${log.details}</p>
                            
                            <div class="pt-1.5 flex items-center justify-between text-[9px] text-slate-400 border-t border-slate-200 border-dashed mt-1.5 font-mono">
                                <div>BY: <span class="font-bold text-slate-600">${log.username}</span></div>
                                <div>IP: <span class="font-bold text-slate-600">${log.ipAddress}</span></div>
                            </div>
                        </div>
                    </div>`;
                }).join('');
            }

            // Draw line graph
            drawLineChart(stats.logsCount);

        } catch (e) {
            console.error('Error synchronization dashboard', e);
        }
    }

    // Canvas drawing helper for Line Graph
    function drawLineChart(logsCount) {
        if (!lineCanvas) return;
        const ctx = lineCanvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        
        // Resize according to client width
        const width = lineCanvas.parentElement.clientWidth;
        const height = 250;
        lineCanvas.width = width * dpr;
        lineCanvas.height = height * dpr;
        lineCanvas.style.width = width + 'px';
        lineCanvas.style.height = height + 'px';
        ctx.scale(dpr, dpr);

        const dataPoints = [12, 26, 19, logsCount > 10 ? Math.min(logsCount, 85) : 35, 14];
        const labels = ['09:00', '11:00', '13:00', '15:00', '17:00'];

        const paddingLeft = 40;
        const paddingRight = 20;
        const paddingTop = 20;
        const paddingBottom = 30;

        const chartWidth = width - paddingLeft - paddingRight;
        const chartHeight = height - paddingTop - paddingBottom;

        // Clear
        ctx.clearRect(0,0, width, height);

        // Draw horizontal grid lines
        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 1;
        const gridLines = 4;
        for (let i = 0; i <= gridLines; i++) {
            const y = paddingTop + (chartHeight / gridLines) * i;
            ctx.beginPath();
            ctx.moveTo(paddingLeft, y);
            ctx.lineTo(width - paddingRight, y);
            ctx.stroke();

            // Labels for axes
            ctx.fillStyle = '#94a3b8';
            ctx.font = 'bold 9px monospace';
            const val = Math.round(90 - (90 / gridLines) * i);
            ctx.fillText(String(val), 10, y + 3);
        }

        // Draw data Line path
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 3.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        const points = dataPoints.map((val, idx) => {
            const x = paddingLeft + (chartWidth / (dataPoints.length - 1)) * idx;
            // Map 0-90 to chartHeight
            const y = paddingTop + chartHeight - (chartHeight * (val / 90));
            return { x, y };
        });

        // Gradient below curve
        const grad = ctx.createLinearGradient(0, paddingTop, 0, paddingTop + chartHeight);
        grad.addColorStop(0, 'rgba(59, 130, 246, 0.25)');
        grad.addColorStop(1, 'rgba(59, 130, 246, 0.00)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(points[0].x, paddingTop + chartHeight);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(points[points.length - 1].x, paddingTop + chartHeight);
        ctx.closePath();
        ctx.fill();

        // Line stroke
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();

        // Draw data points circular markers
        points.forEach((p, i) => {
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#2563eb';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Label text below marker
            ctx.fillStyle = '#64748b';
            ctx.font = 'bold 9px sans-serif';
            ctx.fillText(labels[i], p.x - 12, paddingTop + chartHeight + 15);
        });
    }

    // Canvas drawing helper for Pie allocations
    function drawPieChart(sectors) {
        if (!pieCanvas) return;
        const ctx = pieCanvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const size = 160;
        
        pieCanvas.width = size * dpr;
        pieCanvas.height = size * dpr;
        pieCanvas.style.width = size + 'px';
        pieCanvas.style.height = size + 'px';
        ctx.scale(dpr, dpr);

        ctx.clearRect(0,0, size, size);

        const total = sectors.reduce((sum, s) => sum + s.count, 0);
        let startAngle = -Math.PI / 2;
        const centerX = size / 2;
        const centerY = size / 2;
        const outerRadius = 60;
        const innerRadius = 38;

        sectors.forEach(s => {
            const sliceAngle = (s.count / total) * Math.PI * 2;
            
            ctx.fillStyle = s.fill;
            ctx.beginPath();
            ctx.arc(centerX, centerY, outerRadius, startAngle, startAngle + sliceAngle, false);
            ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
            ctx.closePath();
            ctx.fill();

            startAngle += sliceAngle;
        });

        // Center total counter text inside Donut hole
        ctx.fillStyle = '#0f172a';
        ctx.font = 'black 18px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(total), centerX, centerY - 4);
        
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText('USERS', centerX, centerY + 10);

        // Render Legend labels listing below
        const labelContainer = document.getElementById('pie-labels-container');
        labelContainer.innerHTML = sectors.map(s => `
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5 text-slate-600 font-semibold text-[11px]">
                <span class="h-2 w-2 rounded-full inline-block" style="background-color: ${s.fill}"></span>
                <span>${s.name}</span>
            </div>
            <span class="font-mono font-bold text-slate-800">${s.count}</span>
        </div>`).join('');
    }

    // Refresh synchronization with UI alert popup
    async function refreshDashboardData() {
        const syncBtn = document.getElementById('syncBtn');
        const syncIcon = document.getElementById('syncIcon');
        
        syncBtn.disabled = true;
        syncIcon.classList.add('fa-spin');
        
        await loadDashboardData();
        
        setTimeout(() => {
            syncBtn.disabled = false;
            syncIcon.classList.remove('fa-spin');
            triggerAlert('Dashboard metrics synchronized', 'success');
        }, 500);
    }

    // Load initial context on window mount
    loadDashboardData();
    setInterval(loadDashboardData, 12000); // Polling dashboard indicators
</script>
@endsection
