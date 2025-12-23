import React from 'react';
import { Link } from '@tanstack/react-router';
import { Users, Grid, CalendarDays } from 'lucide-react';

const Overview: React.FC = () => {
    const cards = [
        {
            title: 'Projects',
            description: 'Create and manage projects, assign developers, set deadlines.',
            icon: <Grid size={22} className="text-primary-500" />,
            to: '/dashboard/projects',
        },
        {
            title: 'Workload',
            description: 'Monitor developer workloads with clear capacity indicators.',
            icon: <Users size={22} className="text-primary-500" />,
            to: '/dashboard/workload',
        },
        {
            title: 'Boardrooms',
            description: 'Schedule and manage boardroom bookings with conflict prevention.',
            icon: <CalendarDays size={22} className="text-primary-500" />,
            to: '/dashboard/boardrooms',
        },
    ];

    return (
        <div className="space-y-6 font-['Source_Sans_Pro',_sans-serif]">
            <h1 className="text-2xl font-bold text-gray-900">Orchestrate Dashboard</h1>
            <p className="text-sm text-gray-600">Choose a module to manage.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map(card => (
                    <Link
                        key={card.title}
                        to={card.to as any}
                        className="block bg-white border border-gray-200 rounded-sm p-5 hover:border-primary-200 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="h-10 w-10 rounded-sm bg-primary-50 text-primary-600 flex items-center justify-center">
                                {card.icon}
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{card.title}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{card.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Overview;
