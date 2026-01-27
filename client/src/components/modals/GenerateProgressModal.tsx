/**
 * Generation progress modal
 */
import { Loader2, Check, X, Download } from 'lucide-react';
import { useUiStore } from '../../stores/uiStore';
import { Button } from '../ui/button';

export function GenerateProgressModal() {
  const { generateProgressModal, closeGenerateProgress } = useUiStore();
  const { isOpen, status, error } = generateProgressModal;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={status !== 'generating' ? closeGenerateProgress : undefined}
      />

      {/* Modal */}
      <div className="relative bg-background border-4 border-black rounded-lg shadow-[8px_8px_0_0_#000] max-w-sm w-full mx-4 p-6 text-center">
        {status === 'generating' && (
          <>
            <div className="flex justify-center mb-4">
              <Loader2 className="w-12 h-12 animate-spin" />
            </div>
            <h3 className="text-xl font-bold">Generating Dictionary</h3>
            <p className="text-muted-foreground mt-2">
              Please wait while we create your .mobi file...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-green-100 rounded-full">
                <Check className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold">Success!</h3>
            <p className="text-muted-foreground mt-2">
              Your dictionary has been generated and downloaded.
            </p>
            <Button className="mt-4" onClick={closeGenerateProgress}>
              <Download className="w-4 h-4 mr-2" />
              Done
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-red-100 rounded-full">
                <X className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold">Generation Failed</h3>
            <p className="text-muted-foreground mt-2">
              {error || 'An error occurred while generating your dictionary.'}
            </p>
            <Button variant="outline" className="mt-4" onClick={closeGenerateProgress}>
              Close
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
