import type { INote } from "../types.ts";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// TODO: Mock API responses
export const mockApi = {
  async saveNotes(
    notes: INote[],
  ): Promise<{ success: boolean; message: string }> {
    await delay(Math.random() * 500);
    console.log("[Mock API]: Saved", notes);
    return {
      success: true,
      message: "Notes saved successfully",
    };
  },

  async loadNotes(): Promise<INote[]> {
    await delay(Math.random() * 500);
    console.log("[Mock API]: Loaded");
    return [];
  },
};
