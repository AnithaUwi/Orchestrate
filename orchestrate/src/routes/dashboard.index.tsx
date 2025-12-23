import { createRoute } from '@tanstack/react-router';
import { Route as dashboardRoute } from './dashboard';
import Overview from '../pages/dashboard/Overview';

export const Route = createRoute({
    getParentRoute: () => dashboardRoute,
    path: '/',
    component: Overview,
});
