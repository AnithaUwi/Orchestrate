import { createRoute } from '@tanstack/react-router';
import { Route as dashboardRoute } from './dashboard';
import Tasks from '../pages/dashboard/Tasks';

export const Route = createRoute({
    getParentRoute: () => dashboardRoute,
    path: '/tasks',
    component: Tasks,
});
