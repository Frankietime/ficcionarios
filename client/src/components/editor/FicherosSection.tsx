/**
 * Container for ficheros with accordion behavior.
 * Uses min-height to prevent layout shift when filtering/collapsing.
 */
import { useState, useMemo, useRef, useEffect } from 'react';
import { useEditorStore } from '../../stores/editorStore';
import { useUiStore } from '../../stores/uiStore';
import { FicheroItem } from './FicheroItem';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../ui/select';
import { FileText, ChevronsDownUp, ChevronsUpDown, Search, X } from 'lucide-react';

type FilterMode = 'terms' | 'stories';

export function FicherosSection() {
  const { ficcionario } = useEditorStore();
  const { expandedFicheros, expandAllFicheros, collapseAllFicheros } = useUiStore();
  const [filterText, setFilterText] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('terms');
  const [minHeight, setMinHeight] = useState<number | undefined>(undefined);
  const listRef = useRef<HTMLDivElement>(null);

  // Track max observed height to prevent layout shift
  useEffect(() => {
    if (!listRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = entry.contentRect.height;
        setMinHeight((prev) => (prev === undefined || h > prev ? h : prev));
      }
    });
    observer.observe(listRef.current);
    return () => observer.disconnect();
  }, []);

  const ficheros = ficcionario?.ficheros ?? [];

  const filteredFicheros = useMemo(() => {
    if (!filterText.trim()) return ficheros;
    const query = filterText.toLowerCase();
    return ficheros.filter((f) => {
      if (filterMode === 'terms') {
        return f.terms.some((t) => t.word.toLowerCase().includes(query));
      }
      return f.story?.title.toLowerCase().includes(query) ?? false;
    });
  }, [ficheros, filterText, filterMode]);

  if (!ficcionario) return null;

  if (ficheros.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-muted rounded-full">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
          <p className="text-muted-foreground">
            No entradas yet. Add one to start defining terms.
          </p>
        </CardContent>
      </Card>
    );
  }

  const allExpanded = filteredFicheros.length > 0 && filteredFicheros.every((f) => expandedFicheros.has(f.id));
  const hasFilter = filterText.trim().length > 0;

  const handleToggleAll = () => {
    if (allExpanded) {
      collapseAllFicheros();
    } else {
      expandAllFicheros(filteredFicheros.map((f) => f.id));
    }
  };

  const handleClearFilter = () => {
    setFilterText('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleToggleAll} title={allExpanded ? 'Collapse all' : 'Expand all'}>
          {allExpanded ? <ChevronsDownUp className="w-4 h-4" /> : <ChevronsUpDown className="w-4 h-4" />}
        </Button>

        <div className="flex-1 relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter by..."
            className="pl-8 pr-8 h-9"
          />
          {hasFilter && (
            <button
              type="button"
              onClick={handleClearFilter}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <Select value={filterMode} onValueChange={(v) => setFilterMode(v as FilterMode)}>
          <SelectTrigger className="w-[110px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="terms">Terms</SelectItem>
            <SelectItem value="stories">Stories</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div ref={listRef} style={{ minHeight }} className="space-y-4">
        {filteredFicheros.map((fichero, index) => {
          // Compute terms used in OTHER entradas: term → { ficheroId, storyTitle }
          const usedTerms = new Map<string, { ficheroId: number; storyTitle: string }>();
          for (const other of ficheros) {
            if (other.id === fichero.id) continue;
            const title = other.story?.title || `Entrada #${ficheros.indexOf(other) + 1}`;
            for (const t of other.terms) usedTerms.set(t.word, { ficheroId: other.id, storyTitle: title });
          }
          // Compute story IDs used in OTHER entradas
          const usedStoryIds = new Set<number>();
          for (const other of ficheros) {
            if (other.id === fichero.id) continue;
            if (other.storyId) usedStoryIds.add(other.storyId);
          }
          return (
            <FicheroItem key={fichero.id} fichero={fichero} index={index} usedTerms={usedTerms} usedStoryIds={usedStoryIds} />
          );
        })}

        {hasFilter && filteredFicheros.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            No entradas match your filter.
          </p>
        )}
      </div>
    </div>
  );
}
