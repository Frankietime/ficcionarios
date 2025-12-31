import type { DefinitionGroup as DefinitionGroupType } from '../types';
import './DefinitionGroup.css';

interface DefinitionGroupProps {
  group: DefinitionGroupType;
  index: number;
  onChange: (id: number, field: 'words' | 'definition', value: string) => void;
  onRemove: (id: number) => void;
  canRemove: boolean;
}

function DefinitionGroup({ group, index, onChange, onRemove, canRemove }: DefinitionGroupProps) {
  return (
    <fieldset className="definition-group">
      <legend>
        Grupo {index + 1}
        {canRemove && (
          <button
            type="button"
            className="remove-btn"
            onClick={() => onRemove(group.id)}
          >
            Eliminar
          </button>
        )}
      </legend>
      <div className="form-field">
        <label>
          <strong>Palabras (separadas por coma):</strong>
        </label>
        <input
          type="text"
          value={group.words}
          onChange={(e) => onChange(group.id, 'words', e.target.value)}
          placeholder="luna, lunar, lunatico"
        />
      </div>
      <div className="form-field">
        <label>
          <strong>Definicion:</strong>
        </label>
        <textarea
          value={group.definition}
          onChange={(e) => onChange(group.id, 'definition', e.target.value)}
          rows={5}
          placeholder="Texto de la definicion..."
        />
      </div>
    </fieldset>
  );
}

export default DefinitionGroup;
