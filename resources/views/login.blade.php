<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign In - Enterprise AdminLTE</title>
    <!-- Tailwind CSS (via CDN) -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- FontAwesome Library -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    <style>
        .login-card {
            background-image: radial-gradient(at 0% 0%, rgba(255, 255, 255, 0.03) 0, transparent 80%), radial-gradient(at 100% 0%, rgba(59, 130, 246, 0.05) 0, transparent 40%);
        }
    </style>
</head>
<body class="bg-[#f4f6f9] min-h-screen flex flex-col justify-between antialiased">

    <!-- Simple Status Indicator Header -->
    <div class="px-6 py-4 flex items-center justify-between text-xs text-slate-400 font-mono select-none">
        <div>LARAVEL 10 EMULATOR &bull; TAILWIND</div>
        <div class="text-emerald-500 font-bold flex items-center gap-1">
            <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
            <span>SECURE GATEWAY READY</span>
        </div>
    </div>

    <div class="w-full max-w-md mx-auto px-6 py-12 md:py-20 flex-1 flex flex-col justify-center">
        <!-- Brand Card Header -->
        <div class="text-center mb-8">
            <div class="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 mx-auto mb-4 hover:scale-105 transition-all">
                <i class="fa-solid fa-layer-group text-white text-2xl"></i>
            </div>
            <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Admin<span class="text-blue-600 font-black">LTE</span> Control</h1>
            <p class="text-slate-500 text-sm mt-1.5 font-medium">Enterprise portal authentication portal</p>
        </div>

        <!-- AUTH LOGIN CONTAINER -->
        <div class="bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-100 max-w-md w-full p-8 login-card relative overflow-hidden">
            
            <form id="loginForm" method="POST" action="/login" class="space-y-5">
                
                <!-- Display Server Validation Alerts dynamic if any -->
                <div id="errorAlert" class="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-lg hidden flex items-start gap-2">
                    <i class="fa-solid fa-triangle-exclamation text-base mt-0.5 shrink-0"></i>
                    <span id="errorMessage">Invalid login details. Try again.</span>
                </div>

                <div id="successAlert" class="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg hidden flex items-start gap-2">
                    <i class="fa-solid fa-circle-check text-base mt-0.5 shrink-0"></i>
                    <span id="successMessage">Credentials verified. Accessing system...</span>
                </div>

                <!-- Username block -->
                <div class="space-y-1.5">
                    <label for="username" class="text-xs font-black uppercase text-slate-500 tracking-wider">Username or Email</label>
                    <div class="relative">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                            <i class="fa-solid fa-user-circle"></i>
                        </span>
                        <input 
                            type="text" 
                            id="username" 
                            name="username" 
                            required 
                            placeholder="admin" 
                            class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                        >
                    </div>
                    <p class="text-[10px] text-slate-400 font-semibold font-mono">Usernames: <span class="text-blue-600">admin</span>, pm_john, user_tadesse</p>
                </div>

                <!-- Password block -->
                <div class="space-y-1.5">
                    <div class="flex items-center justify-between">
                        <label for="password" class="text-xs font-black uppercase text-slate-500 tracking-wider">Security Password</label>
                        <button type="button" id="recoverBtn" class="text-xs text-blue-600 hover:underline font-bold transition-all cursor-pointer">Forgot details?</button>
                    </div>
                    <div class="relative">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                            <i class="fa-solid fa-lock"></i>
                        </span>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            required 
                            placeholder="••••••••" 
                            class="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                        >
                        <button type="button" id="togglePasswordSec" class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-650 transition-colors cursor-pointer">
                            <i class="fa-solid fa-eye" id="passwordIconSec"></i>
                        </button>
                    </div>
                    <p class="text-[10px] text-slate-400 font-medium font-mono">Default seeder password is: <span class="font-bold text-gray-700 font-sans">12345678</span></p>
                </div>

                <!-- Remember me block -->
                <div class="flex items-center justify-between pt-1">
                    <label class="flex items-center gap-2.5 select-none cursor-pointer">
                        <input 
                            type="checkbox" 
                            id="remember_me" 
                            name="remember_me" 
                            class="h-[18px] w-[18px] text-blue-600 focus:ring-blue-500/20 border-slate-200 rounded-md transition-all cursor-pointer"
                        >
                        <span class="text-xs text-slate-500 font-bold">Remember authentication</span>
                    </label>
                </div>

                <!-- Submit and Auth Action Button -->
                <button 
                    type="submit" 
                    id="submitBtn" 
                    class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
                >
                    <i class="fa-solid fa-right-to-bracket text-sm"></i>
                    <span>Authenticate Account</span>
                </button>

            </form>
        </div>
    </div>

    <!-- EMAIL RECOVERY PASSWORD RESET MODAL -->
    <div id="recoveryModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 opacity-0 pointer-events-none transition-all duration-300">
        <div class="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 relative transform scale-95 transition-all duration-300">
            <!-- Modal Close -->
            <button id="closeRecoveryModal" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 h-8 w-8 rounded-lg hover:bg-slate-50 flex items-center justify-center cursor-pointer">
                <i class="fa-solid fa-xmark text-lg"></i>
            </button>

            <div class="space-y-4">
                <div class="flex items-center gap-3">
                    <div class="h-10 w-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                        <i class="fa-solid fa-envelope-circle-check text-lg"></i>
                    </div>
                    <div>
                        <h3 class="font-black text-slate-800 text-base leading-tight">Recover Password</h3>
                        <p class="text-xs text-slate-400 mt-1 font-semibold">Uses matching email templates automatically</p>
                    </div>
                </div>

                <div class="space-y-1.5 pt-2">
                    <label for="recoveryEmail" class="text-xs font-black uppercase text-slate-500 tracking-wider">Email Address</label>
                    <input 
                        type="email" 
                        id="recoveryEmail" 
                        placeholder="tadesseamsalu@gmail.com" 
                        class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                    >
                    <span class="text-[10px] text-slate-400">Recovery uses seeded templates. Try: <span class="font-bold text-gray-700">tadesseamsalu@gmail.com</span></span>
                </div>

                <div id="recoveryMessagePanel" class="p-4 bg-slate-50 border rounded-xl text-xs space-y-2 mt-2 hidden text-slate-700">
                    <p id="recoveryTitle" class="font-bold text-slate-900 flex items-center gap-1.5"><i class="fa-solid fa-paper-plane text-blue-500"></i> Dispatch Status:</p>
                    <div class="bg-white p-2.5 border rounded-lg font-mono text-[10px] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto mt-1" id="recoveryResultBody"></div>
                </div>

                <div class="flex justify-end gap-2.5 pt-3">
                    <button type="button" id="cancelRecoveryBtn" class="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer">Cancel</button>
                    <button type="button" id="confirmRecoveryBtn" class="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md border border-orange-600/10 cursor-pointer flex items-center gap-1.5">
                        <i class="fa-regular fa-paper-plane"></i>
                        <span>Disperse Recovery Link</span>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Global Footer credit -->
    <div class="py-4 text-center text-[10px] text-slate-400 font-semibold font-mono tracking-wide mt-auto">
        SYSTEM SECURED BY LARAVEL AUTH MODULES &bull; DESIGN BASED ON ADMINLTE
    </div>

    <script>
        // Password toggle logic
        const toggleBtn = document.getElementById('togglePasswordSec');
        const passField = document.getElementById('password');
        const passIcon = document.getElementById('passwordIconSec');

        toggleBtn?.addEventListener('click', () => {
            if (passField.type === 'password') {
                passField.type = 'text';
                passIcon.classList.remove('fa-eye');
                passIcon.classList.add('fa-eye-slash');
            } else {
                passField.type = 'password';
                passIcon.classList.remove('fa-eye-slash');
                passIcon.classList.add('fa-eye');
            }
        });

        // AJAX Authentication Submission Form
        const loginForm = document.getElementById('loginForm');
        const errorAlert = document.getElementById('errorAlert');
        const errorMessage = document.getElementById('errorMessage');
        const successAlert = document.getElementById('successAlert');

        loginForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorAlert.classList.add('hidden');
            successAlert.classList.add('hidden');

            const username = document.getElementById('username').value;
            const password = passField.value;
            const rememberMe = document.getElementById('remember_me').checked;

            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password, rememberMe })
                });

                const data = await res.json();
                if (res.ok) {
                    successAlert.classList.remove('hidden');
                    // Store token securely inside cookie and localStorage so pages load SSR
                    document.cookie = `admin_session=${data.token}; Path=/; SameSite=Lax; Max-Age=${rememberMe ? 3600 * 24 * 30 : 3600 * 4}`;
                    sessionStorage.setItem('admin_token', data.token);
                    
                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 1000);
                } else {
                    errorMessage.textContent = data.error || 'Identity checks failed.';
                    errorAlert.classList.remove('hidden');
                }
            } catch (err) {
                console.error('Network identity service unreachable', err);
                errorMessage.textContent = 'Server Authentication Service Offline.';
                errorAlert.classList.remove('hidden');
            }
        });

        // Recovery Modal triggers
        const recModal = document.getElementById('recoveryModal');
        const openRecBtn = document.getElementById('recoverBtn');
        const closeRecBtn = document.getElementById('closeRecoveryModal');
        const cancelRecBtn = document.getElementById('cancelRecoveryBtn');
        const confirmRecBtn = document.getElementById('confirmRecoveryBtn');
        const recoveryEmail = document.getElementById('recoveryEmail');
        const recoveryResultBody = document.getElementById('recoveryResultBody');
        const recoveryMessagePanel = document.getElementById('recoveryMessagePanel');

        const showModal = () => {
            recModal.classList.remove('opacity-0', 'pointer-events-none');
            recModal.children[0].classList.remove('scale-95');
        };

        const hideModal = () => {
            recModal.classList.add('opacity-0', 'pointer-events-none');
            recModal.children[0].classList.add('scale-95');
            // Reset modal states
            setTimeout(() => {
                recoveryMessagePanel.classList.add('hidden');
                recoveryResultBody.textContent = '';
                recoveryEmail.value = '';
            }, 300);
        };

        openRecBtn?.addEventListener('click', showModal);
        closeRecBtn?.addEventListener('click', hideModal);
        cancelRecBtn?.addEventListener('click', hideModal);

        confirmRecBtn?.addEventListener('click', async () => {
            const email = recoveryEmail.value;
            if (!email) {
                alert('Please register an email address to dispatch.');
                return;
            }

            confirmRecBtn.disabled = true;
            confirmRecBtn.textContent = 'Mailing daemon busy...';

            try {
                const res = await fetch('/api/auth/recover', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                const data = await res.json();
                confirmRecBtn.disabled = false;
                confirmRecBtn.innerHTML = '<i class="fa-regular fa-paper-plane"></i><span>Disperse Recovery Link</span>';

                if (res.ok) {
                    recoveryMessagePanel.classList.remove('hidden');
                    const envelope = data.emitted_envelope;
                    recoveryResultBody.innerHTML = `<strong>TO:</strong> ${envelope.to}\n<strong>SUBJECT:</strong> ${envelope.subject}\n\n<strong>COMPILED MAIL BODY:</strong>\n${envelope.body}`;
                } else {
                    alert(data.error || 'No registered system match found.');
                }
            } catch (e) {
                alert('Mailing server connectivity error.');
                confirmRecBtn.disabled = false;
                confirmRecBtn.innerHTML = '<i class="fa-regular fa-paper-plane"></i><span>Disperse Recovery Link</span>';
            }
        });
    </script>

</body>
</html>
