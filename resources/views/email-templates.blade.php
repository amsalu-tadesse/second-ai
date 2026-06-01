@extends('layouts.app')

@section('title', 'Email Templates Directory')

@section('content')
<div class="space-y-6">
    <!-- Header banner -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
            <h1 class="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <i class="fa-solid fa-envelope-open-text text-blue-600"></i> Dynamic Email Templates Settings
            </h1>
            <p class="text-slate-400 text-xs font-semibold mt-0.5">
                Customize automated notifications, customize secure variables and manage placeholders.
            </p>
        </div>
    </div>

    <!-- DOUBLE GRID CONTAINER -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left panel: Templates selector catalogs -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 class="text-xs font-black uppercase text-slate-700 tracking-wider">Automated Notification Triggers</h3>

            <div id="templates-cards-list" class="space-y-3">
                <!-- Loaded dynamically via AJAX -->
                <div class="text-center py-10">
                    <i class="fa-solid fa-circle-notch fa-spin text-slate-300 text-lg"></i>
                    <p class="text-xs text-slate-400 mt-1 font-semibold">Reading notifications indexes...</p>
                </div>
            </div>
        </div>

        <!-- Right panel: Interactive Editor and Placeholders references -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm lg:col-span-2 space-y-4" id="template-editor-section">
            <div id="template-placeholder-panel" class="h-80 flex flex-col items-center justify-center text-center text-slate-400 border border-dashed rounded-xl p-6">
                <i class="fa-solid fa-envelope-open text-3xl text-slate-200"></i>
                <h4 class="font-bold text-slate-500 text-xs mt-3">No Template Selected</h4>
                <p class="text-[10px] text-slate-400 mt-1 max-w-xs leading-normal">Choose a notification dispatch trigger from the left catalogue list to edit subject lines, message bodies, and available server placeholders.</p>
            </div>

            <!-- Form layout -->
            <form id="templateForm" onsubmit="handleTemplateSubmit(event)" class="space-y-5 hidden">
                <input type="hidden" id="editingTemplateId" value="">

                <div class="border-b pb-4 flex items-start justify-between">
                    <div>
                        <span class="bg-blue-50 text-blue-700 font-extrabold text-[9px] uppercase px-2 py-0.5 rounded border border-blue-105">SMTP TRIGGER</span>
                        <h3 id="templateNameDisplay" class="text-base font-black text-slate-800 mt-2">Modify Security Templates</h3>
                        <p class="text-[10px] text-slate-400 mt-1 font-semibold">Last edited log changes will persist dynamically</p>
                    </div>
                </div>

                <!-- Subject inputs -->
                <div class="space-y-1.5">
                    <label for="templateSubject" class="text-[10px] font-black uppercase text-slate-500 tracking-wider">Subject Line Format</label>
                    <input 
                        type="text" 
                        id="templateSubject" 
                        required
                        placeholder="Subject header..." 
                        class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                    >
                </div>

                <!-- Placeholders help badge grid -->
                <div class="space-y-1.5">
                    <label class="text-[10px] font-black uppercase text-slate-500 tracking-widerblock">Available Variables Token Injection</label>
                    <div id="placeholders-pills-list" class="flex flex-wrap gap-1.5 pt-1">
                        <!-- Badges loaded dynamically -->
                    </div>
                </div>

                <!-- Body Editor text -->
                <div class="space-y-1.5">
                    <label for="templateBody" class="text-[10px] font-black uppercase text-slate-500 tracking-wider">Notification Letter Body Text</label>
                    <textarea 
                        id="templateBody" 
                        rows="12"
                        required
                        placeholder="Define email contents here..." 
                        class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none leading-relaxed"
                    ></textarea>
                </div>

                <!-- Action Button Save -->
                <div class="flex justify-end gap-2 pt-2">
                    <button type="submit" id="saveTemplateBtn" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md border border-blue-650/10 cursor-pointer transition-all">
                        <i class="fa-solid fa-floppy-disk mr-1.5"></i>Save Notification Template
                    </button>
                </div>
            </form>
        </div>

    </div>
</div>

<script>
    const adminToken = sessionStorage.getItem('admin_token');

    let emailTemplatesList = [];

    // Query databases lists
    async function loadTemplatesCatalog() {
        const headers = { 'Authorization': adminToken };
        const container = document.getElementById('templates-cards-list');

        try {
            const res = await fetch('/api/email-templates', { headers });
            emailTemplatesList = await res.json();

            container.innerHTML = emailTemplatesList.map(t => `
            <div 
                onclick="selectTemplateEditor('${t.id}')"
                id="template-card-${t.id}"
                class="template-card p-4 rounded-xl border border-slate-150 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col justify-between"
            >
                <div>
                    <h4 class="font-extrabold text-slate-800 text-xs truncate">${t.name}</h4>
                    <p class="text-[10px] text-slate-400 mt-1 text-slate-450 leading-snug truncate">${t.subject}</p>
                </div>
                <div class="border-t border-dashed border-slate-200/80 mt-3 pt-2 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                    <span>Keys: ${t.placeholders.length}</span>
                    <span>Last edit</span>
                </div>
            </div>`).join('');

        } catch (e) {
            container.innerHTML = `<p class="text-xs text-rose-500 font-bold py-4 text-center">Failed compiling notification indexes.</p>`;
        }
    }

    // Launch template editor
    function selectTemplateEditor(templateId) {
        document.querySelectorAll('.template-card').forEach(card => {
            card.classList.remove('bg-white', 'border-blue-500', 'shadow-md', 'ring-2', 'ring-blue-500/10');
            card.classList.add('bg-slate-50/50', 'border-slate-150');
        });

        const activeCard = document.getElementById(`template-card-${templateId}`);
        if(activeCard) {
            activeCard.classList.remove('bg-slate-50/50', 'border-slate-150');
            activeCard.classList.add('bg-white', 'border-blue-500', 'shadow-md', 'ring-2', 'ring-blue-500/10');
        }

        const template = emailTemplatesList.find(t => t.id === templateId);
        if(!template) return;

        // Display Editor form
        document.getElementById('template-placeholder-panel').classList.add('hidden');
        const form = document.getElementById('templateForm');
        form.classList.remove('hidden');

        // Setup values
        document.getElementById('editingTemplateId').value = template.id;
        document.getElementById('templateNameDisplay').textContent = template.name;
        document.getElementById('templateSubject').value = template.subject;
        document.getElementById('templateBody').value = template.body;

        // Render Placeholders clickable badges!
        const pillsList = document.getElementById('placeholders-pills-list');
        pillsList.innerHTML = template.placeholders.map(p => `
        <button 
            type="button"
            onclick="insertVariableToken('${p}')"
            class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold font-mono rounded-md border border-slate-200/50 cursor-pointer select-none transition-colors"
            title="Click to insert placeholder token context inside editor"
        >
            {{ ${p} }}
        </button>`).join('');
    }

    // Interactive insertions helper
    function insertVariableToken(tokenName) {
        const textarea = document.getElementById('templateBody');
        const insertValue = `{{${tokenName}}}`;
        
        const startPos = textarea.selectionStart;
        const endPos = textarea.selectionEnd;
        const originalText = textarea.value;

        textarea.value = originalText.substring(0, startPos) + insertValue + originalText.substring(endPos, originalText.length);
        
        // Focus back
        textarea.focus();
        textarea.selectionStart = startPos + insertValue.length;
        textarea.selectionEnd = startPos + insertValue.length;
    }

    // Submit form modified
    async function handleTemplateSubmit(e) {
        e.preventDefault();

        const id = document.getElementById('editingTemplateId').value;
        const subject = document.getElementById('templateSubject').value;
        const body = document.getElementById('templateBody').value;

        const headers = { 'Authorization': adminToken, 'Content-Type': 'application/json' };
        
        try {
            const saveBtn = document.getElementById('saveTemplateBtn');
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1.5"></i>Writing SMTP databases...';

            const res = await fetch(`/api/email-templates/${id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ subject, body })
            });

            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk mr-1.5"></i>Save Notification Template';

            if(res.ok) {
                triggerAlert('System SMTP template overridden!', 'success');
                await loadTemplatesCatalog();
                selectTemplateEditor(id); // stay active
            } else {
                alert('Mailing system rejected content modifications.');
            }
        } catch(e) {
            alert('Failure writing notifications databases.');
            document.getElementById('saveTemplateBtn').disabled = false;
        }
    }

    // Launch catalogs
    loadTemplatesCatalog();
</script>
@endsection
