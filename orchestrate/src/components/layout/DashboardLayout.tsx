import React, { useState } from 'react';
import { useNavigate, Link, Outlet } from '@tanstack/react-router';
import {
    LayoutDashboard,
    Ticket,
    Users,
    Grid,
    Search,
    Bell,
    LogOut,
    User as UserIcon,
    ChevronDown,
    Menu,
    Settings,
    ChevronLeft,
    ChevronRight,
    HelpCircle
} from 'lucide-react';

const DashboardLayout: React.FC = () => {
    const navigate = useNavigate();
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const [collapsed, setCollapsed] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate({ to: '/login' as any });
    };

    const navItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard', roles: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER', 'STAFF', 'PUBLIC'] },
        { name: 'Users', icon: <Users size={18} />, path: '/dashboard/users', roles: ['ADMIN'] },
        { name: 'Workload', icon: <Users size={18} />, path: '/dashboard/workload', roles: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER'] },
        { name: 'Projects', icon: <Grid size={18} />, path: '/dashboard/projects', roles: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER'] },
        { name: 'Tasks', icon: <Ticket size={18} />, path: '/dashboard/tasks', roles: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER'] },
        { name: 'Boardrooms', icon: <HelpCircle size={18} />, path: '/dashboard/boardrooms', roles: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER', 'STAFF', 'PUBLIC'] },
    ].filter(item => item.roles.includes(user?.role));

    return (
        <div className="flex h-screen bg-[#F0F2F5] font-sans">
            {/* Sidebar */}
            <div className={`${collapsed ? 'w-20' : 'w-64'} bg-[#001529] text-white flex flex-col shadow-xl shrink-0 transition-all duration-300 ease-in-out relative z-20`}>
                <div className="p-6 flex items-center space-x-3 mb-2 overflow-hidden">
                    <div className="h-8 w-8 bg-[#0f36a5] rounded-sm flex items-center justify-center text-white font-black text-xl shrink-0 shadow-lg shadow-[#0f36a5]/20">
                        O
                    </div>
                    {!collapsed && (
                        <div className="whitespace-nowrap">
                            <h2 className="text-lg font-bold leading-none tracking-tight">Orchestrate</h2>
                            <p className="text-[9px] text-gray-500 uppercase font-black mt-1 tracking-widest">Management</p>
                        </div>
                    )}
                </div>

                {/* Sidebar Profile Card */}
                <div className={`px-4 mb-6 transition-opacity duration-300 ${collapsed ? 'opacity-0 h-0 pointer-events-none' : 'opacity-100'}`}>
                    {!collapsed && (
                        <div className="bg-white/5 border border-white/10 rounded-sm p-5 text-center flex flex-col items-center">
                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#0f36a5] to-[#0b2573] flex items-center justify-center mb-3 shadow-xl border-4 border-white/5">
                                <UserIcon size={32} className="text-white" />
                            </div>
                            <h3 className="font-bold text-base leading-tight">Admin User</h3>
                            <p className="text-[10px] text-gray-500 mt-1 truncate w-full">{user?.email || 'admin@orchestrate.com'}</p>
                            <span className="mt-2 px-2.5 py-0.5 bg-[#0f36a5]/10 text-[#0f36a5] rounded-full text-[9px] font-black uppercase tracking-tighter border border-[#0f36a5]/20">
                                {user?.role || 'Super Admin'}
                            </span>
                        </div>
                    )}
                </div>

                {collapsed && (
                    <div className="px-4 mb-6 flex flex-col items-center">
                        <div className="h-10 w-10 rounded-lg bg-[#0f36a5]/10 flex items-center justify-center mb-4 border border-[#0f36a5]/20">
                            <UserIcon size={20} className="text-[#0f36a5]" />
                        </div>
                    </div>
                )}

                <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 space-y-1 custom-scrollbar">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path as any}
                            className={`flex items-center ${collapsed ? 'justify-center px-0' : 'px-4'} py-3 rounded-sm transition-all duration-200 group relative text-gray-400 hover:text-white hover:bg-white/5`}
                            activeProps={{
                                className: `bg-[#0f36a5] !text-white !opacity-100 shadow-lg shadow-[#0f36a5]/20`
                            }}
                            inactiveProps={{
                                className: `text-gray-400 hover:text-white hover:bg-white/5`
                            }}
                        >
                            <div className={`flex items-center ${collapsed ? '' : 'space-x-3'}`}>
                                <span className={`${collapsed ? 'scale-110' : ''}`}>{item.icon}</span>
                                {!collapsed && <span className="text-sm font-semibold tracking-tight">{item.name}</span>}
                            </div>
                        </Link>
                    ))}
                </nav>

                {/* Collapsible Toggle Widget */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-24 bg-[#0f36a5] text-white p-1.5 rounded-full shadow-2xl hover:scale-110 transition-transform z-30 border-2 border-[#0f36a5]/20 focus:outline-none"
                >
                    {collapsed ? <ChevronRight size={12} strokeWidth={3} /> : <ChevronLeft size={12} strokeWidth={3} />}
                </button>

                {/* Bottom Functional Area */}
                <div className="p-3 mt-auto bg-black/10">
                    <div className="flex flex-col space-y-1">
                        <button className={`flex items-center ${collapsed ? 'justify-center h-10' : 'space-x-3 px-4 py-2.5'} text-gray-400 hover:text-white hover:bg-white/5 rounded-sm transition-all w-full group focus:outline-none`}>
                            <Settings size={20} />
                            {!collapsed && <span className="text-sm font-semibold">Settings</span>}
                        </button>
                        <button className={`flex items-center ${collapsed ? 'justify-center h-10' : 'space-x-3 px-4 py-2.5'} text-gray-400 hover:text-white hover:bg-white/5 rounded-sm transition-all w-full group focus:outline-none`}>
                            <HelpCircle size={20} />
                            {!collapsed && <span className="text-sm font-semibold">Help Center</span>}
                        </button>
                        <div className="h-px bg-white/5 my-2" />
                        <button
                            onClick={handleLogout}
                            className={`flex items-center ${collapsed ? 'justify-center h-10' : 'space-x-3 px-4 py-2.5'} text-red-500 hover:bg-red-500/10 rounded-sm transition-all w-full group overflow-hidden focus:outline-none`}
                        >
                            <LogOut size={20} />
                            {!collapsed && <span className="text-sm font-bold">Sign Out</span>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Refined Topbar */}
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 shrink-0 shadow-sm z-10 relative">
                    <div className="flex items-center space-x-8 flex-1">
                        <Menu
                            size={24}
                            className="text-gray-400 cursor-pointer hover:text-[#0f36a5] transition-colors lg:hidden"
                            onClick={() => setCollapsed(!collapsed)}
                        />
                        <div className="relative w-full max-w-lg group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search size={18} className="text-gray-400 group-focus-within:text-[#0f36a5] transition-colors" />
                            </div>
                            <input
                                type="text"
                                className="w-full pl-12 pr-4 h-12 bg-[#f9fafb] border-none rounded-sm text-sm font-medium focus:bg-white focus:ring-1 focus:ring-[#f24d12] transition-all placeholder:text-gray-400"
                                placeholder="Quick search dashboard..."
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-8">
                        <div className="flex items-center space-x-4">
                            <button className="relative text-gray-400 hover:text-[#0f36a5] transition-all p-3 hover:bg-[#0f36a5]/5 rounded-sm focus:outline-none">
                                <Bell size={22} />
                                <span className="absolute top-2.5 right-2.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-4 ring-white" />
                            </button>
                        </div>

                        <div className="h-10 w-px bg-gray-100" />

                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center space-x-4 group cursor-pointer pl-2 focus:outline-none"
                            >
                                <div className="text-right">
                                    <p className="text-sm font-black text-gray-900 leading-none mb-1">{user?.name || 'Administrator'}</p>
                                    <p className="text-[10px] text-[#0f36a5] font-black uppercase tracking-widest">{user?.role || 'Global Admin'}</p>
                                </div>
                                <div className="h-12 w-12 rounded-sm bg-[#f9fafb] border border-[#e5e7eb] flex items-center justify-center text-gray-400 group-hover:bg-[#0f36a5]/10 group-hover:text-[#0f36a5] group-hover:border-[#0f36a5]/20 transition-all shadow-sm">
                                    <UserIcon size={24} />
                                </div>
                                <ChevronDown size={14} className={`text-gray-300 group-hover:text-[#0f36a5] transition-all ${showProfileMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {showProfileMenu && (
                                <div className="absolute right-0 mt-4 w-56 bg-white rounded-sm shadow-2xl border border-[#e5e7eb] py-3 z-50 animate-in fade-in slide-in-from-top-4">
                                    <div className="px-4 py-3 mb-2 border-b border-[#e5e7eb]">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Signed in as</p>
                                        <p className="text-xs font-bold text-gray-900 truncate">{user?.email || 'admin@orchestrate.com'}</p>
                                    </div>
                                    <button className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-[#f9fafb] hover:text-[#0f36a5] transition-colors font-semibold focus:outline-none">
                                        <UserIcon size={18} />
                                        <span>My Profile</span>
                                    </button>
                                    <button className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-[#f9fafb] hover:text-[#0f36a5] transition-colors font-semibold focus:outline-none">
                                        <Settings size={18} />
                                        <span>Settings</span>
                                    </button>
                                    <div className="h-px bg-[#e5e7eb] my-2" />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors font-bold focus:outline-none"
                                    >
                                        <LogOut size={18} />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content Viewport */}
                <main className="flex-1 overflow-y-auto p-10 bg-[#F8FAFC]">
                    <div className="max-w-[1600px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
