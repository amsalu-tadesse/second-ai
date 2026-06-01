import { User, LogOut, ShieldAlert, BadgeCheck, Bell, Activity, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HeaderProps {
  user: { name: string; username: string; email: string; roleId: string };
  onLogout: () => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export default function Header({ user, onLogout, collapsed, setCollapsed }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4 sticky top-0 z-40 shadow-sm">
      
      {/* Left controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          id="sidebar_toggle_btn"
        >
          <i className="fas fa-bars text-lg"></i>
        </button>

        <span className="hidden md:flex items-center gap-2 bg-blue-50 text-blue-700 px-2.5 py-1 rounded text-xs font-semibold">
          <Activity className="h-3 w-3 pulse-active text-blue-500" />
          <span>Server Cluster: Online</span>
        </span>

        {/* IP Address display */}
        <span className="hidden lg:inline text-xs text-gray-500 font-mono">
          Node Host Port: <span className="font-semibold text-gray-700">3000</span> (External Nginx proxy)
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        
        {/* Dynamic UTC Local Clock */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded font-mono">
          <Clock className="h-3.5 w-3.5 text-gray-400" />
          <span>{currentTime.toISOString().replace('T', ' ').substring(0, 19)} UTC</span>
        </div>

        {/* Quick notification bell */}
        <div className="relative">
          <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded cursor-pointer relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
              3
            </span>
          </button>
        </div>

        {/* Managed Avatar profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-2 p-1 rounded hover:bg-gray-100 cursor-pointer text-left"
            id="profile_dropdown_trigger"
          >
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <div className="text-xs font-bold text-gray-800 leading-tight">{user.name}</div>
              <div className="text-[10px] text-gray-500 font-semibold uppercase">{user.roleId.replace('role_', '')}</div>
            </div>
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-xl py-1 z-50 animate-fadeIn text-sm">
              <div className="px-4 py-2 border-b">
                <p className="font-bold text-gray-800 leading-none">{user.name}</p>
                <p className="text-xs text-gray-400 mt-1 truncate">{user.email}</p>
              </div>
              
              <div className="p-1">
                <div className="px-3 py-1.5 text-xs font-bold text-gray-400 select-none uppercase">Role Permissions</div>
                <div className="px-3 py-1 text-xs text-gray-600 flex items-center gap-1.5 font-medium">
                  <BadgeCheck className="h-4 w-4 text-green-500" />
                  <span>Authorized Profile</span>
                </div>
              </div>

              <div className="border-t my-1"></div>

              <button
                onClick={onLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                id="logout_confirm_btn"
              >
                <LogOut className="h-4 w-4" />
                <span>Terminate Session</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
