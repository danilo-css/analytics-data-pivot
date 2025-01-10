import { create } from "zustand";

type RelationshipType = {
  primary_table: string;
  primary_key: string;
  foreign_table: string;
  foreign_key: string;
};

interface RelationalState {
  relationships: RelationshipType[];
  addRelationship: (relationship: RelationshipType) => void;
  removeRelationship: (index: number) => void;
  clearRelationships: () => void;
}

export const useRelationalStore = create<RelationalState>((set) => ({
  relationships: [],

  addRelationship: (relationship: RelationshipType) =>
    set((state) => ({
      relationships: [...state.relationships, relationship],
    })),

  removeRelationship: (index: number) =>
    set((state) => ({
      relationships: state.relationships.filter((_, i) => i !== index),
    })),

  clearRelationships: () =>
    set(() => ({
      relationships: [],
    })),
}));
