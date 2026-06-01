import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Mail, Lock, User as UserIcon, RefreshCw, KeyRound, CheckSquare, Square } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Password Recovery state
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState<any | null>(null);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in both fields.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, rememberMe }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Server connection failed.');
      }

      // Store in localStorage if remember me is set
      if (rememberMe) {
        localStorage.setItem('admin_token', data.token);
      }
      sessionStorage.setItem('admin_token', data.token);

      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Incorrect credentials. Try admin / 12345678');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) {
      setRecoveryError('Please provide a valid email address.');
      return;
    }

    setRecoveryError(null);
    setRecoverySuccess(null);
    setRecoveryLoading(true);

    try {
      const res = await fetch('/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'User not found with this email.');
      }

      setRecoverySuccess(data);
    } catch (err: any) {
      setRecoveryError(err.message || 'Email verification error.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div id="login_screen" className="min-h-screen flex items-center justify-center bg-[#f4f6f9] py-12 px-4 sm:px-6 lg:px-8 font-sans transition-all duration-300">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg border-t-4 border-blue-600">
        
        {/* Header containing Branding Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-2 shadow-sm">
            <Shield className="h-9 w-9" id="auth_shield_logo" />
          </div>
          <h2 className="text-3xl font-bold font-sans text-gray-900 tracking-tight">
            Admin<span className="text-blue-600 font-extrabold">LTE</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider font-semibold">
            Enterprise Control Suite
          </p>
        </div>

        {/* Alternate view for Password Recovery form */}
        {!showRecovery ? (
          <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
            <div className="rounded-md space-y-4">
              {error && (
                <div id="login_error_alert" className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm flex items-center gap-2 rounded">
                  <span className="font-semibold">Error:</span> {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Username or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    id="username_input"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter preseeded username (e.g. admin)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Default username: <span className="font-mono text-gray-600">admin</span></p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    id="password_input"
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter password (e.g. 12345678)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Default password: <span className="font-mono text-gray-600">12345678</span></p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                id="remember_me_trigger"
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center gap-2 text-sm text-gray-700 font-medium hover:text-gray-900 cursor-pointer"
              >
                {rememberMe ? (
                  <CheckSquare className="h-5 w-5 text-blue-600" />
                ) : (
                  <Square className="h-5 w-5 text-gray-400" />
                )}
                <span>Remember me</span>
              </button>

              <div className="text-sm">
                <button
                  type="button"
                  id="forgot_password_btn"
                  onClick={() => {
                    setShowRecovery(true);
                    setRecoveryEmail('');
                    setRecoverySuccess(null);
                    setRecoveryError(null);
                  }}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                id="login_btn"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-semibold rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="animate-spin h-4 w-4" /> Initiating secure session...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>
        ) : (
          /* PASSWORD RECOVERY FORM VIEW */
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-blue-600" /> Recover Account Password
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Enter your registered user email to receive dynamic recovery instructions.
              </p>
            </div>

            {recoveryError && (
              <div id="recovery_error_alert" className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
                <span className="font-semibold">Error:</span> {recoveryError}
              </div>
            )}

            {recoverySuccess && (
              <div id="recovery_success_alert" className="space-y-4">
                <div className="p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm rounded">
                  {recoverySuccess.message}
                </div>
                
                {/* Visual debug envelope panel to check compiled layout variables */}
                <div className="bg-gray-50 border rounded p-4 text-[13px] text-gray-800 space-y-2">
                  <div className="font-bold border-b pb-1 text-xs text-gray-400 flex justify-between items-center bg-gray-100 p-1 rounded-t -mt-4 -mx-4 mb-2">
                    <span>DYNAMIC EMAIL SIMULATOR OUTPUT</span>
                    <span className="text-green-600">Dispach Successful</span>
                  </div>
                  <div>
                    <span className="font-bold">To:</span> {recoverySuccess.emitted_envelope.to}
                  </div>
                  <div>
                    <span className="font-bold">Subject:</span> {recoverySuccess.emitted_envelope.subject}
                  </div>
                  <div className="bg-white border rounded p-2 text-xs font-mono whitespace-pre-wrap mt-2 max-h-48 overflow-y-auto">
                    {recoverySuccess.emitted_envelope.body}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleRecoverySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    required
                    id="recovery_email_input"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter e.g. tadesseamsalu@gmail.com"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={recoveryLoading}
                  className="flex-1 py-2 px-4 border border-transparent text-sm font-semibold rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {recoveryLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw className="animate-spin h-4 w-4" /> Compiling...
                    </span>
                  ) : (
                    'Send Recovery Link'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRecovery(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 text-sm font-semibold rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  Back to Login
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="text-center pt-2 border-t text-xs text-gray-400 font-medium">
          AdminLTE v3.2.0 • Running Full-Stack React Core
        </div>
      </div>
    </div>
  );
}
