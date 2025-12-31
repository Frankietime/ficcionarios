import type { DictionaryEntry } from '../types';

interface KindlePreviewProps {
  entries: DictionaryEntry[];
}

function KindlePreview({ entries }: KindlePreviewProps) {
  return (
    <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
      <h2 className="mb-4 text-lg font-semibold">Preview</h2>
      <div className="mx-auto w-full max-w-[300px] overflow-hidden rounded-[2rem] bg-[#1a1a1a] p-3 shadow-2xl">
        <div className="mb-2 text-center text-xs font-light tracking-widest text-gray-400">
          kindle
        </div>
        <div className="h-[450px] overflow-y-auto rounded-sm bg-[#f8f6e8] p-4">
          {entries.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center text-sm text-gray-500">
              Enter words and definitions to see a preview...
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry, index) => (
                <div key={index} className="border-b border-gray-200 pb-3 last:border-0">
                  <div className="mb-1 text-base font-bold text-[#1a1a1a]">
                    {entry.word}
                  </div>
                  <div className="text-sm leading-relaxed text-[#333]">
                    {entry.definition.split('\n').filter(p => p.trim()).map((paragraph, pIndex) => (
                      <p key={pIndex} className="mb-1 last:mb-0">{paragraph}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default KindlePreview;
