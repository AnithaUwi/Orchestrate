import { createRoute } from '@tanstack/react-router';
import { Route as dashboardRoute } from './dashboard';
import Workload from '../pages/dashboard/Workload';

export const Route = createRoute({
    getParentRoute: () => dashboardRoute,
    path: '/workload',
    component: Workload,
});
