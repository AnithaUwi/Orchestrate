import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/api.client';
import { X, Trash2 } from 'lucide-react';

interface TaskFormProps {
    task?: any;
    onClose: () => void;
    onSave: (data: any) => void;
    onDelete?: (id: string) => void;
    isSaving?: boolean;
    isDeleting?: boolean;
}

const statusOptions = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const TaskForm: React.FC<TaskFormProps> = ({ task, onClose, onSave, onDelete, isSaving, isDeleting }) => {
    const isEdit = !!task;
    const [form, setForm] = useState({
        title: task?.title || '',
        description: task?.description || '',
        projectId: task?.projectId || task?.project?.id || '',
        assignedToId: task?.assignedToId || task?.assignedTo?.id || '',
        priority: task?.priority || 'MEDIUM',
        status: task?.status || 'TODO',
        estimatedHours: task?.estimatedHours || '',
        dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        loggedHours: task?.loggedHours || task?.actualHours || '',
    });

    const { data: projects } = useQuery<any[]>({
        queryKey: ['projects-options'],
        queryFn: async () => {
            const response = await api.get('/projects');
            return response.data;
        },
    });

    const { data: developers } = useQuery<any[]>({
        queryKey: ['developers-options'],
        queryFn: async () => {
            const response = await api.get('/tasks/workload');
            return response.data;
        },
    });

    const handleSubmit = () => {
        const payload = {
            ...form,
            estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : undefined,
            loggedHours: form.loggedHours ? Number(form.loggedHours) : undefined,
            dueDate: form.dueDate || null,
            assignedToId: form.assignedToId || "", // Backend handles empty string as null
        };
        onSave(payload);
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[60]">
            <div className="bg-white border border-gray-200 rounded-sm w-full max-w-lg shadow-xl p-6 relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={18} />
                </button>

                <h3 className="text-lg font-bold text-gray-900 mb-6">
                    {isEdit ? 'Edit Task' : 'Create New Task'}
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title</label>
                        <input
                            className="w-full bg-gray-50 border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f36a5]"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="Ente task title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                        <textarea
                            className="w-full bg-gray-50 border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f36a5]"
                            rows={3}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Describe the task details..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project</label>
                            <select
                                className="w-full h-10 bg-white border border-gray-200 rounded-sm px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f36a5]"
                                value={form.projectId}
                                onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                            >
                                <option value="">Select project</option>
                                {projects?.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Assignee</label>
                            <select
                                className="w-full h-10 bg-white border border-gray-200 rounded-sm px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f36a5]"
                                value={form.assignedToId}
                                onChange={(e) => setForm({ ...form, assignedToId: e.target.value })}
                            >
                                <option value="">Unassigned</option>
                                {developers?.map((d) => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                            <select
                                className="w-full h-10 bg-white border border-gray-200 rounded-sm px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f36a5]"
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                            >
                                {statusOptions.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Priority</label>
                            <select
                                className="w-full h-10 bg-white border border-gray-200 rounded-sm px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f36a5]"
                                value={form.priority}
                                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                            >
                                {priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Est. Hours</label>
                            <input
                                type="number"
                                className="w-full h-10 bg-gray-50 border border-gray-200 rounded-sm px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f36a5]"
                                value={form.estimatedHours}
                                onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })}
                                min="0"
                                step="0.5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Logged Hours</label>
                            <input
                                type="number"
                                className="w-full h-10 bg-gray-50 border border-gray-200 rounded-sm px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f36a5]"
                                value={form.loggedHours}
                                onChange={(e) => setForm({ ...form, loggedHours: e.target.value })}
                                min="0"
                                step="0.5"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Due Date</label>
                        <input
                            type="date"
                            className="w-full h-10 bg-white border border-gray-200 rounded-sm px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0f36a5]"
                            value={form.dueDate}
                            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <div>
                            {isEdit && onDelete && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (window.confirm('Are you sure you want to delete this task?')) {
                                            console.log('[FRONTEND] Triggering onDelete for task:', task.id);
                                            onDelete(task.id);
                                        }
                                    }}
                                    disabled={isDeleting || isSaving}
                                    className="flex items-center space-x-2 text-red-600 hover:text-red-700 text-sm font-bold transition-colors disabled:opacity-50"
                                >
                                    <Trash2 size={16} />
                                    <span>{isDeleting ? 'Deleting...' : 'Delete Task'}</span>
                                </button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-200 rounded-sm text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSaving || !form.title || !form.projectId}
                                className="px-6 py-2 bg-[#0f36a5] hover:bg-[#0d2e8c] text-white rounded-sm text-sm font-bold shadow-md transition-all disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : (isEdit ? 'Update Task' : 'Create Task')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskForm;
