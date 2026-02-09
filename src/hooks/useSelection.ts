import { useState } from 'react';
import type { SelectionState } from '../types';

export const useSelection = () => {
  const [selectionState, setSelectionState] = useState<SelectionState>({
    isSelectionMode: false,
    selectedIds: new Set(),
  });

  const enterSelectionMode = (initialId?: string) => {
    setSelectionState({
      isSelectionMode: true,
      selectedIds: initialId ? new Set([initialId]) : new Set(),
    });
  };

  const exitSelectionMode = () => {
    setSelectionState({
      isSelectionMode: false,
      selectedIds: new Set(),
    });
  };

  const toggleSelection = (id: string) => {
    setSelectionState((prev) => {
      const newSelectedIds = new Set(prev.selectedIds);
      if (newSelectedIds.has(id)) {
        newSelectedIds.delete(id);
      } else {
        newSelectedIds.add(id);
      }
      return {
        ...prev,
        selectedIds: newSelectedIds,
      };
    });
  };

  const isSelected = (id: string): boolean => {
    return selectionState.selectedIds.has(id);
  };

  const getSelectedCount = (): number => {
    return selectionState.selectedIds.size;
  };

  const getSelectedIds = (): string[] => {
    return Array.from(selectionState.selectedIds);
  };

  return {
    isSelectionMode: selectionState.isSelectionMode,
    selectedIds: selectionState.selectedIds,
    enterSelectionMode,
    exitSelectionMode,
    toggleSelection,
    isSelected,
    getSelectedCount,
    getSelectedIds,
  };
};
