import type { DictionaryEntry } from '../types';
import './KindlePreview.css';

interface KindlePreviewProps {
  entries: DictionaryEntry[];
}

function KindlePreview({ entries }: KindlePreviewProps) {
  return (
    <div className="preview-panel">
      <h2>Vista Previa</h2>
      <div className="kindle-device">
        <div className="kindle-header">Kindle</div>
        <div className="kindle-screen">
          {entries.length === 0 ? (
            <div className="preview-empty">
              Ingresa palabras y definiciones para ver la vista previa...
            </div>
          ) : (
            entries.map((entry, index) => (
              <div key={index} className="entry">
                <div className="entry-word">{entry.word}</div>
                <div className="entry-definition">
                  {entry.definition.split('\n').filter(p => p.trim()).map((paragraph, pIndex) => (
                    <p key={pIndex}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default KindlePreview;
