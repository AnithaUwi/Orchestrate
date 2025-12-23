import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api.client';
import {
    Ticket,
    Plus,
    Search,
    Download,
    AlertCircle,
    MoreHorizontal,
    X,
    Edit2,
    Trash2
} from 'lucide-react';
import TaskForm from '../../components/TaskForm';

interface Task {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    estimatedHours?: number;
    actualHours?: number;
    loggedHours?: number;
    dueDate?: string;
    project: { id: string; name: string };
    assignedTo: { id: string; name: string } | null;
    createdBy?: { id: string; name: string } | null;
}

interface ProjectOption {
    id: string;
    name: string;
}

interface DeveloperOption {
    id: string;
    name: string;
}

const statusOptions = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const Tasks: React.FC = () => {
    const search = useSearch({ from: '/dashboard/tasks' }) as any;
    const [projectIdFilter, setProjectIdFilter] = useState(search.projectId || '');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [showCreate, setShowCreate] = useState(false);

    useEffect(() => {
        if (search.projectId) {
            setProjectIdFilter(search.projectId);
        }
    }, [search.projectId]);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [form, setForm] = useState({
        title: '',
        description: '',
        projectId: '',
        assignedToId: '',
        priority: 'MEDIUM',
        status: 'TODO',
        estimatedHours: '',
        dueDate: '',
        loggedHours: '',
    });
    const queryClient = useQueryClient();
    const user = useMemo(() => {
        const u = localStorage.getItem('user');
        return u ? JSON.parse(u) : null;
    }, []);
    const canCreate = user?.role === 'PROJECT_MANAGER' || user?.role === 'ADMIN';

    const { data: tasks, isLoading } = useQuery<Task[]>({
        queryKey: ['tasks', searchQuery, statusFilter, priorityFilter, projectIdFilter],
        queryFn: async () => {
            const response = await api.get('/tasks', {
                params: {
                    search: searchQuery || undefined,
                    status: statusFilter || undefined,
                    priority: priorityFilter || undefined,
                    projectId: projectIdFilter || undefined,
                },
            });
            return response.data;
        },
    });

    const { data: projects } = useQuery<ProjectOption[]>({
        queryKey: ['projects-options'],
        queryFn: async () => {
            const response = await api.get('/projects');
            return response.data;
        },
    });

    const { data: developers } = useQuery<DeveloperOption[]>({
        queryKey: ['developers-options'],
        queryFn: async () => {
            const response = await api.get('/tasks/workload');
            return response.data.map((d: any) => ({ id: d.id, name: d.name }));
        },
    });

    const createTask = useMutation({
        mutationFn: async (payload: any) => {
            const res = await api.post('/tasks', payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            setShowCreate(false);
        },
        onError: (error: any) => {
            alert(`Error creating task: ${error.response?.data?.message || error.message}`);
        },
    });

    const updateTask = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            console.log('[FRONTEND] updateTask mutationFn:', id, data);
            const res = await api.patch(`/tasks/${id}`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            setEditingTask(null);
        },
        onError: (error: any) => {
            alert(`Error updating task: ${error.response?.data?.message || error.message}`);
        },
    });

    const deleteTask = useMutation({
        mutationFn: async (id: string) => {
            console.log('[FRONTEND] deleteTask mutationFn:', id);
            await api.delete(`/tasks/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            setEditingTask(null);
        },
        onError: (error: any) => {
            alert(`Error deleting task: ${error.response?.data?.message || error.message}`);
        },
    });

    const filteredTasks = tasks || [];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'DONE': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'IN_PROGRESS': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'IN_REVIEW': return 'bg-purple-50 text-purple-600 border-purple-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const getPriorityStyle = (priority: string) => {
        switch (priority) {
            case 'CRITICAL': return 'text-red-600';
            case 'HIGH': return 'text-orange-600';
            case 'MEDIUM': return 'text-amber-600';
            default: return 'text-gray-500';
        }
    };

    const exportCsv = () => {
        if (!filteredTasks.length) return;
        const rows = filteredTasks.map(t => ({
            Title: t.title,
            Project: t.project?.name,
            Assignee: t.assignedTo?.name || '',
            Status: t.status,
            Priority: t.priority,
            EstimatedHours: t.estimatedHours || '',
            ActualHours: t.actualHours || '',
        }));
        const header = Object.keys(rows[0]).join(',');
        const body = rows.map(r => Object.values(r).map(v => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'tasks.csv';
        link.click();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 font-['Source_Sans_Pro',_sans-serif]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Task Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Track and manage project priorities</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={exportCsv}
                        className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-sm font-semibold hover:bg-gray-50 transition-colors"
                    >
                        <Download size={16} />
                        <span>Download CSV</span>
                    </button>
                    <button
                        onClick={() => setShowCreate(true)}
                        disabled={!canCreate}
                        className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-sm font-semibold transition-colors disabled:opacity-50"
                    >
                        <Plus size={18} />
                        <span>Create New Task</span>
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 border border-gray-200 rounded-sm flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        className="w-full pl-10 pr-4 h-10 bg-gray-50 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center space-x-3 flex-wrap">
                    <select
                        value={projectIdFilter}
                        onChange={(e) => setProjectIdFilter(e.target.value)}
                        className="h-10 bg-white border border-gray-200 rounded-sm text-sm px-3 focus:outline-none focus:ring-1 focus:ring-accent-500"
                    >
                        <option value="">All Projects</option>
                        {projects?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-10 bg-white border border-gray-200 rounded-sm text-sm px-3 focus:outline-none focus:ring-1 focus:ring-accent-500"
                    >
                        <option value="">All Statuses</option>
                        {statusOptions.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="h-10 bg-white border border-gray-200 rounded-sm text-sm px-3 focus:outline-none focus:ring-1 focus:ring-accent-500"
                    >
                        <option value="">All Priorities</option>
                        {priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
            </div>

            {/* Task Table */}
            <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Task</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Assignee</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Status</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Priority</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Est / Logged</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Due</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Created By</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredTasks.map((task) => (
                            <tr key={task.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{task.title}</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{task.project?.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col items-center">
                                        <div className="h-8 w-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-primary-600 mb-1">
                                            <span className="text-[10px] font-bold">{task.assignedTo?.name?.charAt(0) || '?'}</span>
                                        </div>
                                        <span className="text-[11px] font-medium text-gray-600">{task.assignedTo?.name || 'Unassigned'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center">
                                        <span className={`px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-tighter border ${getStatusStyle(task.status)}`}>
                                            {task.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center">
                                        <div className={`flex items-center space-x-1.5 ${getPriorityStyle(task.priority)}`}>
                                            <AlertCircle size={10} />
                                            <span className="text-[10px] font-bold uppercase tracking-wide">{task.priority}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center text-xs text-gray-600">
                                    {(task.estimatedHours ?? '-') + ' / ' + (task.loggedHours ?? task.actualHours ?? '-')}
                                </td>
                                <td className="px-6 py-4 text-center text-xs text-gray-600">
                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                                </td>
                                <td className="px-6 py-4 text-center text-xs text-gray-600">
                                    {task.createdBy?.name || '—'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setEditingTask(task)}
                                            className="p-2 text-gray-400 hover:text-[#0f36a5] hover:bg-blue-50 rounded-sm transition-all focus:outline-none"
                                            title="Edit Task"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to delete this task?')) {
                                                    deleteTask.mutate(task.id);
                                                }
                                            }}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all focus:outline-none"
                                            title="Delete Task"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!filteredTasks || filteredTasks.length === 0) && (
                    <div className="p-12 text-center">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-50 text-gray-300 mb-4">
                            <Ticket size={32} />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900">No tasks found</h3>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-tight font-medium">Create your first task to get started</p>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest px-2">
                <span>Showing {filteredTasks.length} tasks total</span>
            </div>

            {showCreate && (
                <TaskForm
                    onClose={() => setShowCreate(false)}
                    onSave={(data) => createTask.mutate(data)}
                    isSaving={createTask.isPending}
                />
            )}

            {editingTask && (
                <TaskForm
                    task={editingTask}
                    onClose={() => setEditingTask(null)}
                    onSave={(data) => updateTask.mutate({ id: editingTask.id, data })}
                    onDelete={(id) => deleteTask.mutate(id)}
                    isSaving={updateTask.isPending}
                    isDeleting={deleteTask.isPending}
                />
            )}
        </div>
    );
};

export default Tasks;
