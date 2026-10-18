import { useState } from 'react';
import { FolderOpen, Trash2, GripVertical, Check, X } from 'lucide-react';
import { GENERAL_MODULE_ID } from './moduleModel';
import type { Module } from './moduleModel';

interface ModuleCardProps {
  module: Module;
  onEnter: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  isDragging: boolean;
  isDragOver: boolean;
}

const ModuleCard = ({
  module,
  onEnter,
  onRename,
  onDelete,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragging,
  isDragOver,
}: ModuleCardProps) => {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(module.name);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isGeneral = module.id === GENERAL_MODULE_ID;
  const fieldCount = module.fields.length;

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDraftName(module.name);
    setEditing(true);
  };

  const saveName = () => {
    const name = draftName.trim();
    if (name && name !== module.name) {
      onRename(name);
    }
    setEditing(false);
  };

  const cancelEdit = () => {
    setDraftName(module.name);
    setEditing(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDelete(true);
  };

  const confirmModuleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      draggable={!isGeneral && !editing}
      onDragStart={!isGeneral && !editing ? (e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart(); } : undefined}
      onDragEnd={onDragEnd}
      onDragOver={isGeneral ? undefined : onDragOver}
      onDrop={isGeneral ? undefined : onDrop}
      onClick={!editing ? onEnter : undefined}
      className={`
        group relative bg-white dark:bg-slate-800 border rounded-xl p-5 transition-all cursor-pointer
        ${isDragging
          ? 'opacity-50 ring-2 ring-blue-400 border-blue-300 dark:border-blue-600 shadow-lg'
          : isDragOver
            ? 'border-t-2 border-t-blue-500 border-slate-200 dark:border-slate-700'
            : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md'
        }
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {!isGeneral && (
            <span className="shrink-0 text-slate-300 dark:text-slate-600 cursor-grab active:cursor-grabbing group-hover:text-slate-400 dark:group-hover:text-slate-500 transition-colors">
              <GripVertical size={18} />
            </span>
          )}
          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
            <FolderOpen size={20} />
          </div>
          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveName();
                    if (e.key === 'Escape') cancelEdit();
                  }}
                  autoFocus
                  className="w-full px-2 py-1 border border-blue-400 rounded-lg text-sm font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={saveName}
                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg shrink-0"
                  title="Guardar nombre"
                >
                  <Check size={16} />
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg shrink-0"
                  title="Cancelar"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate">{module.name}</h3>
                {!isGeneral && (
                  <button
                    type="button"
                    onClick={startEdit}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-all shrink-0 text-xs font-medium"
                    title="Renombrar módulo"
                  >
                    ✎
                  </button>
                )}
              </div>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {fieldCount} campo(s)
            </p>
          </div>
        </div>
        {!isGeneral && !editing && (
          confirmDelete ? (
            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={confirmModuleDelete}
                className="px-2 py-1 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Borrar
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg"
              >
                No
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0"
              title="Eliminar módulo y sus campos"
            >
              <Trash2 size={16} />
            </button>
          )
        )}
      </div>
      <div className="mt-4 text-xs text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Entrar al módulo →
      </div>
    </div>
  );
};

export default ModuleCard;
