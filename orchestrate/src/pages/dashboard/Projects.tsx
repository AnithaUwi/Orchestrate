import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api.client';
import {
    Plus,
    Users,
    Calendar,
    ChevronRight,
    Layout,
    Activity,
    X
} from 'lucide-react';

interface Project {
    id: string;
    name: string;
    description: string;
    status: string;
    deadline?: string | null;
    pm?: { id: string; name: string; email: string } | null;
    _count: {
        tasks: number;
        members: number;
    };
    members: Array<{
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
        }
    }>;
}

const Projects: React.FC = () => {
    const navigate = useNavigate();
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const canCreate = user?.role === 'PROJECT_MANAGER' || user?.role === 'ADMIN';
    const queryClient = useQueryClient();
    const [showCreate, setShowCreate] = useState(false);
    const [viewingMembers, setViewingMembers] = useState<Project | null>(null);
    const [form, setForm] = useState({
        name: '',
        description: '',
        deadline: '',
    });

    const { data: projects, isLoading } = useQuery<Project[]>({
        queryKey: ['projects'],
        queryFn: async () => {
            const response = await api.get('/projects');
            return response.data;
        },
    });

    const createProject = useMutation({
        mutationFn: async () => {
            const res = await api.post('/projects', {
                name: form.name,
                description: form.description,
                pmId: user?.id, // Auto-assign current user as PM
                deadline: form.deadline || undefined,
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            setShowCreate(false);
            setForm({ name: '', description: '', deadline: '' });
        },
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'ARCHIVED': return 'text-gray-500 bg-gray-50 border-gray-100';
            default: return 'text-blue-600 bg-blue-50 border-blue-100';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f36a5]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-['Source_Sans_Pro',_sans-serif]">
            <div className="flex flex-col md:items-center md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Project Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage cross-functional teams and timelines</p>
                </div>
                <button
                    disabled={!canCreate}
                    onClick={() => setShowCreate(true)}
                    className="flex items-center space-x-2 bg-[#0f36a5] hover:bg-[#0d2e8c] text-white px-4 py-2.5 rounded-sm font-bold transition-all shadow-sm disabled:opacity-50"
                >
                    <Plus size={18} />
                    <span>Create New Project</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects?.map((project) => (
                    <div key={project.id} className="bg-white border border-[#e5e7eb] rounded-sm group hover:shadow-lg transition-all flex flex-col h-full border-t-[3px] border-t-[#0f36a5]">
                        <div className="p-6 flex-1">
                            <div className="flex justify-between items-start mb-6">
                                <div className="h-12 w-12 rounded-sm bg-gray-50 border border-gray-100 flex items-center justify-center text-[#0f36a5] group-hover:bg-[#0f36a5] group-hover:text-white transition-colors duration-300">
                                    <Layout size={24} />
                                </div>
                                <div className={`px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(project.status)}`}>
                                    {project.status}
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-2 truncate group-hover:text-[#0f36a5] transition-colors">{project.name}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed h-10">
                                {project.description || 'No description provided for this project.'}
                            </p>
                            <div className="flex items-center text-xs text-gray-500 mt-3 gap-3">
                                {project.pm?.name && (
                                    <span className="font-semibold">PM: {project.pm.name}</span>
                                )}
                                {project.deadline && (
                                    <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                                )}
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate({ to: '/dashboard/tasks' as any, search: { projectId: project.id } as any });
                                    }}
                                    className="bg-[#f9fafb] p-3 rounded-sm border border-gray-100 flex items-center space-x-3 cursor-pointer hover:border-[#0f36a5] hover:bg-[#0f36a5]/5 transition-all"
                                >
                                    <div className="text-[#0f36a5]">
                                        <Activity size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Tasks</p>
                                        <p className="text-sm font-black text-gray-900 leading-none">{project._count.tasks}</p>
                                    </div>
                                </div>
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setViewingMembers(project);
                                    }}
                                    className="bg-[#f9fafb] p-3 rounded-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:border-[#0f36a5] hover:bg-[#0f36a5]/5 transition-all group/members"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="text-[#0f36a5]">
                                            <Users size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Members</p>
                                            <p className="text-sm font-black text-gray-900 leading-none">{project._count.members}</p>
                                        </div>
                                    </div>
                                    <div className="flex -space-x-2 overflow-hidden">
                                        {project.members?.slice(0, 3).map((m, i) => (
                                            <div
                                                key={i}
                                                title={m.user.name}
                                                className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-100 border border-gray-200 flex items-center justify-center text-[8px] font-bold text-[#0f36a5] transition-transform group-hover/members:translate-y-[-2px]"
                                            >
                                                {m.user.name.charAt(0)}
                                            </div>
                                        ))}
                                        {project._count.members > 3 && (
                                            <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-50 border border-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-400">
                                                +{project._count.members - 3}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-gray-400">
                                <Calendar size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-tight">Active Project</span>
                            </div>
                            <button
                                onClick={() => navigate({ to: '/dashboard/tasks' as any, search: { projectId: project.id } as any })}
                                className="text-xs font-bold text-[#0f36a5] hover:text-[#0d2e8c] flex items-center space-x-1 group/btn transition-colors"
                            >
                                <span>Manage</span>
                                <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Create New Project Placeholder Card */}
                <div
                    onClick={() => canCreate && setShowCreate(true)}
                    className={`border border-dashed border-gray-300 rounded-sm p-6 flex flex-col items-center justify-center text-center group transition-all min-h-[340px] ${canCreate ? 'cursor-pointer hover:border-[#0f36a5] hover:bg-[#0f36a5]/5' : 'opacity-50 cursor-not-allowed'}`}
                >
                    <div className="h-16 w-16 rounded-full bg-gray-50 text-gray-300 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:text-[#0f36a5] transition-all">
                        <Plus size={32} />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">Initiate New Project</h3>
                    <p className="text-xs text-gray-500 mt-2 max-w-[200px] font-medium leading-relaxed">
                        Establish a new coordination space and assign your team members.
                    </p>
                </div>
            </div>

            {showCreate && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white border border-gray-200 rounded-sm w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowCreate(false)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                        >
                            <X size={18} />
                        </button>
                        <h3 className="text-xl font-bold text-gray-900 mb-6 font-['Source_Sans_Pro'] tracking-tight">Create New Project</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Project Name</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-[#0f36a5] transition-colors"
                                    placeholder="e.g. Zenith CRM"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-[#0f36a5] transition-colors h-24 resize-none"
                                    placeholder="Brief project summary..."
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Deadline</label>
                                <input
                                    type="date"
                                    value={form.deadline}
                                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-[#0f36a5] transition-colors"
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowCreate(false)}
                                className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => createProject.mutate()}
                                disabled={!form.name || createProject.isPending}
                                className="px-6 py-2 bg-[#0f36a5] hover:bg-[#0d2e8c] text-white rounded-sm text-sm font-bold shadow-md transition-all disabled:opacity-50"
                            >
                                {createProject.isPending ? 'Initiating...' : 'Create Project'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {viewingMembers && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white border border-gray-200 rounded-sm w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setViewingMembers(null)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                        >
                            <X size={18} />
                        </button>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{viewingMembers.name}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Project Team</p>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {viewingMembers.members && viewingMembers.members.length > 0 ? (
                                viewingMembers.members.map((m) => (
                                    <div key={m.user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-sm border border-gray-100 group">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#0f36a5] font-bold text-xs shadow-sm group-hover:border-[#0f36a5] transition-colors">
                                                {m.user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 leading-tight">{m.user.name}</p>
                                                <p className="text-[10px] text-gray-400 font-medium leading-tight">{m.user.email}</p>
                                            </div>
                                        </div>
                                        <div className="px-2 py-0.5 rounded-sm bg-[#0f36a5]/5 text-[#0f36a5] border border-[#0f36a5]/10 text-[8px] font-black uppercase tracking-tighter">
                                            {m.user.role}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <Users size={32} className="mx-auto text-gray-200 mb-2" />
                                    <p className="text-xs text-gray-400 font-medium italic">No active members yet.</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setViewingMembers(null)}
                                className="px-8 py-2 bg-[#0f36a5] hover:bg-[#0d2e8c] text-white rounded-sm text-sm font-bold shadow-md transition-all active:scale-95"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;

// Modal rendered at bottom to avoid interfering with return
// (Kept here for simplicity)
