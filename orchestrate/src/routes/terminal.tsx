import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import BoardroomTerminal from '../pages/public/BoardroomTerminal';

export const Route = createRoute({
    getParentRoute: () => rootRoute,
    path: '/terminal',
    component: BoardroomTerminal,
});
