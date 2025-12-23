import { createRoute } from '@tanstack/react-router';
import { Route as dashboardRoute } from './dashboard';
import AdminUsers from '../pages/dashboard/AdminUsers';

export const Route = createRoute({
    getParentRoute: () => dashboardRoute,
    path: '/users',
    component: AdminUsers,
});
