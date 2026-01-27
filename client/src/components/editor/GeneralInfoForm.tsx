/**
 * General info form for ficcionario metadata
 * Tab key is trapped within this form's inputs.
 */
import { useRef, type KeyboardEvent } from 'react';
import { Info } from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tooltip } from '../ui/tooltip';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../ui/select';

function ShortcutsTooltipContent() {
  return (
    <div className="min-w-[240px]">
      <div className="font-bold text-sm border-b-2 border-border pb-2 mb-2">
        Keyboard Shortcuts
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-muted-foreground">
            <th className="text-left font-medium pb-1">Action</th>
            <th className="text-left font-medium pb-1">Windows</th>
            <th className="text-left font-medium pb-1">macOS</th>
          </tr>
        </thead>
        <tbody className="space-y-1">
          <tr>
            <td className="pr-4 py-0.5">Save</td>
            <td className="pr-4 py-0.5"><kbd className="px-1 py-0.5 border border-border rounded text-xs font-mono bg-muted">Ctrl+S</kbd></td>
            <td className="py-0.5"><kbd className="px-1 py-0.5 border border-border rounded text-xs font-mono bg-muted">&#8984;S</kbd></td>
          </tr>
          <tr>
            <td className="pr-4 py-0.5">Add Entrada</td>
            <td colSpan={2} className="py-0.5"><kbd className="px-1 py-0.5 border border-border rounded text-xs font-mono bg-muted">+</kbd></td>
          </tr>
          <tr>
            <td className="pr-4 py-0.5">Focus Title</td>
            <td colSpan={2} className="py-0.5"><kbd className="px-1 py-0.5 border border-border rounded text-xs font-mono bg-muted">Tab</kbd> <span className="text-muted-foreground text-xs">(outside form)</span></td>
          </tr>
          <tr>
            <td className="pr-4 py-0.5">Cycle fields</td>
            <td colSpan={2} className="py-0.5"><kbd className="px-1 py-0.5 border border-border rounded text-xs font-mono bg-muted">Tab</kbd> <span className="text-muted-foreground text-xs">(inside form)</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const LANGUAGE_OPTIONS = [
  { value: 'es-es', label: 'Spanish (es-es)' },
  { value: 'en-en', label: 'English (en-en)' },
];

export function GeneralInfoForm() {
  const { ficcionario, updateField } = useEditorStore();
  const formRef = useRef<HTMLDivElement>(null);

  if (!ficcionario) return null;

  const handleChange = (
    field: 'title' | 'version' | 'authors' | 'inLanguage' | 'outLanguage' | 'outputName' | 'copyright',
    value: string
  ) => {
    updateField(field, value);
  };

  // Trap Tab within form inputs
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !formRef.current) return;

    const focusable = formRef.current.querySelectorAll<HTMLElement>(
      'input, textarea, [role="combobox"]'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <Card data-general-info>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>General Information</CardTitle>
          <Tooltip
            content={
              <ShortcutsTooltipContent />
            }
          >
            <Info className="w-5 h-5 text-muted-foreground cursor-help" />
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={formRef} onKeyDown={handleKeyDown} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={ficcionario.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Dictionary title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="authors">Authors *</Label>
              <Input
                id="authors"
                value={ficcionario.authors || ''}
                onChange={(e) => handleChange('authors', e.target.value)}
                placeholder="Author name(s)"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={ficcionario.version}
                onChange={(e) => handleChange('version', e.target.value)}
                placeholder="1.0"
              />
            </div>

            <div className="space-y-2">
              <Label>Input Language</Label>
              <Select
                value={ficcionario.inLanguage}
                onValueChange={(v) => handleChange('inLanguage', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Output Language</Label>
              <Select
                value={ficcionario.outLanguage}
                onValueChange={(v) => handleChange('outLanguage', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="outputName">Output File Name *</Label>
            <Input
              id="outputName"
              value={ficcionario.outputName || ''}
              onChange={(e) => handleChange('outputName', e.target.value)}
              placeholder="my-dictionary"
            />
            <p className="text-xs text-muted-foreground">
              The name of the generated .mobi file (without extension)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="copyright">Copyright</Label>
            <Textarea
              id="copyright"
              value={ficcionario.copyright || ''}
              onChange={(e) => handleChange('copyright', e.target.value)}
              placeholder="Copyright notice (optional)"
              rows={2}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
