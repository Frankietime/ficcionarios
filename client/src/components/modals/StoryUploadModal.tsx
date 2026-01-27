/**
 * Story upload modal with duplicate detection
 */
import { useState } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import { useUiStore } from '../../stores/uiStore';
import { type Story } from '../../services/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface StoryUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (story: Story) => void;
}

export function StoryUploadModal({
  isOpen,
  onClose,
  onComplete,
}: StoryUploadModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicate, setDuplicate] = useState<{
    story: Story;
    message: string;
  } | null>(null);

  const { createStory } = useEditorStore();
  const { addToast } = useUiStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setDuplicate(null);

    try {
      const result = await createStory(title.trim(), content.trim());

      if (result.isDuplicate) {
        setDuplicate({
          story: result.story,
          message: `This content already exists as "${result.story.title}"`,
        });
      } else {
        addToast('success', 'Story created successfully');
        onComplete(result.story);
        resetForm();
      }
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to create story');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseDuplicate = () => {
    if (duplicate) {
      onComplete(duplicate.story);
      resetForm();
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setDuplicate(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-background border-4 border-black rounded-lg shadow-[8px_8px_0_0_#000] max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b-4 border-black px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Story
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {duplicate && (
            <div className="p-4 bg-yellow-50 border-2 border-yellow-500 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-800">{duplicate.message}</p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleUseDuplicate}
                    >
                      Use Existing
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDuplicate(null)}
                    >
                      Edit Content
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="story-title">Title *</Label>
            <Input
              id="story-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Story title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="story-content">Content *</Label>
            <Textarea
              id="story-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste or type the story content..."
              rows={10}
              required
            />
            <p className="text-xs text-muted-foreground">
              This content will be used as the definition for linked terms.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim() || !content.trim()}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </span>
              ) : (
                'Upload'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
