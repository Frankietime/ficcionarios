/**
 * Toast notifications component
 */
import { Check, X, Info, AlertCircle } from 'lucide-react';
import { useUiStore, type Toast } from '../../stores/uiStore';

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useUiStore();

  const icons = {
    success: <Check className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const colors = {
    success: 'bg-green-100 border-green-500 text-green-800',
    error: 'bg-red-100 border-red-500 text-red-800',
    info: 'bg-blue-100 border-blue-500 text-blue-800',
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 border-2 rounded-lg shadow-[4px_4px_0_0_#000] ${colors[toast.type]}`}
    >
      {icons[toast.type]}
      <span className="font-medium flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={() => removeToast(toast.id)}
        className="p-1 hover:bg-black/10 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useUiStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
