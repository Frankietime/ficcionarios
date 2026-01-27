/**
 * Delete confirmation modal
 */
import { AlertTriangle } from 'lucide-react';
import { useUiStore } from '../../stores/uiStore';
import { Button } from '../ui/button';

export function DeleteConfirmModal() {
  const { deleteConfirmModal, closeDeleteConfirm } = useUiStore();
  const { isOpen, title, message, onConfirm } = deleteConfirmModal;

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={closeDeleteConfirm}
      />

      {/* Modal */}
      <div className="relative bg-background border-4 border-black rounded-lg shadow-[8px_8px_0_0_#000] max-w-md w-full mx-4 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 rounded-full flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-muted-foreground mt-2">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={closeDeleteConfirm}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
