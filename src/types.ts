export interface INote {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  text?: string;
  color?: string;
}

export const ModeType = {
  IDLE: "IDLE",
  ADDING: "ADDING",
  DRAGGING: "DRAGGING",
  OVER_TRASH: "OVER_TRASH",
} as const;

export type ModeType = (typeof ModeType)[keyof typeof ModeType];
