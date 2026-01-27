/**
 * Main App component with router
 */
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { DeleteConfirmModal } from './components/modals/DeleteConfirmModal';
import { GenerateProgressModal } from './components/modals/GenerateProgressModal';
import { ToastContainer } from './components/ui/toast';

function App() {
  return (
    <>
      <RouterProvider router={router} />

      {/* Global modals */}
      <DeleteConfirmModal />
      <GenerateProgressModal />

      {/* Toast notifications */}
      <ToastContainer />
    </>
  );
}

export default App;
