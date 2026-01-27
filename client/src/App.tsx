import { useState, useMemo } from 'react';
import KindlePreview from './components/KindlePreview';
import DefinitionGroup from './components/DefinitionGroup';
import { ThemeToggle } from './components/ThemeToggle';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Textarea } from './components/ui/textarea';
import { Label } from './components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import type { DictionaryConfig, DictionaryEntry } from './types';

function App() {
  const [config, setConfig] = useState<DictionaryConfig>({
    title: '',
    creator: '',
    inLanguage: 'es-es',
    outLanguage: 'es-es',
    version: '1.0',
    outputName: '',
    coverImage: null,
    copyright: '',
    usage: '',
    customStyles: '',
    definitionGroups: [
      { id: 1, words: '', definition: '' },
      { id: 2, words: '', definition: '' },
      { id: 3, words: '', definition: '' },
    ],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextGroupId, setNextGroupId] = useState(4);

  const previewEntries = useMemo<DictionaryEntry[]>(() => {
    const entries: DictionaryEntry[] = [];

    config.definitionGroups.forEach((group) => {
      const words = group.words.split(',').map(w => w.trim()).filter(w => w);
      const definition = group.definition.trim();

      if (words.length && definition) {
        words.forEach(word => {
          entries.push({ word, definition });
        });
      }
    });

    return entries;
  }, [config.definitionGroups]);

  const updateConfig = <K extends keyof DictionaryConfig>(key: K, value: DictionaryConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateDefinitionGroup = (id: number, field: 'words' | 'definition', value: string) => {
    setConfig(prev => ({
      ...prev,
      definitionGroups: prev.definitionGroups.map(group =>
        group.id === id ? { ...group, [field]: value } : group
      ),
    }));
  };

  const addDefinitionGroup = () => {
    setConfig(prev => ({
      ...prev,
      definitionGroups: [...prev.definitionGroups, { id: nextGroupId, words: '', definition: '' }],
    }));
    setNextGroupId(prev => prev + 1);
  };

  const removeDefinitionGroup = (id: number) => {
    setConfig(prev => ({
      ...prev,
      definitionGroups: prev.definitionGroups.filter(group => group.id !== id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', config.title);
      formData.append('creator', config.creator);
      formData.append('in_language', config.inLanguage);
      formData.append('out_language', config.outLanguage);
      formData.append('version', config.version);
      formData.append('output_name', config.outputName);
      formData.append('copyright', config.copyright);
      formData.append('usage', config.usage);
      formData.append('custom_styles', config.customStyles);

      if (config.coverImage) {
        formData.append('cover_image', config.coverImage);
      }

      config.definitionGroups.forEach(group => {
        formData.append('words[]', group.words);
        formData.append('definition[]', group.definition);
      });

      const response = await fetch('/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error generating dictionary');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.outputName}.mobi`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error generating dictionary');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <h1 className="text-xl font-semibold">Kindle Dictionary Generator</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="title">Dictionary Title *</Label>
                      <Input
                        id="title"
                        value={config.title}
                        onChange={(e) => updateConfig('title', e.target.value)}
                        required
                        placeholder="My Dictionary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="creator">Creator/Author *</Label>
                      <Input
                        id="creator"
                        value={config.creator}
                        onChange={(e) => updateConfig('creator', e.target.value)}
                        required
                        placeholder="Author Name"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="inLanguage">
                        Input Language
                        <span className="ml-1 text-xs text-muted-foreground">(e.g., es-es, en-us)</span>
                      </Label>
                      <Input
                        id="inLanguage"
                        value={config.inLanguage}
                        onChange={(e) => updateConfig('inLanguage', e.target.value)}
                        placeholder="es-es"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="outLanguage">
                        Output Language
                        <span className="ml-1 text-xs text-muted-foreground">(e.g., es-es, en-us)</span>
                      </Label>
                      <Input
                        id="outLanguage"
                        value={config.outLanguage}
                        onChange={(e) => updateConfig('outLanguage', e.target.value)}
                        placeholder="es-es"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="version">Version</Label>
                      <Input
                        id="version"
                        value={config.version}
                        onChange={(e) => updateConfig('version', e.target.value)}
                        placeholder="1.0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="outputName">Output Filename *</Label>
                      <Input
                        id="outputName"
                        value={config.outputName}
                        onChange={(e) => updateConfig('outputName', e.target.value)}
                        required
                        placeholder="my-dictionary"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Optional Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="coverImage">Cover Image</Label>
                    <Input
                      type="file"
                      id="coverImage"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => updateConfig('coverImage', e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="copyright">Copyright Text</Label>
                    <Textarea
                      id="copyright"
                      value={config.copyright}
                      onChange={(e) => updateConfig('copyright', e.target.value)}
                      rows={2}
                      placeholder="Copyright notice..."
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle>Definition Groups</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addDefinitionGroup}>
                    + Add Group
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {config.definitionGroups.map((group, index) => (
                    <DefinitionGroup
                      key={group.id}
                      group={group}
                      index={index}
                      onChange={updateDefinitionGroup}
                      onRemove={removeDefinitionGroup}
                      canRemove={config.definitionGroups.length > 1}
                    />
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Custom CSS Styles (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    id="customStyles"
                    value={config.customStyles}
                    onChange={(e) => updateConfig('customStyles', e.target.value)}
                    rows={3}
                    placeholder="/* Additional CSS styles */"
                    className="font-mono text-sm"
                  />
                </CardContent>
              </Card>

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Generating...' : 'Generate Dictionary'}
              </Button>
            </form>
          </div>

          <KindlePreview entries={previewEntries} />
        </div>
      </main>
    </div>
  );
}

export default App;
