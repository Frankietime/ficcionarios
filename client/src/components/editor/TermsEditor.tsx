/**
 * Terms editor with chip-based input
 */
import { useState, type KeyboardEvent } from 'react';
import { X, Plus, AlertCircle, ExternalLink } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useUiStore } from '../../stores/uiStore';

export interface UsedTermInfo {
  ficheroId: number;
  storyTitle: string;
}

interface TermsEditorProps {
  terms: string[];
  onChange: (terms: string[]) => void;
  /** Terms already used in other entradas: term → origin info */
  usedTerms?: Map<string, UsedTermInfo>;
}

export function TermsEditor({ terms, onChange, usedTerms }: TermsEditorProps) {
  const [inputValue, setInputValue] = useState('');
  const [dupeWarnings, setDupeWarnings] = useState<{ term: string; info: UsedTermInfo }[]>([]);

  const addTerm = (raw: string) => {
    const words = raw.split(/\s+/).map(w => w.trim()).filter(Boolean);
    if (words.length === 0) {
      setInputValue('');
      return;
    }
    const rejected: { term: string; info: UsedTermInfo }[] = [];
    const newTerms = [...terms];
    for (const word of words) {
      if (newTerms.includes(word)) continue;
      const info = usedTerms?.get(word);
      if (info) {
        rejected.push({ term: word, info });
        continue;
      }
      newTerms.push(word);
    }
    if (rejected.length > 0) {
      setDupeWarnings(rejected);
      setTimeout(() => setDupeWarnings([]), 5000);
    }
    onChange(newTerms);
    setInputValue('');
  };

  const removeTerm = (index: number) => {
    onChange(terms.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTerm(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && terms.length > 0) {
      removeTerm(terms.length - 1);
    }
  };

  const handleAddClick = () => {
    addTerm(inputValue);
  };

  const handleGoToEntrada = (ficheroId: number) => {
    // Expand the target entrada
    useUiStore.getState().expandFichero(ficheroId);

    // Scroll to it and focus its terms input
    requestAnimationFrame(() => {
      const card = document.querySelector(`[data-fichero-id="${ficheroId}"]`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Wait for scroll + expansion, then focus the terms input inside
        setTimeout(() => {
          const input = card.querySelector<HTMLInputElement>('input[placeholder="Type a term and press Enter"]');
          input?.focus();
        }, 300);
      }
    });
  };

  return (
    <div className="space-y-2">
      {/* Chips */}
      {terms.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {terms.map((term, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white rounded-md font-medium text-sm"
            >
              {term}
              <button
                type="button"
                onClick={() => removeTerm(index)}
                className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a term and press Enter"
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleAddClick}
          disabled={!inputValue.trim()}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {dupeWarnings.length > 0 && (
        <div className="text-xs text-red-600 space-y-1">
          {dupeWarnings.map(({ term, info }) => (
            <p key={term} className="flex items-center gap-1 flex-wrap">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              <span>
                <strong>"{term}"</strong> is already used in{' '}
                <button
                  type="button"
                  onClick={() => handleGoToEntrada(info.ficheroId)}
                  className="inline-flex items-center gap-0.5 underline font-medium hover:text-red-800 transition-colors"
                >
                  {info.storyTitle}
                  <ExternalLink className="w-3 h-3" />
                </button>
              </span>
            </p>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Press Enter or comma to add a term. Press Backspace to remove the last term.
      </p>
    </div>
  );
}
