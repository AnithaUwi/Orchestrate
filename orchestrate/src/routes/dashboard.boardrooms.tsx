import { createRoute } from '@tanstack/react-router';
import { Route as dashboardRoute } from './dashboard';
import Boardrooms from '../pages/dashboard/Boardrooms';

export const Route = createRoute({
    getParentRoute: () => dashboardRoute,
    path: '/boardrooms',
    component: Boardrooms,
});
