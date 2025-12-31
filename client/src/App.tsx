import { useState, useMemo } from 'react';
import KindlePreview from './components/KindlePreview';
import DefinitionGroup from './components/DefinitionGroup';
import type { DictionaryConfig, DictionaryEntry } from './types';
import './App.css';

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

  // Compute preview entries from definition groups
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

      // Download the file
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
    <div className="app">
      <h1>Generador de Diccionarios Kindle</h1>

      <div className="container">
        <div className="form-panel">
          <form onSubmit={handleSubmit}>
            <fieldset>
              <legend>Informacion Basica</legend>

              <div className="form-field">
                <label htmlFor="title"><strong>Titulo del diccionario:</strong></label>
                <input
                  type="text"
                  id="title"
                  value={config.title}
                  onChange={(e) => updateConfig('title', e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="creator"><strong>Creador/Autor:</strong></label>
                <input
                  type="text"
                  id="creator"
                  value={config.creator}
                  onChange={(e) => updateConfig('creator', e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="inLanguage">
                  <strong>Idioma de entrada:</strong>
                  <span className="hint">(ej: es-es, en-us, pt-br)</span>
                </label>
                <input
                  type="text"
                  id="inLanguage"
                  value={config.inLanguage}
                  onChange={(e) => updateConfig('inLanguage', e.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="outLanguage">
                  <strong>Idioma de salida:</strong>
                  <span className="hint">(ej: es-es, en-us, pt-br)</span>
                </label>
                <input
                  type="text"
                  id="outLanguage"
                  value={config.outLanguage}
                  onChange={(e) => updateConfig('outLanguage', e.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="version"><strong>Version:</strong></label>
                <input
                  type="text"
                  id="version"
                  value={config.version}
                  onChange={(e) => updateConfig('version', e.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="outputName"><strong>Nombre del archivo:</strong></label>
                <input
                  type="text"
                  id="outputName"
                  value={config.outputName}
                  onChange={(e) => updateConfig('outputName', e.target.value)}
                  required
                />
              </div>
            </fieldset>

            <fieldset>
              <legend>Contenido Opcional</legend>

              <div className="form-field">
                <label htmlFor="coverImage"><strong>Imagen de portada:</strong></label>
                <input
                  type="file"
                  id="coverImage"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => updateConfig('coverImage', e.target.files?.[0] || null)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="copyright"><strong>Texto de Copyright:</strong></label>
                <textarea
                  id="copyright"
                  value={config.copyright}
                  onChange={(e) => updateConfig('copyright', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="form-field">
                <label htmlFor="usage"><strong>Texto de Uso/Instrucciones:</strong></label>
                <textarea
                  id="usage"
                  value={config.usage}
                  onChange={(e) => updateConfig('usage', e.target.value)}
                  rows={3}
                />
              </div>
            </fieldset>

            <fieldset>
              <legend>Grupos de Definiciones</legend>

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

              <button type="button" className="add-group-btn" onClick={addDefinitionGroup}>
                + Agregar Grupo
              </button>
            </fieldset>

            <fieldset>
              <legend>Estilos CSS Personalizados (opcional)</legend>
              <textarea
                id="customStyles"
                value={config.customStyles}
                onChange={(e) => updateConfig('customStyles', e.target.value)}
                rows={3}
                placeholder="/* Estilos CSS adicionales */"
              />
            </fieldset>

            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Generando...' : 'Generar Diccionario'}
            </button>
          </form>
        </div>

        <KindlePreview entries={previewEntries} />
      </div>
    </div>
  );
}

export default App;
