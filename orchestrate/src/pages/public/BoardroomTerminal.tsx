import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import publicApi from '../../api/public.client';
import {
    Calendar as CalendarIcon,
    Plus,
    User,
    ArrowLeft,
    ArrowRight,
    X,
    Info,
    Shield,
    CheckCircle2
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
    user?: { name: string };
    guestName?: string;
}

const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

const BoardroomTerminal: React.FC = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showCreate, setShowCreate] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [successToken, setSuccessToken] = useState<string | null>(null);
    const [form, setForm] = useState({
        title: '',
        roomId: '',
        startTime: '',
        endTime: '',
        guestName: '',
        guestEmail: '',
    });

    const queryClient = useQueryClient();

    // Dynamic Clock
    React.useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const { data: rooms } = useQuery<Room[]>({
        queryKey: ['rooms-public'],
        queryFn: async () => {
            const response = await publicApi.get('/bookings/rooms');
            return response.data;
        },
    });

    const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
        queryKey: ['bookings-public', selectedDate.toISOString().split('T')[0]],
        queryFn: async () => {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const response = await publicApi.get(`/bookings/public?date=${dateStr}`);
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
                guestName: form.guestName,
                guestEmail: form.guestEmail,
                isExternal: true,
            };
            const res = await publicApi.post('/bookings', payload);
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['bookings-public'] });
            setSuccessToken(data.cancellationToken);
            setShowCreate(false);
            setForm({ title: '', roomId: '', startTime: '', endTime: '', guestName: '', guestEmail: '' });
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Booking failed');
        }
    });

    const slotBooking = (roomId: string, slot: string) => {
        if (!bookings) return undefined;
        return bookings.find(b => {
            const bDate = new Date(b.startTime);
            const slotHour = parseInt(slot.split(':')[0]);
            return b.roomId === roomId && bDate.getHours() === slotHour;
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-['Source_Sans_Pro',_sans-serif]">
            {/* Minimal Kiosk Header */}
            <header className="bg-[#0f36a5] text-white py-6 px-10 shadow-lg flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase italic">Orchestrate</h1>
                    <p className="text-xs font-bold text-white/60 tracking-widest uppercase mt-1">Guest Scheduling Terminal</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-black tracking-tight">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                        {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                </div>
            </header>

            <main className="flex-1 p-10 max-w-7xl mx-auto w-full">
                <div className="bg-white border border-gray-200 rounded-sm shadow-xl overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div className="flex items-center space-x-10">
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Boardroom Availability</h2>
                            <div className="flex items-center space-x-2 border border-gray-200 rounded-sm p-1.5 bg-white shadow-md">
                                <button
                                    onClick={() => {
                                        const d = new Date(selectedDate);
                                        d.setDate(d.getDate() - 1);
                                        setSelectedDate(d);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-sm text-gray-500 hover:text-[#0f36a5] transition-all"
                                >
                                    <ArrowLeft size={24} />
                                </button>
                                <span className="text-sm font-black uppercase tracking-widest px-8 text-gray-900 min-w-[200px] text-center">
                                    {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                                <button
                                    onClick={() => {
                                        const d = new Date(selectedDate);
                                        d.setDate(d.getDate() + 1);
                                        setSelectedDate(d);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-sm text-gray-500 hover:text-[#0f36a5] transition-all"
                                >
                                    <ArrowRight size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-3">
                                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="h-3 w-3 rounded-full bg-[#0f36a5]/10 border border-[#0f36a5]/20" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Occupied</span>
                            </div>
                        </div>
                    </div>

                    {/* Simple Grid */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="w-24 p-6 text-[10px] font-black text-gray-900 uppercase tracking-widest text-center border-r border-gray-50 bg-gray-50/30">Time</th>
                                    {rooms?.map(room => (
                                        <th key={room.id} className="p-6 text-[11px] font-black text-gray-900 uppercase tracking-widest text-center border-r border-gray-50 last:border-r-0">
                                            {room.name}
                                            <span className="block text-[9px] text-gray-400 mt-1 font-medium">Cap: {room.capacity}</span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {timeSlots.map((time) => (
                                    <tr key={time} className="h-24">
                                        <td className="p-6 text-sm font-black text-gray-900 text-center border-r border-gray-50 bg-gray-50/30">{time}</td>
                                        {rooms?.map(room => {
                                            const booking = slotBooking(room.id, time);
                                            const displayName = booking?.user?.name || booking?.guestName || 'Reserved';
                                            return (
                                                <td key={`${time}-${room.id}`} className="px-2 border-r border-gray-50 last:border-r-0 relative">
                                                    {booking ? (
                                                        <div
                                                            onClick={() => setSelectedBooking(booking)}
                                                            className="h-20 w-full rounded-sm bg-[#0f36a5]/5 border border-[#0f36a5]/10 px-4 flex items-center justify-between text-xs cursor-pointer hover:bg-[#0f36a5]/10 transition-all"
                                                        >
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-black text-[#0f36a5] uppercase tracking-widest leading-none mb-1">Booked by</span>
                                                                <span className="text-sm font-bold text-gray-900 truncate max-w-[120px]">{displayName}</span>
                                                            </div>
                                                            <Info size={16} className="text-[#0f36a5]/40" />
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                const dateStr = selectedDate.toISOString().split('T')[0];
                                                                setForm({
                                                                    ...form,
                                                                    roomId: room.id,
                                                                    startTime: `${dateStr}T${time}:00`,
                                                                    endTime: `${dateStr}T${time}:59`,
                                                                });
                                                                setShowCreate(true);
                                                            }}
                                                            className="h-20 w-full rounded-sm border-2 border-dashed border-gray-100 hover:border-[#0f36a5] hover:bg-[#0f36a5]/5 text-gray-100 hover:text-[#0f36a5] transition-all flex flex-col items-center justify-center space-y-1 group"
                                                        >
                                                            <Plus size={24} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            <span className="text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 tracking-widest">Book Slot</span>
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

                <div className="mt-10 flex items-center justify-center space-x-6 text-gray-400">
                    <p className="text-xs font-medium">To edit or cancel a booking, please contact an Orchestrate administrator.</p>
                </div>
            </main>

            {/* Guest Booking Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-6">
                    <div className="bg-white rounded-sm w-full max-w-xl p-10 relative animate-in zoom-in-95 duration-200 shadow-2xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#0f36a5]" />
                        <button
                            onClick={() => setShowCreate(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={28} />
                        </button>

                        <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Guest Booking</h2>
                        <p className="text-sm text-gray-500 mb-8">Please provide your details to reserve this boardroom.</p>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#0f36a5] mb-2">Your Name</label>
                                    <input
                                        placeholder="Full Name"
                                        className="w-full h-12 bg-gray-50 border border-gray-200 rounded-sm px-4 text-sm focus:outline-none focus:border-[#0f36a5] transition-colors"
                                        value={form.guestName}
                                        onChange={(e) => setForm({ ...form, guestName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#0f36a5] mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="email@example.com"
                                        className="w-full h-12 bg-gray-50 border border-gray-200 rounded-sm px-4 text-sm focus:outline-none focus:border-[#0f36a5] transition-colors"
                                        value={form.guestEmail}
                                        onChange={(e) => setForm({ ...form, guestEmail: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[#0f36a5] mb-2">Meeting Title</label>
                                <input
                                    placeholder="Purpose of room usage"
                                    className="w-full h-12 bg-gray-50 border border-gray-200 rounded-sm px-4 text-sm focus:outline-none focus:border-[#0f36a5] transition-colors"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                />
                            </div>

                            <div className="bg-[#0f36a5]/5 p-6 rounded-sm border border-[#0f36a5]/10 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <CalendarIcon className="text-[#0f36a5]" size={20} />
                                    <div>
                                        <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Selected Slot</p>
                                        <p className="text-sm font-medium text-[#0f36a5]">
                                            {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} at {form.startTime.split('T')[1]?.slice(0, 5)}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Room</p>
                                    <p className="text-sm font-bold text-gray-900">
                                        {rooms?.find(r => r.id === form.roomId)?.name}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-6">
                                <button
                                    onClick={() => setShowCreate(false)}
                                    className="px-8 h-12 text-sm font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => createBooking.mutate()}
                                    disabled={createBooking.isPending || !form.guestName || !form.guestEmail || !form.title}
                                    className="px-12 h-12 bg-[#0f36a5] hover:bg-[#0d2e8c] text-white rounded-sm text-sm font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {createBooking.isPending ? 'Processing...' : 'Reserve Now'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {successToken && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-6">
                    <div className="bg-white rounded-sm w-full max-w-lg p-10 relative animate-in zoom-in-95 duration-200 shadow-2xl overflow-hidden text-center">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500" />
                        <div className="bg-emerald-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                            <CheckCircle2 size={32} className="text-emerald-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                            Your reservation is set. A confirmation has been sent to your email.
                        </p>

                        <div className="bg-amber-50 border border-amber-100 rounded-sm p-6 mb-8 text-left">
                            <div className="flex items-center space-x-2 mb-2">
                                <Shield className="text-amber-600" size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Cancellation Policy</span>
                            </div>
                            <p className="text-xs text-amber-800 leading-relaxed font-medium">
                                If you need to cancel, please save the link below. You won't be able to access it again.
                            </p>
                            <div className="mt-4 p-3 bg-white border border-amber-200 rounded-sm text-[10px] font-bold text-gray-500 break-all">
                                {window.location.origin}/terminal/cancel?token={successToken}
                            </div>
                        </div>

                        <button
                            onClick={() => setSuccessToken(null)}
                            className="w-full h-12 bg-gray-900 text-white rounded-sm text-xs font-black uppercase tracking-widest hover:bg-black transition-all"
                        >
                            Back to Schedule
                        </button>
                    </div>
                </div>
            )}

            {/* Selection Detail Modal (Masked) */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                    <div className="bg-white border border-gray-200 rounded-sm w-full max-w-sm p-8 relative animate-in zoom-in-95 duration-200 shadow-2xl text-center">
                        <div className="bg-gray-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Info size={32} className="text-[#0f36a5]" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Details</h3>
                        <p className="text-sm text-gray-500 mb-2 leading-relaxed">
                            Reserved for <strong>{selectedBooking.user?.name || selectedBooking.guestName || 'Staff Member'}</strong>
                        </p>
                        <p className="text-xs text-gray-400 mb-8">
                            Meeting Title: {selectedBooking.title}
                        </p>
                        <button
                            onClick={() => setSelectedBooking(null)}
                            className="w-full h-11 bg-gray-900 text-white rounded-sm text-xs font-black uppercase tracking-widest hover:bg-black transition-all"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BoardroomTerminal;
