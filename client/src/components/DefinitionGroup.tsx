import { Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import type { DefinitionGroup as DefinitionGroupType } from '../types';

interface DefinitionGroupProps {
  group: DefinitionGroupType;
  index: number;
  onChange: (id: number, field: 'words' | 'definition', value: string) => void;
  onRemove: (id: number) => void;
  canRemove: boolean;
}

function DefinitionGroup({ group, index, onChange, onRemove, canRemove }: DefinitionGroupProps) {
  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Group {index + 1}
        </span>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onRemove(group.id)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remove group</span>
          </Button>
        )}
      </div>
      <div className="space-y-3">
        <div className="space-y-2">
          <Label className="text-sm">Words (comma-separated)</Label>
          <Input
            value={group.words}
            onChange={(e) => onChange(group.id, 'words', e.target.value)}
            placeholder="moon, lunar, moonlit"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Definition</Label>
          <Textarea
            value={group.definition}
            onChange={(e) => onChange(group.id, 'definition', e.target.value)}
            rows={4}
            placeholder="Enter the definition text..."
          />
        </div>
      </div>
    </div>
  );
}

export default DefinitionGroup;
