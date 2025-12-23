import React from 'react';
import {
  createRouter,
  RouterProvider
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route as rootRoute } from './routes/__root';
import { Route as indexRoute } from './routes/index';
import { Route as loginRoute } from './routes/login';
import { Route as dashboardRoute } from './routes/dashboard';
import { Route as dashboardIndexRoute } from './routes/dashboard.index';
import { Route as workloadRoute } from './routes/dashboard.workload';
import { Route as tasksRoute } from './routes/dashboard.tasks';
import { Route as projectsRoute } from './routes/dashboard.projects';
import { Route as boardroomsRoute } from './routes/dashboard.boardrooms';
import { Route as usersRoute } from './routes/dashboard.users';
import { Route as terminalRoute } from './routes/terminal';

// Assemble the route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  terminalRoute,
  dashboardRoute.addChildren([
    dashboardIndexRoute,
    workloadRoute,
    tasksRoute,
    projectsRoute,
    boardroomsRoute,
    usersRoute
  ])
]);

// Create the router
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;