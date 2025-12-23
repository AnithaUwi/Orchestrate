import { createRoute } from '@tanstack/react-router';
import { Route as dashboardRoute } from './dashboard';
import Projects from '../pages/dashboard/Projects';

export const Route = createRoute({
    getParentRoute: () => dashboardRoute,
    path: '/projects',
    component: Projects,
});
