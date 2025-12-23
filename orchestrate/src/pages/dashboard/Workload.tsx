import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/api.client';
import { User as UserIcon, Briefcase, Mail, BadgeCheck, AlertTriangle, CheckCircle2, Download, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import TaskForm from '../../components/TaskForm';

interface Task {
    id: string;
    title: string;
    priority: string;
    status: string;
}

interface DeveloperWorkload {
    id: string;
    name: string;
    email: string;
    activeTasksCount: number;
    estimatedHoursTotal?: number;
    actualHoursTotal?: number;
    workloadIntensity: 'GREEN' | 'YELLOW' | 'RED';
    tasksAssigned: Task[];
}

const Workload: React.FC = () => {
    const queryClient = useQueryClient();
    const [intensityFilter, setIntensityFilter] = useState<'ALL' | 'GREEN' | 'YELLOW' | 'RED'>('ALL');
    const [managingDev, setManagingDev] = useState<DeveloperWorkload | null>(null);
    const [selectedTask, setSelectedTask] = useState<any | null>(null);

    const { data: workload, isLoading } = useQuery<DeveloperWorkload[]>({
        queryKey: ['workload'],
        queryFn: async () => {
            const response = await api.get('/tasks/workload');
            return response.data;
        },
    });

    const updateTask = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            console.log('[FRONTEND] updateTask mutationFn (Workload):', id, data);
            const res = await api.patch(`/tasks/${id}`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workload'] });
            setSelectedTask(null);
            setManagingDev(null);
        },
        onError: (error: any) => {
            alert(`Error updating task: ${error.response?.data?.message || error.message}`);
        },
    });

    const deleteTask = useMutation({
        mutationFn: async (id: string) => {
            console.log('[FRONTEND] deleteTask mutationFn (Workload):', id);
            await api.delete(`/tasks/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workload'] });
            setSelectedTask(null);
            setManagingDev(null);
        },
        onError: (error: any) => {
            alert(`Error deleting task: ${error.response?.data?.message || error.message}`);
        },
    });

    const filtered = useMemo(() => {
        if (!workload) return [];
        if (intensityFilter === 'ALL') return workload;
        return workload.filter((w) => w.workloadIntensity === intensityFilter);
    }, [workload, intensityFilter]);

    const getIntensityColor = (intensity: string) => {
        switch (intensity) {
            case 'RED': return 'text-red-600 bg-red-50 border-red-200';
            case 'YELLOW': return 'text-amber-600 bg-amber-50 border-amber-200';
            default: return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        }
    };

    const getIntensityLabel = (intensity: string) => {
        switch (intensity) {
            case 'RED': return 'Heavy Workload';
            case 'YELLOW': return 'Moderate Workload';
            default: return 'Light Workload';
        }
    };

    const getIntensityIcon = (intensity: string) => {
        switch (intensity) {
            case 'RED': return <AlertTriangle size={14} />;
            case 'YELLOW': return <Briefcase size={14} />;
            default: return <CheckCircle2 size={14} />;
        }
    };

    const exportCsv = () => {
        if (!filtered.length) return;
        const rows = filtered.map(d => ({
            Name: d.name,
            Email: d.email,
            ActiveTasks: d.activeTasksCount,
            EstimatedHours: d.estimatedHoursTotal ?? '',
            LoggedHours: d.actualHoursTotal ?? '',
            Workload: getIntensityLabel(d.workloadIntensity),
        }));
        const header = Object.keys(rows[0]).join(',');
        const body = rows.map(r => Object.values(r).map(v => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'workload.csv';
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
        <div className="space-y-8 animate-in fade-in duration-500 font-['Source_Sans_Pro',_sans-serif]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Developer Workload</h1>
                    <p className="text-sm text-gray-500 mt-1">Monitor team capacity across all projects</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={intensityFilter}
                        onChange={(e) => setIntensityFilter(e.target.value as any)}
                        className="h-10 bg-white border border-gray-200 rounded-sm text-sm px-3 focus:outline-none focus:ring-1 focus:ring-accent-500"
                    >
                        <option value="ALL">All</option>
                        <option value="GREEN">Light</option>
                        <option value="YELLOW">Moderate</option>
                        <option value="RED">Heavy</option>
                    </select>
                    <button
                        onClick={exportCsv}
                        className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-sm font-semibold hover:bg-gray-50 transition-colors"
                    >
                        <Download size={16} />
                        <span>Download CSV</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered?.map((dev) => (
                    <div key={dev.id} className="bg-white border border-gray-200 rounded-sm overflow-hidden">
                        {/* Dev Header */}
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-start justify-between mb-4">
                                <div className="h-16 w-16 rounded-sm bg-gray-50 border border-gray-200 flex items-center justify-center text-primary-600">
                                    <UserIcon size={32} />
                                </div>
                                <div className={`px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider border flex items-center space-x-1.5 ${getIntensityColor(dev.workloadIntensity)}`}>
                                    {getIntensityIcon(dev.workloadIntensity)}
                                    <span>{getIntensityLabel(dev.workloadIntensity)}</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 leading-tight">{dev.name}</h3>
                                <div className="flex items-center space-x-2 text-gray-400 mt-1">
                                    <Mail size={12} />
                                    <span className="text-xs truncate">{dev.email}</span>
                                </div>
                            </div>
                        </div>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-3 divide-x divide-gray-100 bg-gray-50 border-b border-gray-100 text-center">
                            <div className="py-4">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Active</p>
                                <p className="text-xl font-black text-gray-900">{dev.activeTasksCount}</p>
                            </div>
                            <div className="py-4">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Est. Hrs</p>
                                <p className="text-xl font-black text-gray-900">{dev.estimatedHoursTotal ?? 0}</p>
                            </div>
                            <div className="py-4">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Logged Hrs</p>
                                <p className="text-xl font-black text-gray-900">{dev.actualHoursTotal ?? 0}</p>
                            </div>
                        </div>

                        {/* Recent Tasks */}
                        <div className="p-6">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Current Assignments</p>
                            <div className="space-y-3">
                                {dev.tasksAssigned.length > 0 ? (
                                    dev.tasksAssigned.slice(0, 3).map((task) => (
                                        <div key={task.id} className="flex items-start space-x-3 group cursor-pointer">
                                            <div className="mt-1 h-2 w-2 rounded-full bg-gray-200" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-gray-700 truncate">{task.title}</p>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase">{task.status}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400 italic py-2 text-center">No active tasks</p>
                                )}
                                {dev.tasksAssigned.length > 3 && (
                                    <p className="text-[9px] font-bold text-primary-600 bg-primary-50 py-1 text-center rounded-sm">
                                        +{dev.tasksAssigned.length - 3} MORE ACTIVE TASKS
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setManagingDev(dev)}
                                className="text-xs font-bold text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded-sm transition-colors flex items-center space-x-1"
                            >
                                <BadgeCheck size={14} />
                                <span>Manage Workload</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Task Selection Modal */}
            {managingDev && !selectedTask && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white border border-gray-200 rounded-sm w-full max-w-md shadow-xl p-6 relative">
                        <button
                            onClick={() => setManagingDev(null)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                        >
                            <X size={18} />
                        </button>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Manage {managingDev.name}'s Workload</h3>
                        <p className="text-xs text-gray-500 mb-6 uppercase tracking-tight font-bold">Select a task to reassign or remove</p>

                        <div className="space-y-3">
                            {managingDev.tasksAssigned.length > 0 ? (
                                managingDev.tasksAssigned.map((task) => (
                                    <button
                                        key={task.id}
                                        onClick={() => setSelectedTask(task)}
                                        className="w-full text-left p-4 border border-gray-100 rounded-sm hover:border-primary-500 hover:bg-primary-50 transition-all group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm font-bold text-gray-800 group-hover:text-primary-700">{task.title}</p>
                                            <span className="text-[9px] font-black uppercase text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded-sm">{task.priority}</span>
                                        </div>
                                        <div className="mt-1 flex items-center space-x-2">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{task.status}</span>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="py-8 text-center bg-gray-50 border border-dashed border-gray-200 rounded-sm">
                                    <p className="text-sm text-gray-400 italic">No tasks currently assigned</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setManagingDev(null)}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:underline"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Task Management Form */}
            {selectedTask && (
                <TaskForm
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onSave={(data) => updateTask.mutate({ id: selectedTask.id, data })}
                    onDelete={(id) => deleteTask.mutate(id)}
                    isSaving={updateTask.isPending}
                    isDeleting={deleteTask.isPending}
                />
            )}
        </div>
    );
};

export default Workload;
