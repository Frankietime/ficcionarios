/**
 * Individual fichero item with accordion expansion
 */
import { ChevronDown, ChevronRight, Trash2, ScrollText } from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import { useUiStore } from '../../stores/uiStore';
import { type Fichero } from '../../services/api';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Tooltip } from '../ui/tooltip';
import { TermsEditor } from './TermsEditor';
import { StorySelector } from './StorySelector';

interface FicheroItemProps {
  fichero: Fichero;
  index: number;
  /** Terms used in other entradas: term → { ficheroId, storyTitle } */
  usedTerms: Map<string, { ficheroId: number; storyTitle: string }>;
  /** Story IDs used in other entradas */
  usedStoryIds: Set<number>;
}

export function FicheroItem({ fichero, index, usedTerms, usedStoryIds }: FicheroItemProps) {
  const { updateFicheroLocal, deleteFichero } = useEditorStore();
  const {
    expandedFicheros,
    toggleFichero,
    openDeleteConfirm,
    closeDeleteConfirm,
    addToast,
  } = useUiStore();

  const isExpanded = expandedFicheros.has(fichero.id);
  const hasTerms = fichero.terms.length > 0;
  const hasStory = !!fichero.story;
  const isComplete = hasTerms && hasStory;
  const termsText = fichero.terms.map((t) => t.word).join(', ');

  const handleDelete = () => {
    openDeleteConfirm(
      'Delete Entrada',
      'Are you sure you want to delete this entrada? This action cannot be undone.',
      async () => {
        await deleteFichero(fichero.id);
        addToast('success', 'Entrada deleted');
        closeDeleteConfirm();
      }
    );
  };

  const handleTermsChange = (terms: string[]) => {
    updateFicheroLocal(fichero.id, { terms });
  };

  const handleStorySelect = (storyId: number) => {
    updateFicheroLocal(fichero.id, { storyId });
  };

  const displayTitle = fichero.story?.title || `Entrada #${index + 1}`;

  return (
    <Card data-fichero-id={fichero.id} className={`focus-within:border-8 focus-within:border-foreground transition-all ${isComplete ? 'border-green-500' : ''}`}>
      <CardHeader
        className="cursor-pointer select-none hover:bg-muted/50 transition-colors p-0 overflow-hidden"
        onClick={() => toggleFichero(fichero.id)}
      >
        <div className="flex items-stretch">
          {/* Left: index divider tab */}
          <div
            className="relative flex items-center gap-2 px-4 py-3 bg-main text-card-foreground font-bold"
            style={{ clipPath: 'polygon(0 0, 85% 0, 100% 100%, 0 100%)' }}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="truncate max-w-[200px] pr-4">{displayTitle}</span>
          </div>

          {/* Right: metadata */}
          <div className="flex-1 flex items-center justify-between px-4 py-3">
            <div className="text-sm text-muted-foreground flex items-center gap-2 min-w-0">
              <span className="flex-shrink-0">{fichero.terms.length} terms</span>
              {hasTerms && (
                <>
                  <span className="flex-shrink-0">•</span>
                  <Tooltip content={termsText}>
                    <span className="flex items-center gap-1 min-w-0 truncate max-w-[300px]">
                      <ScrollText className="w-3 h-3 flex-shrink-0" />
                      {termsText}
                    </span>
                  </Tooltip>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isComplete && (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-md font-medium">
                  Complete
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6 mt-6">
          {/* Terms */}
          <div className="space-y-2">
            <label className="text-base font-bold mb-1 block">Terms</label>
            <TermsEditor
              terms={fichero.terms.map((t) => t.word)}
              onChange={handleTermsChange}
              usedTerms={usedTerms}
            />
          </div>

          {/* Story */}
          <div className="space-y-2">
            <label className="text-base font-bold mb-1 block">Story (Definition)</label>
            <StorySelector
              selectedStoryId={fichero.storyId}
              selectedStory={fichero.story}
              onSelect={handleStorySelect}
              usedStoryIds={usedStoryIds}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
