import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api.client';
import { Plus, Trash2, UserX, UserCheck, Loader2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'DISABLED';
}

const roles = ['PROJECT_MANAGER', 'DEVELOPER', 'STAFF'];

const AdminUsers: React.FC = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'DEVELOPER', password: '' });
  const queryClient = useQueryClient();
  const user = useMemo(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  }, []);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data;
    },
    enabled: user?.role === 'ADMIN',
  });

  const createUser = useMutation({
    mutationFn: async () => {
      const res = await api.post('/users', form);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowCreate(false);
      setForm({ name: '', email: '', role: 'DEVELOPER', password: '' });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'ACTIVE' | 'DISABLED' }) => {
      const res = await api.patch(`/users/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/users/${id}`);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  if (user?.role !== 'ADMIN') {
    return <div className="text-sm text-gray-600">Access restricted to admin.</div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <Loader2 className="animate-spin mr-2" size={18} /> Loading users...
      </div>
    );
  }

  return (
    <div className="space-y-6 font-['Source_Sans_Pro',_sans-serif]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Admin-only user lifecycle control</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-sm font-semibold transition-colors"
        >
          <Plus size={16} />
          <span>Create User</span>
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase text-center">Role</th>
              <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase text-center">Status</th>
              <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users?.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">{u.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                <td className="px-4 py-3 text-sm text-gray-600 text-center">{u.role}</td>
                <td className="px-4 py-3 text-sm text-center">
                  <span
                    className={`px-2 py-0.5 rounded-sm text-[11px] font-bold uppercase border ${u.status === 'ACTIVE'
                      ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                      : 'text-red-600 bg-red-50 border-red-200'
                      }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right space-x-2">
                  {u.status === 'ACTIVE' ? (
                    <button
                      onClick={() => updateStatus.mutate({ id: u.id, status: 'DISABLED' })}
                      className="inline-flex items-center px-2 py-1 text-[12px] font-semibold text-red-600 border border-red-200 rounded-sm hover:bg-red-50"
                    >
                      <UserX size={14} className="mr-1" /> Disable
                    </button>
                  ) : (
                    <button
                      onClick={() => updateStatus.mutate({ id: u.id, status: 'ACTIVE' })}
                      className="inline-flex items-center px-2 py-1 text-[12px] font-semibold text-emerald-600 border border-emerald-200 rounded-sm hover:bg-emerald-50"
                    >
                      <UserCheck size={14} className="mr-1" /> Activate
                    </button>
                  )}
                  <button
                    onClick={() => deleteUser.mutate(u.id)}
                    className="inline-flex items-center px-2 py-1 text-[12px] font-semibold text-gray-600 border border-gray-200 rounded-sm hover:bg-gray-50"
                  >
                    <Trash2 size={14} className="mr-1" /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {(!users || users.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border border-gray-200 rounded-sm w-full max-w-lg p-6 relative">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  className="w-full bg-gray-50 border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent-500"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  className="w-full bg-gray-50 border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent-500"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                  <select
                    className="w-full h-10 bg-white border border-gray-200 rounded-sm px-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent-500"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password (optional)</label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent-500"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Default: changeme123"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 border border-gray-200 rounded-sm text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => createUser.mutate()}
                  disabled={createUser.isPending || !form.name || !form.email}
                  className="px-4 py-2 bg-[#0f36a5] hover:bg-[#0d2e8c] text-white rounded-sm text-sm font-semibold disabled:opacity-50"
                >
                  {createUser.isPending ? 'Saving...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

