/**
 * Story selector with search and upload
 */
import { useState, useEffect } from 'react';
import { Search, Upload, BookOpen, Check } from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import { useUiStore } from '../../stores/uiStore';
import { type Story } from '../../services/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { StoryUploadModal } from '../modals/StoryUploadModal';

interface StorySelectorProps {
  selectedStoryId: number | null;
  selectedStory: Story | null;
  onSelect: (storyId: number) => void;
  /** Story IDs already used in other entradas */
  usedStoryIds?: Set<number>;
}

export function StorySelector({
  selectedStoryId,
  selectedStory,
  onSelect,
  usedStoryIds,
}: StorySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const { stories, storiesLoading, loadStories } = useEditorStore();
  const { addToast } = useUiStore();

  // Load stories on mount and when search changes
  useEffect(() => {
    loadStories(searchQuery || undefined);
  }, [searchQuery, loadStories]);

  const handleSelectStory = (story: Story) => {
    onSelect(story.id);
    setIsFocused(false);
    addToast('success', `Selected "${story.title}"`);
  };

  const handleUploadComplete = (story: Story) => {
    onSelect(story.id);
    setShowUpload(false);
  };

  const filteredStories = searchQuery
    ? stories.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : stories;

  const showLibrary = isFocused || searchQuery.length > 0;

  return (
    <div className="space-y-4">
      {/* Current selection */}
      {selectedStory && (
        <div className="p-4 bg-muted rounded-lg border-2 border-main">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 font-bold">
                <BookOpen className="w-4 h-4" />
                {selectedStory.title}
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {selectedStory.content.substring(0, 150)}
                {selectedStory.content.length > 150 ? '...' : ''}
              </p>
            </div>
            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
          </div>
        </div>
      )}

      {/* Search and upload */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Search stories..."
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={() => setShowUpload(true)}>
          <Upload className="w-4 h-4" />
        </Button>
      </div>

      {/* Library */}
      {showLibrary && (
        <div className="border-2 border-border rounded-lg max-h-64 overflow-y-auto">
          {storiesLoading ? (
            <div className="p-4 text-center">
              <div className="w-6 h-6 border-2 border-border border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredStories.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No stories found. Upload one to get started.
            </div>
          ) : (
            <div className="divide-y-2 divide-border">
              {filteredStories.map((story) => {
                const isUsedElsewhere = usedStoryIds?.has(story.id) && story.id !== selectedStoryId;
                return (
                  <button
                    key={story.id}
                    type="button"
                    onClick={() => !isUsedElsewhere && handleSelectStory(story)}
                    disabled={!!isUsedElsewhere}
                    className={`w-full p-3 text-left transition-colors ${
                      isUsedElsewhere
                        ? 'opacity-40 cursor-not-allowed'
                        : 'hover:bg-muted'
                    } ${story.id === selectedStoryId ? 'bg-muted' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">
                        {story.title}
                        {isUsedElsewhere && (
                          <span className="ml-2 text-xs text-muted-foreground font-normal">(used)</span>
                        )}
                      </div>
                      {story.id === selectedStoryId && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                      {story.content.substring(0, 100)}...
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Upload modal */}
      <StoryUploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onComplete={handleUploadComplete}
      />
    </div>
  );
}
