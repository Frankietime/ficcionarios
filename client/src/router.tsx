/**
 * React Router configuration
 */
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedLayout } from './components/layout/ProtectedLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { EditorPage } from './pages/EditorPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'ficcionario/new',
        element: <EditorPage />,
      },
      {
        path: 'ficcionario/:id',
        element: <EditorPage />,
      },
    ],
  },
]);
