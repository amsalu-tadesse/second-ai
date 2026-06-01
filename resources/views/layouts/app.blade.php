<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enterprise AdminLTE - @yield('title', 'Control Panel')</title>
    <!-- Tailwind CSS (via CDN with configuration compatibility) -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- FontAwesome Professional Icon Library -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    <style>
        /* Sidebar slide styles */
        .sidebar-expanded { width: 16rem; }
        .sidebar-collapsed { width: 4.5rem; }
        .sidebar-collapsed .sidebar-text, .sidebar-collapsed .sidebar-header-text { display: none; }
        .sidebar-collapsed .sidebar-item { justify-content: center; }
        .sidebar-collapsed .sidebar-section-header { display: none; }
        .pulse-active {
            animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse-ring {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
        }
    </style>
</head>
<body class="hold-transition sidebar-mini layout-fixed bg-slate-50 text-slate-800 font-sans antialiased">

<div class="flex h-screen overflow-hidden">

    <!-- SIDEBAR COMPONENT -->
    <aside id="main-sidebar" class="bg-slate-900 text-slate-300 sidebar-expanded h-full flex flex-col transition-all duration-300 z-30 shadow-lg border-r border-slate-800">
        <!-- Brand Logo -->
        <div class="h-16 flex items-center px-4 hover:bg-slate-800 transition-colors border-b border-slate-800">
            <a href="/dashboard" class="flex items-center gap-3 w-full">
                <div class="h-9 w-9 rounded-md bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/30">
                    <i class="fa-solid fa-layer-group text-white text-lg"></i>
                </div>
                <span class="font-extrabold text-white tracking-widest text-sm uppercase sidebar-text">Admin<span class="text-blue-500 font-black">LTE</span></span>
            </a>
        </div>

        <!-- Authenticated User Profile Block -->
        <div class="p-4 border-b border-slate-800 sidebar-text flex items-center gap-3">
            <div class="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600 ring-2 ring-blue-500/20">
                <i class="fa-solid fa-user text-slate-300 text-sm"></i>
            </div>
            <div class="min-w-0">
                <div class="text-sm font-bold text-slate-200 truncate">{{ $user['name'] }}</div>
                <div class="text-[10px] text-slate-500 font-mono flex items-center gap-1 leading-none mt-1">
                    <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block pulse-active"></span>
                    <span>ONLINE • {{ $user_role_name }}</span>
                </div>
            </div>
        </div>

        <!-- Sidebar Navigation Menu -->
        <nav class="flex-1 overflow-y-auto px-2 py-4 space-y-1.5 scrollbar-thin">
            <!-- Sidebar Section Title -->
            <div class="text-[10px] uppercase font-black text-slate-600 px-3 py-1 tracking-wider sidebar-section-header">Main Navigation</div>

            <!-- Dashboard -->
            <a href="/dashboard" class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-155 @if($current_tab === 'dashboard') bg-blue-700 text-white shadow-md shadow-blue-600/10 @else hover:bg-slate-800 hover:text-slate-100 @endif">
                <i class="fa-solid fa-chart-line text-lg w-5 text-center @if($current_tab === 'dashboard') text-white @else text-slate-400 @endif"></i>
                <span class="sidebar-text">Dashboard</span>
            </a>

            <!-- Departments & Projects -->
            <a href="/departments-projects" class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-155 @if($current_tab === 'projects') bg-blue-700 text-white shadow-md shadow-blue-600/10 @else hover:bg-slate-800 hover:text-slate-100 @endif">
                <i class="fa-solid fa-diagram-project text-lg w-5 text-center @if($current_tab === 'projects') text-white @else text-slate-400 @endif"></i>
                <span class="sidebar-text">Project Analytics</span>
            </a>

            <!-- Sidebar Section Title: Admin System -->
            <div class="text-[10px] uppercase font-black text-slate-600 px-3 py-1 pt-4 tracking-wider sidebar-section-header">Access Control</div>

            <!-- Users Management -->
            <a href="/users" class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-155 @if($current_tab === 'users') bg-blue-700 text-white shadow-md shadow-blue-600/10 @else hover:bg-slate-800 hover:text-slate-100 @endif">
                <i class="fa-solid fa-users-gear text-lg w-5 text-center @if($current_tab === 'users') text-white @else text-slate-400 @endif"></i>
                <span class="sidebar-text">User Directory</span>
            </a>

            <!-- Roles & Permissions -->
            <a href="/roles" class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-155 @if($current_tab === 'roles') bg-blue-700 text-white shadow-md shadow-blue-600/10 @else hover:bg-slate-800 hover:text-slate-100 @endif">
                <i class="fa-solid fa-shield-halved text-lg w-5 text-center @if($current_tab === 'roles') text-white @else text-slate-400 @endif"></i>
                <span class="sidebar-text">Permissions Roles</span>
            </a>

            <!-- Sidebar Section Title: Auditing & Tables -->
            <div class="text-[10px] uppercase font-black text-slate-600 px-3 py-1 pt-4 tracking-wider sidebar-section-header">Real-Time Audits</div>

            <!-- Yajra Active Sessions -->
            <a href="/sessions" class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-155 @if($current_tab === 'sessions') bg-blue-700 text-white shadow-md shadow-blue-600/10 @else hover:bg-slate-800 hover:text-slate-100 @endif">
                <i class="fa-solid fa-ethernet text-lg w-5 text-center @if($current_tab === 'sessions') text-white @else text-slate-400 @endif"></i>
                <span class="sidebar-text">Active Yajra Sessions</span>
            </a>

            <!-- Activity Logs Audit -->
            <a href="/audits" class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-155 @if($current_tab === 'audits') bg-blue-700 text-white shadow-md shadow-blue-600/10 @else hover:bg-slate-800 hover:text-slate-100 @endif">
                <i class="fa-solid fa-shoe-prints text-lg w-5 text-center @if($current_tab === 'audits') text-white @else text-slate-400 @endif"></i>
                <span class="sidebar-text">Activity Audit Logs</span>
            </a>

            <!-- Sidebar Section Title: Generators and Settings -->
            <div class="text-[10px] uppercase font-black text-slate-600 px-3 py-1 pt-4 tracking-wider sidebar-section-header">System Settings</div>

            <!-- CRUD Scaffolder Generator -->
            <a href="/crud-generator" class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-155 @if($current_tab === 'crud-generator') bg-blue-700 text-white shadow-md shadow-blue-600/10 @else hover:bg-slate-800 hover:text-slate-100 @endif">
                <i class="fa-solid fa-code text-lg w-5 text-center @if($current_tab === 'crud-generator') text-white @else text-slate-400 @endif"></i>
                <span class="sidebar-text">CRUD Generator</span>
            </a>

            <!-- Dynamic Email Templates -->
            <a href="/email-templates" class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-155 @if($current_tab === 'email-templates') bg-blue-700 text-white shadow-md shadow-blue-600/10 @else hover:bg-slate-800 hover:text-slate-100 @endif">
                <i class="fa-solid fa-envelope-open-text text-lg w-5 text-center @if($current_tab === 'email-templates') text-white @else text-slate-400 @endif"></i>
                <span class="sidebar-text">Email Templates</span>
            </a>

            <!-- Dynamic Generated CRUD Scaffolds Catalog -->
            @if(count($sidebar_crud_models) > 0)
                <div class="text-[10px] uppercase font-black text-slate-600 px-3 py-1 pt-4 tracking-wider sidebar-section-header">Scaffolded CRUDs</div>
                @foreach($sidebar_crud_models as $crud_model)
                    <a href="/crud/{{ $crud_model['p_plural'] }}" class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-155 @if($current_tab === 'custom_crud' && $selected_crud_model_plural === $crud_model['p_plural']) bg-blue-700 text-white shadow-md shadow-blue-600/10 @else hover:bg-slate-800 hover:text-slate-100 @endif">
                        <i class="fa-solid fa-database text-lg w-5 text-center @if($current_tab === 'custom_crud' && $selected_crud_model_plural === $crud_model['p_plural']) text-white @else text-slate-400 @endif"></i>
                        <span class="sidebar-text truncate">{{ $crud_model['label'] }}</span>
                    </a>
                @endforeach
            @endif

        </nav>

        <!-- Sidebar footer status -->
        <div class="p-3 bg-slate-950 border-t border-slate-800 text-[10px] font-mono text-slate-500 text-center sidebar-text">
            AdminLTE Engine • v10.4
        </div>
    </aside>

    <!-- CONTENT PANEL WRAPPER -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden relative">

        <!-- TOP NAVIGATION HEADER -->
        <header class="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 z-20 shrink-0 shadow-sm shadow-black/[0.01]">
            <div class="flex items-center gap-4">
                <!-- Sidebar Toggle Hamburger -->
                <button id="sidebar-toggle" class="h-10 w-10 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all flex items-center justify-center cursor-pointer">
                    <i class="fa-solid fa-bars text-lg"></i>
                </button>
                <div class="text-xs text-slate-400 font-mono hidden md:block">
                    Server Port: <span class="font-bold text-slate-600">3000</span> &bull; State persistent DB
                </div>
            </div>

            <!-- Profile and Options Dropdown Right -->
            <div class="flex items-center gap-4">
                <div class="text-right hidden sm:block">
                    <div class="text-xs font-bold text-gray-800">{{ $user['name'] }}</div>
                    <div class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{{ $user['username'] }}</div>
                </div>
                
                <div class="relative group">
                    <button class="h-10 w-10 rounded-full bg-blue-105 hover:bg-blue-200 text-blue-600 font-bold border border-blue-200 flex items-center justify-center cursor-pointer transition-colors shadow-sm">
                        <i class="fa-solid fa-user-shield text-sm"></i>
                    </button>
                    <!-- Floating user card on hover/focus -->
                    <div class="absolute right-0 mt-2 w-64 bg-white border rounded-xl shadow-xl p-4 hidden group-hover:block hover:block text-sm border-slate-200 z-50">
                        <div class="flex items-center gap-3">
                            <div class="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold">
                                <i class="fa-solid fa-user"></i>
                            </div>
                            <div>
                                <div class="font-bold text-gray-900 leading-none">{{ $user['name'] }}</div>
                                <div class="text-xs text-gray-500 mt-1">{{ $user['email'] }}</div>
                            </div>
                        </div>
                        <div class="mt-3.5 pt-3.5 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                            <div>Role: <span class="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{{ $user_role_name }}</span></div>
                            <div>Username: <span class="font-bold text-slate-700">{{ $user['username'] }}</span></div>
                        </div>
                        <div class="mt-4 pt-3 border-t flex justify-end">
                            <a href="/logout" class="bg-rose-50 text-rose-700 px-3.5 py-1.5 text-xs font-bold rounded-lg border border-rose-200 hover:bg-rose-100 hover:text-rose-800 transition-all cursor-pointer">
                                <i class="fa-solid fa-right-from-bracket mr-1.5"></i>Logout
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <!-- CONTAINER BODY VIEW WRAPPER -->
        <main class="flex-1 overflow-y-auto p-6 scroll-smooth bg-slate-50">
            <div class="max-w-7xl mx-auto h-full">
                @yield('content')
            </div>
        </main>

    </div>
</div>

<script>
    // Sidebar fold collapse mechanism matching AdminLTE sidebar behavior
    const sidebar = document.getElementById('main-sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    
    // Read cached layout preference
    if (localStorage.getItem('sidebar_collapsed') === 'true') {
        sidebar.classList.remove('sidebar-expanded');
        sidebar.classList.add('sidebar-collapsed');
    }

    toggleBtn?.addEventListener('click', () => {
        if (sidebar.classList.contains('sidebar-expanded')) {
            sidebar.classList.remove('sidebar-expanded');
            sidebar.classList.add('sidebar-collapsed');
            localStorage.setItem('sidebar_collapsed', 'true');
        } else {
            sidebar.classList.remove('sidebar-collapsed');
            sidebar.classList.add('sidebar-expanded');
            localStorage.setItem('sidebar_collapsed', 'false');
        }
    });

    // Handle temporary notice popup animations if standard message emitted
    function triggerAlert(message, type = 'success') {
        const floatS = document.createElement('div');
        floatS.className = `fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-lg border text-white text-sm font-bold flex items-center gap-2 transform translate-y-5 opacity-0 transition-all duration-300 ${
            type === 'success' ? 'bg-emerald-600 border-emerald-550' : 'bg-rose-600 border-rose-550'
        }`;
        floatS.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'} text-lg"></i><span>${message}</span>`;
        document.body.appendChild(floatS);
        // Animate in
        setTimeout(() => {
            floatS.classList.remove('translate-y-5', 'opacity-0');
        }, 50);
        // Dismiss
        setTimeout(() => {
            floatS.classList.add('translate-y-5', 'opacity-0');
            setTimeout(() => floatS.remove(), 300);
        }, 4000);
    }
</script>

</body>
</html>
