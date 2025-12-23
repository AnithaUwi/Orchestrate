import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api.client';
import {
    Calendar as CalendarIcon,
    Plus,
    User,
    ArrowLeft,
    ArrowRight,
    Download,
    X
} from 'lucide-react';

interface Room {
    id: string;
    name: string;
    capacity: number;
    equipment?: string;
    location?: string;
}

interface Booking {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    roomId: string;
    user?: { id: string; name: string };
    guestName?: string;
    description?: string;
    attendees?: string;
    status?: string;
}

const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

const Boardrooms: React.FC = () => {
    const [isPublicView, setIsPublicView] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [form, setForm] = useState({
        title: '',
        roomId: '',
        startTime: '',
        endTime: '',
        attendees: '',
        description: '',
    });
    const queryClient = useQueryClient();
    const user = useMemo(() => {
        const u = localStorage.getItem('user');
        return u ? JSON.parse(u) : null;
    }, []);

    const { data: rooms, isLoading: roomsLoading } = useQuery<Room[]>({
        queryKey: ['rooms'],
        queryFn: async () => {
            const response = await api.get('/bookings/rooms');
            return response.data;
        },
    });

    const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
        queryKey: ['bookings', isPublicView, selectedDate.toISOString().split('T')[0]],
        queryFn: async () => {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const url = isPublicView ? `/bookings/public?date=${dateStr}` : `/bookings?date=${dateStr}`;
            const response = await api.get(url);
            return response.data;
        },
    });

    const createBooking = useMutation({
        mutationFn: async () => {
            const payload = {
                title: form.title,
                roomId: form.roomId,
                startTime: form.startTime,
                endTime: form.endTime,
                attendees: form.attendees || undefined,
                description: form.description || undefined,
                isExternal: !user,
            };
            const res = await api.post('/bookings', payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            setShowCreate(false);
            setForm({ title: '', roomId: '', startTime: '', endTime: '', attendees: '', description: '' });
        },
    });

    const deleteBooking = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/bookings/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            setSelectedBooking(null);
        },
    });

    const slotBooking = (roomId: string, slot: string) => {
        if (!bookings) return undefined;
        return bookings.find(b => {
            const start = new Date(b.startTime);
            const end = new Date(b.endTime);
            const slotDate = new Date(start);
            const [h, m] = slot.split(':').map(Number);
            slotDate.setHours(h, m, 0, 0);
            return b.roomId === roomId && slotDate >= start && slotDate < end;
        });
    };

    const exportCsv = () => {
        if (!bookings || !bookings.length) return;
        const rows = bookings.map(b => ({
            Title: b.title,
            Room: rooms?.find(r => r.id === b.roomId)?.name || '',
            Start: b.startTime,
            End: b.endTime,
            Booker: b.user?.name || b.guestName || 'External',
        }));
        const header = Object.keys(rows[0]).join(',');
        const body = rows.map(r => Object.values(r).map(v => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'boardrooms.csv';
        link.click();
    };

    if (roomsLoading || bookingsLoading) {
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
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Boardroom Scheduling</h1>
                    <p className="text-sm text-gray-500 mt-1">Efficient boardroom utilization and conflict prevention</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={exportCsv}
                        className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-sm font-bold hover:bg-gray-50 transition-all text-xs shadow-sm"
                    >
                        <Download size={16} />
                        <span>Download CSV</span>
                    </button>
                    <button
                        className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-sm font-bold hover:bg-gray-50 transition-all text-xs shadow-sm"
                        onClick={() => setIsPublicView(!isPublicView)}
                    >
                        <CalendarIcon size={16} />
                        <span>{isPublicView ? 'Internal View' : 'Public View'}</span>
                    </button>
                    <button
                        onClick={() => {
                            setForm({ ...form, startTime: new Date().toISOString().slice(0, 16), endTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16) });
                            setShowCreate(true);
                        }}
                        disabled={!user}
                        className="flex items-center space-x-2 bg-[#0f36a5] hover:bg-[#0d2e8c] text-white px-5 py-2.5 rounded-sm font-bold transition-all shadow-md disabled:opacity-50"
                    >
                        <Plus size={18} />
                        <span>Instant Booking</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Rooms Sidebar */}
                <div className="lg:w-72 space-y-6">
                    <div className="bg-white border border-gray-200 rounded-sm p-4 shadow-sm border-t-[3px] border-t-[#0f36a5]">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Boardrooms</p>
                        <div className="space-y-3">
                            {rooms?.map((room) => (
                                <div key={room.id} className="p-3 bg-gray-50 border border-gray-100 rounded-sm group hover:bg-white hover:border-[#0f36a5] transition-all">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#0f36a5]">{room.name}</h4>
                                        <span className="text-[9px] font-black text-[#0f36a5] bg-[#0f36a5]/5 px-1.5 py-0.5 rounded-sm border border-[#0f36a5]/10 uppercase tracking-tighter">Seats {room.capacity}</span>
                                    </div>
                                    {(room.location || room.equipment) && (
                                        <p className="text-[10px] text-gray-500 mt-1 font-medium">
                                            {room.location && <span>{room.location}</span>}
                                            {room.location && room.equipment && ' • '}
                                            {room.equipment && <span>{room.equipment}</span>}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#0f36a5] rounded-sm p-6 text-white relative overflow-hidden shadow-lg">
                        <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
                            <CalendarIcon size={120} />
                        </div>
                        <h3 className="text-lg font-bold mb-2 relative z-10 tracking-tight">Guest Access</h3>
                        <p className="text-xs text-white/80 mb-6 leading-relaxed relative z-10 font-medium">
                            External guests can book rooms using the public scheduling terminal.
                        </p>
                        <button
                            onClick={() => {
                                const url = `${window.location.origin}/terminal`;
                                navigator.clipboard.writeText(url);
                                alert(`Public terminal link copied to clipboard!\n${url}`);
                            }}
                            className="w-full py-2.5 bg-white text-[#0f36a5] rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all shadow-md active:scale-95 relative z-10"
                        >
                            Copy Terminal Link
                        </button>
                    </div>
                </div>

                {/* Calendar View */}
                <div className="flex-1">
                    <div className="bg-white border border-gray-200 rounded-sm overflow-hidden text-[#111827] shadow-sm">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center space-x-6">
                                <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                                    Schedule Overview
                                </h3>
                                <div className="flex items-center space-x-2 border border-gray-200 rounded-sm p-1 bg-white shadow-sm font-['Source_Sans_Pro']">
                                    <button
                                        onClick={() => {
                                            const d = new Date(selectedDate);
                                            d.setDate(d.getDate() - 1);
                                            setSelectedDate(d);
                                        }}
                                        className="p-1.5 hover:bg-gray-50 rounded-sm transition-all text-gray-500 hover:text-[#0f36a5]"
                                    >
                                        <ArrowLeft size={16} />
                                    </button>
                                    <span className="text-[10px] font-black uppercase tracking-widest px-4 text-gray-400 whitespace-nowrap min-w-[140px] text-center">
                                        {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </span>
                                    <button
                                        onClick={() => {
                                            const d = new Date(selectedDate);
                                            d.setDate(d.getDate() + 1);
                                            setSelectedDate(d);
                                        }}
                                        className="p-1.5 hover:bg-gray-50 rounded-sm transition-all text-gray-500 hover:text-[#0f36a5]"
                                    >
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Available</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="h-2.5 w-2.5 rounded-full bg-[#0f36a5]" />
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Your Booking</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Occupied</span>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="w-24 p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center border-r border-gray-50 bg-gray-50/30">Time</th>
                                        {rooms?.map(room => (
                                            <th key={room.id} className="p-4 text-[10px] font-black text-gray-900 uppercase tracking-widest text-center border-r border-gray-50 last:border-r-0">
                                                {room.name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {timeSlots.map((time) => (
                                        <tr key={time} className="h-16 group">
                                            <td className="p-4 text-[11px] font-black text-gray-400 text-center border-r border-gray-50 bg-gray-50/30">{time}</td>
                                            {rooms?.map(room => {
                                                const booking = slotBooking(room.id, time);
                                                const isMine = booking && (booking as any).user?.id === user?.userId;
                                                return (
                                                    <td key={`${time}-${room.id}`} className="px-1.5 border-r border-gray-50 last:border-r-0 relative">
                                                        {booking ? (
                                                            <div
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedBooking(booking);
                                                                }}
                                                                className={`h-14 w-full rounded-sm border px-3 flex items-center justify-between text-xs cursor-pointer shadow-sm transition-all hover:brightness-95 ${isPublicView
                                                                    ? 'bg-gray-100 border-gray-200 text-gray-400'
                                                                    : isMine
                                                                        ? 'bg-[#0f36a5] border-[#0f36a5] text-white'
                                                                        : 'bg-white border-gray-200 text-[#0f36a5]'
                                                                    }`}>
                                                                <div className="truncate">
                                                                    <p className="font-bold truncate leading-tight">
                                                                        {isPublicView ? 'BOOKED' : booking.title}
                                                                    </p>
                                                                    {!isPublicView && (
                                                                        <p className={`text-[9px] truncate font-medium mt-0.5 ${isMine ? 'text-white/70' : 'text-gray-400'}`}>
                                                                            {booking.user?.name || booking.guestName || 'External'}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                {isMine && !isPublicView && (
                                                                    <div className="h-4 w-4 rounded-full bg-white/20 flex items-center justify-center">
                                                                        <X size={10} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => {
                                                                    const dateStr = selectedDate.toISOString().split('T')[0];
                                                                    setForm({
                                                                        ...form,
                                                                        roomId: room.id,
                                                                        startTime: `${dateStr}T${time}`,
                                                                        endTime: `${dateStr}T${time.split(':')[0].padStart(2, '0')}:59`,
                                                                    });
                                                                    setShowCreate(true);
                                                                }}
                                                                className="h-14 w-full rounded-sm border border-dashed border-gray-100 hover:border-[#0f36a5] hover:bg-[#0f36a5]/5 text-gray-200 hover:text-[#0f36a5] transition-all text-center flex items-center justify-center group/btn"
                                                                disabled={!user || isPublicView}
                                                            >
                                                                <Plus size={18} className="opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                                            </button>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {showCreate && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white border border-gray-200 rounded-sm w-full max-w-lg p-8 relative animate-in zoom-in-95 duration-200 shadow-2xl">
                        <button
                            onClick={() => setShowCreate(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-bold text-gray-900 mb-6 tracking-tight font-['Source_Sans_Pro']">Instant Booking</h3>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Meeting Title</label>
                                <input
                                    placeholder="e.g. Project Sync-up"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#0f36a5] transition-colors"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Boardroom</label>
                                <select
                                    className="w-full h-11 bg-white border border-gray-200 rounded-sm px-4 text-sm focus:outline-none focus:border-[#0f36a5] transition-colors"
                                    value={form.roomId}
                                    onChange={(e) => setForm({ ...form, roomId: e.target.value })}
                                >
                                    <option value="">Select a room...</option>
                                    {rooms?.map(r => (
                                        <option key={r.id} value={r.id}>{r.name} (Cap: {r.capacity})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Start Time</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full h-11 bg-white border border-gray-200 rounded-sm px-4 text-sm focus:outline-none focus:border-[#0f36a5] transition-colors"
                                        value={form.startTime}
                                        onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">End Time</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full h-11 bg-white border border-gray-200 rounded-sm px-4 text-sm focus:outline-none focus:border-[#0f36a5] transition-colors"
                                        value={form.endTime}
                                        onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => setShowCreate(false)}
                                    className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => createBooking.mutate()}
                                    disabled={createBooking.isPending || !form.title || !form.roomId || !form.startTime || !form.endTime}
                                    className="px-8 py-2.5 bg-[#0f36a5] hover:bg-[#0d2e8c] text-white rounded-sm text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {createBooking.isPending ? 'Booking...' : 'Confirm Booking'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {selectedBooking && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white border border-gray-200 rounded-sm w-full max-w-md p-8 relative animate-in zoom-in-95 duration-200 shadow-2xl">
                        <button
                            onClick={() => setSelectedBooking(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-900 tracking-tight">{selectedBooking.title}</h3>
                            <p className="text-[10px] font-black text-[#0f36a5] bg-[#0f36a5]/5 px-2 py-0.5 rounded-sm inline-block mt-2 uppercase tracking-widest border border-[#0f36a5]/10">
                                {rooms?.find(r => r.id === selectedBooking.roomId)?.name}
                            </p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center space-x-3 text-sm">
                                <CalendarIcon size={16} className="text-gray-400" />
                                <span className="text-gray-600 font-medium">
                                    {new Date(selectedBooking.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm">
                                <div className="h-4 w-4 flex items-center justify-center">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                </div>
                                <span className="text-gray-600 font-medium">
                                    {new Date(selectedBooking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedBooking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm">
                                <User size={16} className="text-gray-400" />
                                <span className="text-gray-600 font-medium">
                                    {selectedBooking.user?.name || selectedBooking.guestName || 'External Requester'}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                Close
                            </button>
                            {(selectedBooking.user?.id === user?.userId || user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER') && (
                                <button
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to cancel this booking?')) {
                                            deleteBooking.mutate(selectedBooking.id);
                                        }
                                    }}
                                    disabled={deleteBooking.isPending}
                                    className="px-8 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-sm text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {deleteBooking.isPending ? 'Cancelling...' : 'Cancel Booking'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Boardrooms;
