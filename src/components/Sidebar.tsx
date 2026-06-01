import { 
  ShieldAlert, LayoutDashboard, Users, ShieldCheck, Mail, Database, 
  FileText, Code, FolderOpen, ChevronRight, X, Trash2, Tag
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  selectedCrudModelId: string | null;
  setSelectedCrudModelId: (id: string | null) => void;
  user: { name: string; username: string; roleId: string };
  generatedModels: any[];
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  onDeleteModel: (modelId: string) => void;
}

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  selectedCrudModelId,
  setSelectedCrudModelId,
  user, 
  generatedModels, 
  collapsed,
  setCollapsed,
  onDeleteModel
}: SidebarProps) {
  
  const hasPermission = (tabId: string): boolean => {
    // Basic permissions mapping mimicking backend constraints
    if (user.roleId === 'role_admin') return true;
    if (user.roleId === 'role_pm') {
      return ['dashboard', 'departments', 'projects', 'sessions', 'audits'].includes(tabId);
    }
    return ['dashboard'].includes(tabId);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Control Dashboard', icon: <LayoutDashboard className="h-4.5 w-4.5" />, group: 'Main Console' },
    { id: 'users', label: 'User Directory', icon: <Users className="h-4.5 w-4.5" />, group: 'Identity Manager' },
    { id: 'roles', label: 'Roles & Security', icon: <ShieldCheck className="h-4.5 w-4.5" />, group: 'Identity Manager' },
    { id: 'projects', label: 'Projects & Units', icon: <FolderOpen className="h-4.5 w-4.5" />, group: 'Enterprise Assets' },
    { id: 'sessions', label: 'Yajra Session DB', icon: <Database className="h-4.5 w-4.5" />, group: 'System Heartbeat' },
    { id: 'audits', label: 'Activity Logs & Audits', icon: <FileText className="h-4.5 w-4.5" />, group: 'System Heartbeat' },
    { id: 'emails', label: 'Email Templates', icon: <Mail className="h-4.5 w-4.5" />, group: 'Design Lab' },
    { id: 'crud-generator', label: 'CRUD Gen Engine', icon: <Code className="h-4.5 w-4.5" />, group: 'Design Lab' }
  ];

  // Grouped menus list
  const groups = ['Main Console', 'Identity Manager', 'Enterprise Assets', 'System Heartbeat', 'Design Lab'];

  const navigateToTab = (tabId: string) => {
    setSelectedCrudModelId(null);
    setCurrentTab(tabId);
  };

  const navigateToCrud = (modelId: string) => {
    setSelectedCrudModelId(modelId);
    setCurrentTab('custom_crud');
  };

  return (
    <aside 
      className={`${
        collapsed ? 'w-0 md:w-16' : 'w-64'
      } bg-[#343a40] text-[#c2c7d0] transition-all duration-300 flex flex-col min-h-screen overflow-x-hidden relative shadow-2xl shrink-0 z-50`}
      id="admin_sidebar"
    >
      {/* Sidebar Brand Header */}
      <div className="h-14 flex items-center justify-between px-4 bg-[#2f353a] brand-link border-b border-[#4f5962]">
        <div className="flex items-center gap-2 truncate">
          <div className="h-8 w-8 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow cursor-pointer" onClick={() => navigateToTab('dashboard')}>
            <i className="fas fa-cube text-sm"></i>
          </div>
          {!collapsed && (
            <span className="font-sans font-bold text-white text-md tracking-tight truncate">
              Admin<span className="text-blue-500 font-extrabold">LTE React</span>
            </span>
          )}
        </div>
        {!collapsed && (
          <button 
            onClick={() => setCollapsed(true)} 
            className="md:hidden text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Active Logged-in Profile Tag */}
      <div className="px-3 py-4 border-b border-[#4f5962] bg-[#22252a] flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold relative shadow-inner">
          <span className="text-sm">{user.username.substring(0, 2).toUpperCase()}</span>
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border border-gray-900"></span>
        </div>
        {!collapsed && (
          <div className="truncate text-xs">
            <p className="font-bold text-white tracking-wide">{user.name}</p>
            <p className="text-[#a5b4fc] font-semibold mt-0.5">{user.roleId === 'role_admin' ? 'Administrator' : user.roleId === 'role_pm' ? 'Project Manager' : 'Team Member'}</p>
          </div>
        )}
      </div>

      {/* Navigation menu scroll wrapper */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        
        {groups.map((group) => {
          const items = menuItems.filter(item => item.group === group);
          const hasAtLeastOnePermitted = items.some(item => hasPermission(item.id));
          
          if (!hasAtLeastOnePermitted) return null;

          return (
            <div key={group} className="space-y-1">
              {!collapsed && (
                <div className="px-2 pb-1 text-[10px] uppercase font-extrabold tracking-widest text-[#a1a1aa] whitespace-nowrap">
                  {group}
                </div>
              )}
              {items.map((item) => {
                if (!hasPermission(item.id)) return null;
                const isSelected = selectedCrudModelId === null && currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => navigateToTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left transition-colors duration-150 cursor-pointer text-sm ${
                      isSelected 
                        ? 'bg-blue-600 text-white font-semibold shadow-md' 
                        : 'hover:bg-[#494e54] text-[#c2c7d0] hover:text-white'
                    }`}
                  >
                    <span className="text-sm shrink-0">{item.icon}</span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          );
        })}

        {/* Dynamic Scaffolded Models list dynamically managed via CRUD generator */}
        <div className="space-y-1 pt-2 border-t border-[#4f5962]">
          {!collapsed && (
            <div className="px-2 pb-1 text-[10px] uppercase font-extrabold tracking-widest text-emerald-400 whitespace-nowrap flex items-center justify-between">
              <span>SCAFFOLDED CRUDs</span>
              <span className="bg-emerald-950 text-emerald-300 text-[9px] px-1.5 py-0.5 rounded-full font-mono">{generatedModels.length}</span>
            </div>
          )}

          {generatedModels.length === 0 ? (
            !collapsed && (
              <p className="text-[11px] text-[#8e9092] italic px-3 py-1 font-sans">
                No custom models generated yet. Use Generator engine!
              </p>
            )
          ) : (
            generatedModels.map((model) => {
              const isSelected = selectedCrudModelId === model.id;
              return (
                <div key={model.id} className="group/item flex items-center justify-between gap-1">
                  <button
                    onClick={() => navigateToCrud(model.id)}
                    className={`flex-1 flex items-center gap-3 px-3 py-2 rounded text-left transition-colors duration-150 cursor-pointer text-sm truncate ${
                      isSelected 
                        ? 'bg-emerald-600 text-white font-semibold shadow-md' 
                        : 'hover:bg-[#494e54] text-[#c2c7d0] hover:text-white'
                    }`}
                  >
                    <Tag className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="truncate font-medium">{model.label}</span>}
                  </button>

                  {!collapsed && user.roleId === 'role_admin' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Scrap the schema, database bindings, and controller mappings for "${model.name}"?`)) {
                          onDeleteModel(model.id);
                        }
                      }}
                      className="opacity-0 group-hover/item:opacity-100 hover:text-red-500 text-gray-500 p-1 rounded hover:bg-gray-700 transition"
                      title="Decommission generated code"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Footer Branding tag */}
      {!collapsed && (
        <div className="p-3 bg-[#2a2d33] border-t border-[#4f5962] text-[10px] text-center text-gray-400">
          <div className="font-semibold text-gray-300">Yajra + FontAwesome CDN</div>
          <p className="mt-0.5 text-[9px]">Server engine v4.21.2</p>
        </div>
      )}
    </aside>
  );
}
