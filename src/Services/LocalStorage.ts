import type { INote } from "../types.ts";

const STORAGE_KEY = "sticky-notes";

export const saveNotes = (notes: INote[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error("Failed to save notes to localStorage:", error);
  }
};

export const loadNotes = (): INote[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load notes from localStorage:", error);
    return [];
  }
};

export const clearNotes = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear notes from localStorage:", error);
  }
};
